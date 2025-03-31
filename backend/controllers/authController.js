import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { query, pool } from "../db.js";
import admin from "firebase-admin";
import cookie from "cookie";


export const login = async (req, res) => {
  console.log("Login request received", req.body);
  const { email, password } = req.body;

  try {
    // Update this query to also retrieve the firebase_uid
    const { rows, rowCount } = await pool.query(
      "SELECT id, password, firebase_uid FROM users WHERE email = $1",
      [email]
    );

    if (rowCount === 0) return res.status(400).json({ error: "Invalid credentials" });

    const { id, password: hashedPassword, firebase_uid } = rows[0];

    const validPassword = await bcrypt.compare(password, hashedPassword);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    if (!process.env.JWT_SECRET) {
      console.error("JWT Secret is not set in environment variables.");
      return res.status(500).json({ error: "Internal server error" });
    }

    // Include the firebase_uid in the token
    const token = jwt.sign({ id: id, uid: firebase_uid }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.setHeader("Set-Cookie", `jwtToken=${token}; HttpOnly; Path=/; Max-Age=3600; SameSite=Strict`);

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signup = async (req, res) => {
  console.log("Signup request received", req.body);
  const { email, password, token, firstname, lastname } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: "Missing Firebase token" });
    }

    console.log("Received token:", token);

    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebase_uid = decodedToken.uid;

    const hashedPassword = await bcrypt.hash(password, 12);
    let newUser;

    try {
      newUser = await pool.query(
        "INSERT INTO users (firebase_uid, email, password, firstname, lastname) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [firebase_uid, email, hashedPassword, firstname, lastname]
      );
    } catch (err) {
      console.error("Error creating user:", err.code, err.detail);
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const jwtToken = jwt.sign({ uid: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully", jwtToken });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
