import { pool } from "../db.js";
import jwt from 'jsonwebtoken'

export const topUpWallet = async (req, res) => {
  const { amount } = req.body;
  const userFirebaseUid = req.user.uid;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    await pool.query("BEGIN");
    const result = await pool.query(
      "select id, wallet_balance from users where firebase_uid = $1 for update", [userFirebaseUid]
    );

    if (result.rows.length === 0) {
      await pool.query("rollback");
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];

    await pool.query(
      "update users set wallet_balance = wallet_balance + $1 where id = $2", [amount, user.id]
    );

    await pool.query("commit");
    res.json({ message: "Wallet top-up successful" });
  } catch (err) {
    await pool.query("Rollback");
    console.error("Database Error during top-up: ", err);
    res.status(500).json({ error: "Internal server error - top-up failed" });
  }
};

export const getTransactionHistory = async (req, res) => {
  const userFirebaseUid = req.user.uid;

  try {
    const userResult = await pool.query(
      "select id from users where firebase_uid = $1 Limit 1", [userFirebaseUid]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;

    const transactions = await pool.query(
      "SELECT amount, transaction_type, transaction_status, created_at FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json({ transactions: transactions.rows })
  } catch (err) {
    console.error("Database error: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const processPayment = async (req, res) => {
  const { amount, receiverId: recvFirebaseUid } = req.body;
  const payFirebaseUid = req.user.uid;

  if (!recvFirebaseUid || !payFirebaseUid) {
    return res.status(400).json({ error: "Invalid receiverId or userId" });
  }
  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid payment amount" });
  }
  if (payFirebaseUid === recvFirebaseUid) {
    return res.status(400).json({ error: "Cannot pay yourself" });
  }

  try {
    await pool.query("BEGIN");

    const result = await pool.query(
      `SELECT id, wallet_balance FROM users WHERE firebase_uid IN ($1, $2) FOR UPDATE`,
      [payFirebaseUid, recvFirebaseUid]
    );

    if (result.rows.length !== 2) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ error: "User(s) not found)" });
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
              ($3, $4, 'receive', 'completed', NOW(), $1)`,
      [payer.id, -amount, receiver.id, +amount]
    );

    await pool.query("COMMIT");
    res.json({ message: "Payment successful" });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Database Error during payment:", error);
    res.status(500).json({ error: "Internal Server Error - Payment failed" });
  }
};


export const getWalletBalance = async (req, res) => {
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
};
