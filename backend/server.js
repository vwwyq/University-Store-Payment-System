import { config } from "dotenv";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken"
import admin from "firebase-admin";
import { pool } from "./db.js";
import https from "https";
import fs from "fs";
import cookieParser from "cookie-parser";
import { WebSocket, WebSocketServer } from "ws";
import http from "http";
import mongoose from "mongoose";
import {Message} from "./models/Message.js";

const { sign } = jwt;

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./firebase-admin-sdk.json", import.meta.url), "utf-8")
);

import walletRoutes from "./routes/wallet.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import messageRoutes from "./routes/messages.js";


if (!process.env.JWT_SECRET) {
  console.error("ERROR: Missing JWT_SECRET in .env file");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  httpAgent: new https.Agent({ keepAlive: true, timeout: 60000 })
});

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.set("wss", wss);

wss.on("connection", (ws, req) => {
  console.log("WebSocket client connected");

  // Optional: assign an ID to each connected client
  ws.userId = null;

  const authTimeout = setTimeout(() => {
    if (!ws.userId) {
      console.log("Client failed to authenticate within timeout period");
      ws.send(JSON.stringify({
        type: "auth_required",
        message: "Authentication timeout"
      }));
      // Don't close immediately, give client a chance to authenticate
    }
  }, 10000); // 10 seconds auth timeout

  ws.on("message", async (data) => {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.type === "auth") {
        const token = parsed.token;
        try {

          
          console.log("Authenticating WebSocket with token:", token ? `${token.substring(0, 10)}...` : "missing");
          
          if (!token) {
            throw new Error("No token provided");
          } 

          const verified = jwt.verify(token, process.env.JWT_SECRET);
          
          const userCheck = await pool.query(
            "SELECT id FROM users WHERE id = $1 AND firebase_uid = $2",
            [verified.id, verified.uid]
          );
          if (userCheck.rowCount === 0) {
            throw new Error("User not found");
          }

          ws.userId = verified.uid; // Store uid for sender tracking
          console.log("User authenticated for WebSocket:", ws.userId);
          clearTimeout(authTimeout);
          // Send acknowledgment back to client
          ws.send(JSON.stringify({
            type: "auth_success",
            userId: ws.userId
          }));
        } catch (err) {
          console.error("WebSocket auth error:", err);
          ws.send(JSON.stringify({
            type: "auth_error",
            message: "Authentication failed"
          }));
        }
        return;
      }
      if (!ws.userId) {
        console.error("Unauthenticated message rejected");
        ws.send(JSON.stringify({
          type: "auth_required",
          message: "Please authenticate first"
        }));
        return;
      }

      if (parsed.type === "message" && ws.userId) {
        const { receiverId, content } = parsed;

        const newMessage = new Message({
          senderId: ws.userId,
          receiverId,
          content,
        });

        await newMessage.save();
        console.log("Message saved:", newMessage);

        // Broadcast to receiver if they are online
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN && client.userId === receiverId) {
            client.send(JSON.stringify({
              type: "message",
              from: ws.userId,
              content,
              timestamp: newMessage.timestamp
            }));
          }
        });
        
        // Send acknowledgment back to sender
        ws.send(JSON.stringify({
          type: "message_sent",
          messageId: newMessage._id,
          timestamp: newMessage.timestamp
        }));
      }
    } catch (err) {
      console.error("WebSocket error:", err);
      ws.send(JSON.stringify({
        type: "error",
        message: "Error processing message"
      }));
    }
  });

  ws.on("close", () => {
    console.log("WebSocket client disconnected");
  });
  
  // Keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000);
  
  ws.on("pong", () => {
    // console.log("Received pong from client");
  });
});

app.use("/wallet", walletRoutes);
app.use("/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/messages", messageRoutes);


app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected!", time: result.rows[0].now });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB!");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

app.get("/", (req, res) => {
  res.send("API is running");
});

// IMPORTANT: Use 'server' instead of 'app' to start the server
// This ensures WebSocket and HTTP share the same port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));