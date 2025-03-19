const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authMid");

router.use(authenticateToken);

router.post("/topup", async (req, res) => {
  const { amount } = req.body;
  const userId = req.user.uid;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    await pool.query("UPDATE users SET wallet_balance = wallet_balance + $1 WHERE firebase_uid = $2", [amount, userId]);

    await pool.query(
      "INSERT INTO wallet_transactions (user_id, amount, transaction_type, transaction_status, created_at) VALUES ((SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1), $2, 'topup', 'completed', NOW())",
      [userId, amount]
    );

    res.json({ message: "Wallet top-up successful" });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error during topup" });
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


router.post("/pay", async (req, res) => {
  const { amount, receiverId: receiverFirebaseUid } = req.body;
  const payerFirebaseUid = req.user.uid;

  if (!receiverFirebaseUid || !payerFirebaseUid) {
    return res.status(400).json({ error: "Invalid receiverId or userId" });
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid payment amount" });
  }
  if (payerFirebaseUid === receiverFirebaseUid) {
    return res.status(400).json({ error: "Cannot pay yourself" });
  }

  try {
    await pool.query("BEGIN");

    const result = await pool.query(
      `SELECT id, wallet_balance FROM users WHERE firebase_uid IN ($1, $2) FOR UPDATE`,
      [payerFirebaseUid, receiverFirebaseUid]
    );

    if (result.rows.length !== 2) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "User(s) not found" });
    }

    const payer = result.rows.find((user) => user.id === result.rows[0].id);
    const receiver = result.rows.find((user) => user.id !== payer.id);

    if (payer.wallet_balance < amount) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ error: "Insufficient balance" });
    }

    await pool.query(
      `UPDATE users SET wallet_balance = wallet_balance - $1 WHERE id = $2`,
      [amount, payer.id]
    );
    await pool.query(
      `UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`,
      [amount, receiver.id]
    );

    await pool.query(
      `INSERT INTO wallet_transactions (user_id, amount, transaction_type, transaction_status, created_at, related_user_id)
       VALUES ($1, $2, 'payment', 'completed', NOW(), $3), 
              ($3, $2, 'receive', 'completed', NOW(), $1)`,
      [payer.id, -amount, receiver.id]
    );

    await pool.query("COMMIT");
    res.json({ message: "Payment successful" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Database Error during payment:", error);
    res.status(500).json({ error: "Internal Server Error - Payment failed" });
  }
});


router.get("/balance", async (req, res) => {
  const userId = req.user.uid;

  try {
    const result = await pool.query(
      "SELECT wallet_balance FROM users WHERE firebase_uid = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ balance: result.rows[0].wallet_balance });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = router;
