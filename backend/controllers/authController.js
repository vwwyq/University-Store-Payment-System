import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { query, pool } from "../db.js";
import admin from "firebase-admin";

export const login = async (req, res) => {
  console.log("Login request received", req.body);
  const { email, password } = req.body;

  try {
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
    const token = jwt.sign({ id, uid: firebase_uid }, process.env.JWT_SECRET, { expiresIn: "7d" }); // Extended token lifetime to 7 days

    // Set cookie with correct settings
    res.cookie('jwtToken', token, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',  // 'none' would require secure: true but won't work on localhost
      secure: process.env.NODE_ENV === 'production',
    });

    // Return token in response body as well for WebSocket auth
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login error: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const signup = async (req, res) => {
  console.log("Signup request received", req.body);
  const { email, password, token, firstname, lastname, university } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: "Missing Firebase token" });
    }

    console.log("Received token:", token);

    const decodedToken = await admin.auth().verifyIdToken(token);
    const firebase_uid = decodedToken.uid;

    // Check if user already exists in your database
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = $1 OR email = $2",
      [firebase_uid, email]
    );

    if (existingUser.rowCount > 0) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Store university information if provided
    const newUser = await pool.query(
      "INSERT INTO users (firebase_uid, email, password, firstname, lastname, university) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, firebase_uid",
      [firebase_uid, email, hashedPassword, firstname, lastname, university || null]
    );

    // Create JWT with the correct user information
    const userId = newUser.rows[0].id;
    const jwtToken = jwt.sign({ 
      id: userId, 
      uid: firebase_uid 
    }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // Set cookie
    res.cookie('jwtToken', jwtToken, {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(201).json({ message: "User registered successfully", token: jwtToken });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    // Check if the user is authenticated via middleware
    const token = req.cookies.jwtToken;
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    try {
      // Verify the existing token
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      
      // Create a new token
      const newToken = jwt.sign(
        { id: verified.id, uid: verified.uid },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );
      
      // Set the new token as a cookie
      res.cookie('jwtToken', newToken, {
        httpOnly: true,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
      
      // Return the token in the response body for WebSocket
      return res.json({ token: newToken });
    } catch (err) {
      console.error("Token refresh error:", err);
      return res.status(403).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  // Clear the JWT cookie
  res.clearCookie('jwtToken', {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  
  res.status(200).json({ message: 'Logged out successfully' });
};