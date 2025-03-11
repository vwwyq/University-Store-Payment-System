const express = require("express");
const router = express.Router();

let users = {};

router.post("/topup", (req, res) => {
  const { userId, amount } = req.body;

  if (!users[userId]) users[userId] = { balance: 0, transactions: [] };

  users[userId].balance += amount;
  users[userId].transactions.push({ type: "topup", amount })

  res.json({ message: "Wallet top up successful", balance: users[userId].balance });
});

router.get("/balance", (req, res) => {
  const { userId } = req.query;
  if (!users[userId]) return res.status(404).json({ error: "User not found" })
  res.json({ balance: users[userId].balance });
});

router.post("/pay", (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || amount <= 0) {
    return res.status(400).json({ error: "Invalid userId or amount" });
  }

  if (!users[userId]) {
    return res.status(404).json({ error: "User not found" });
  }

  if (users[userId].balance < amount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  users[userId].balance -= amount;
  users[userId].transactions.push({ type: "payment", amount });

  res.json({ message: "Payment successful", balance: users[userId].balance });
});


router.get("/history", (req, res) => {
  const { userId } = req.query;
  if (!users[userId]) return res.status(404).json({ error: "User not found" })

  res.json({ transactions: users[userId].transactions })
})

module.exports = router;
