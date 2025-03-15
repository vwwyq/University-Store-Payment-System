const express = require("express");
const router = express.Router();
const pool = require("../db"); // Import PostgreSQL connection
const authenticateToken = require("../middleware/authMid");

router.use(authenticateToken);

router.post("/topup", async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.uid;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    // Update wallet balance
    await pool.query("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE firebase_uid = $2", [amount, userId]);

    // Store transaction
    await pool.query(
      "INSERT INTO wallet_transactions (user_id, amount, transaction_type, created_at) VALUES ((SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1), $2, 'topup', NOW())",
      [userId, amount]
    );
    
    

    res.json({ message: "Wallet top-up successful" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/history", async (req, res) => {
  const userId = req.user.uid;

  try {
    const transactions = await pool.query(
      "SELECT amount, transaction_type, created_at FROM wallet_transactions WHERE user_id = (SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1) ORDER BY created_at DESC",
      [userId]
    );

    res.json({ transactions: transactions.rows });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

<<<<<<< HEAD
router.post("/pay", (req, res) => {
  const { amount } = req.body;
  const userId = req.user.uid;

  if (!receiverID || !userId) {
    return res.status(400).json({ error: "Invalid userId or receiverId" });
  }

  if (!users[userId]) {
    return res.status(404).json({ error: "User not found" });
  }
  if (!users[receiverId]) {
    return res.status(404).json({ error: "Receiver not found" });
  }

  if (users[userId].balance < amount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  users[userId].balance -= amount;
  users[receiverId].balance += amount;
  users[userId].transactions.push({ type: "payment", amount });

  res.json({ message: "Payment successful", userBalance: users[userId].balance, resceiverBalance: users[receiverId].balance });
});


router.get("/history", (req, res) => {
  const userId = req.user.uid;
  if (!users[userId]) return res.status(404).json({ error: "User not found" })

  res.json({ transactions: users[userId].transactions })
})
=======
>>>>>>> postgres

module.exports = router;
