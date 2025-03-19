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

  console.time('loginRequest');
  console.log(`${new Date().toISOString()} - Login request received for email: ${email}`);

  try {
    console.time('firebaseGetUserByEmail');
    console.log(`${new Date().toISOString()} - Fetching user from Firebase Auth for email: ${email}`);
    const userRecord = await admin.auth().getUserByEmail(email);
    console.timeEnd('firebaseGetUserByEmail');
    console.log(`${new Date().toISOString()} - Fetched user from Firebase Auth`);
    const firebaseUID = userRecord.uid;

    console.time('dbQuery');
    console.log(`${new Date().toISOString()} - Starting database query: SELECT * FROM users WHERE firebase_uid = ${firebaseUID}`);
    const result = await pool.query("SELECT * FROM users WHERE firebase_uid = $1", [firebaseUID]);
    console.timeEnd('dbQuery');
    console.log(`${new Date().toISOString()} - Database query completed`);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found in database" });
    }

    console.time('jwtSign');
    console.log(`${new Date().toISOString()} - Signing JWT token`);
    const jwtToken = sign({ uid: firebaseUID }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.timeEnd('jwtSign');
    console.log(`${new Date().toISOString()} - JWT token signed`);

    console.log(`${new Date().toISOString()} - Login successful`);
    res.json({ message: "Login successful", jwt: jwtToken });

  } catch (error) {
    console.error(`${new Date().toISOString()} - Login Error:`, error.message);
    res.status(401).json({ error: "Invalid email or password" });
  } finally {
    console.timeEnd('loginRequest');
    console.log(`${new Date().toISOString()} - Login request processing finished`);
  }
});


module.exports = router;
