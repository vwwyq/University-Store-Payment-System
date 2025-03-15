const express = require("express");
const { sign } = require("jsonwebtoken");
const admin = require("firebase-admin");
const pool = require("../db");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });
  try {
    const userRecord = await admin.auth().createUser({ email, password });

    await pool.query(
      "INSERT INTO users (firebase_uid, email, wallet_balance) VALUES ($1, $2, $3)",
      [userRecord.uid, email, 0]
    );

    res.status(201).json({ message: "User created successfully", uid: userRecord.uid });
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
      return res.status(401).json({ error: "User not found in database" });
    }

    const jwtToken = sign({ uid: firebaseUID }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", jwt: jwtToken });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(401).json({ error: "Invalid email or password" });
  }
});


module.exports = router;
