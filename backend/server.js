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

const { sign } = jwt;

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./firebase-admin-sdk.json", import.meta.url), "utf-8")
);

import walletRoutes from "./routes/wallet.js";
import authRoutes from "./routes/auth.js";

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
wss.on("connection", (ws) => {
  console.log("New client connected");

  wss.on("message", (message) => {
    console.log("Received:", message);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send("New client connected");
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

app.use("/wallet", walletRoutes);
app.use("/auth", authRoutes);

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected!", time: result.rows[0].now });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
