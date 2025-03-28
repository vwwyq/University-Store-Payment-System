import { Router } from "express";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "../db.js";

const result = await pool.query("SELECT * FROM users");

const { auth } = admin;
const { sign } = jwt;

const router = Router();

router.post("/signup", async (req, res) => {
  const { uid, firstName, lastName, email, university, password } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });

  const hashedPassword = await bcrypt.hash(password, 12);
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters long" });
  try {

    await pool.query(
      "INSERT INTO users (firebase_uid, firstName, lastName, email, university, password, wallet_balance) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [uid, firstName, lastName, email, university, hashedPassword, 0]
    );

    res.status(201).json({ message: "User created successfully", uid });
  } catch (error) {
    console.error("Firebase User Creation Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    const firebaseUID = userRecord.uid;

    const result = await pool.query("SELECT * FROM users WHERE firebase_uid = $1", [firebaseUID]);

    if (result.rows.length === 0) {
      const { displayName, email } = userRecord;
      const [firstName, lastName] = displayName ? displayName.split(" ") : ["", ""];

      await pool.query(
        "INSERT INTO users (firebase_uid, firstName, lastName, email, university, password, wallet_balance) VALUES ($1, $2, $3, $4, $5, $6)",
        [firebaseUID, firstName, lastName, email, university, password, 0]
      );
    }

    const jwtToken = sign({ uid: firebaseUID }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.json({ message: "Login successful" });

  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
