const express = require("express");
const { sign } = require("jsonwebtoken");
const admin = require("firebase-admin");

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ error: "Email is required" });
  if (!password) return res.status(400).json({ error: "Password is required" });

  try {
    const userRecord = await admin.auth().createUser({ email, password });
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

  let uid;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    uid = userRecord.uid;
  } catch (error) {
    console.error("Error fetching user by email:", error.message);
    return res.status(401).json({ error: "Invalid email or password" });
  }

  try {
    const customToken = await admin.auth().createCustomToken(uid);
    const jwtToken = sign({ uid }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ firebaseToken: customToken, jwt: jwtToken });
  } catch (error) {
    console.error("Error creating tokens:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.post("/google-login", async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "ID Token is required" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    if (!email.endsWith("@kiit.ac.in")) {
      return res.status(403).json({ error: "Access denied. KIIT Email only" });
    }

    const jwtToken = sign({ uid }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ jwt: jwtToken });
  } catch (error) {
    console.error("Google login error:", error.message);
    res.status(401).json({ error: "Invalid Google Token" });
  }
});

module.exports = router;
