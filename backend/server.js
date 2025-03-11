require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sign } = require("jsonwebtoken");
const admin = require("firebase-admin");

const serviceAccount = require("./firebase-admin-sdk.json");
const walletRoutes = require("./routes/wallet");

if (!process.env.JWT_SECRET) {
  console.error("ERROR: Missing JWT_SECRET in .env file");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/wallet", walletRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

app.post("/auth/login", async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUID = decodedToken.uid;

    const jwtToken = sign({ uid: firebaseUID }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ jwt: jwtToken });
  } catch (error) {
    console.error("Firebase Auth Error:", error.message);
    res.status(401).json({ error: "Verification failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
