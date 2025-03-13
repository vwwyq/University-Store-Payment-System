require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { sign } = require("jsonwebtoken");
const admin = require("firebase-admin");

const serviceAccount = require("./firebase-admin-sdk.json");
const walletRoutes = require("./routes/wallet");
const authRoutes = require("./routes/auth")

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
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
