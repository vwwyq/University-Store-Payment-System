import { pool } from "../db.js";
import { v4 as uuidv4 } from "uuid";
import {
  TRANSACTION_TYPE_PAYMENT,
  TRANSACTION_TYPE_RECEIVE,
  TRANSACTION_STATUS_COMPLETED,
  ERROR_MSG_UNAUTHORIZED,
  ERROR_MSG_INVALID_RECIPIENT,
  ERROR_MSG_INVALID_AMOUNT,
  ERROR_MSG_SELF_PAYMENT,
  ERROR_MSG_INVALID_ORDER_ID,
  ERROR_MSG_INSUFFICIENT_BALANCE,
  ERROR_MSG_SENDER_NOT_FOUND,
  ERROR_MSG_RECIPIENT_NOT_FOUND,
  ERROR_MSG_PAYMENT_FAILED_INTERNAL,
  INFO_MSG_PAYMENT_ALREADY_COMPLETED,
  SUCCESS_MSG_PAYMENT
} from '../lib/paymentConstants.js';

export const topUpWallet = async (req, res) => {
  const { amount } = req.body;
  const userFirebaseUid = req.user.uid;

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Invalid amount" });
  }

  try {
    await pool.query("BEGIN");
    const result = await pool.query(
      "SELECT id, wallet_balance FROM users WHERE firebase_uid = $1 FOR UPDATE",
      [userFirebaseUid]
    );

    if (result.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(400).json({ error: "User not found" });
    }

    const user = result.rows[0];

    await pool.query(
      "UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2",
      [amount, user.id]
    );

    await pool.query(
      `INSERT INTO wallet_transactions (related_user_id, user_id, transaction_type, transaction_status, amount, currency, created_at, updated_at) 
   VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
      [user.id, user.id, 'top-up', 'completed', amount, 'INR']
    );

    await pool.query("COMMIT");
    req.app.get("wss").clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "Topup", amount, transactionType: 'topup' }))
      }
    })
    const updatedBalance = await getUserBalance(user.id);

    res.json({
      message: "Wallet top-up successful",
      newBalance: Number(updatedBalance),
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Database Error during top-up: ", err);
    res.status(500).json({ error: "Internal server error - top-up failed" });
  }
};

export const getTransactionHistory = async (req, res) => {
  const userFirebaseUid = req.user.uid;

  try {
    const userResult = await pool.query(
      "SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1",
      [userFirebaseUid]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    const userId = userResult.rows[0].id;

    const transactions = await pool.query(
      "SELECT amount, transaction_type, transaction_status, created_at FROM wallet_transactions WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json({ transactions: transactions.rows });
  } catch (err) {
    console.error("Database error: ", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const processPayment = async (req, res) => {
  const { amount, recipientId, orderId } = req.body;
  const senderId = req.user?.id;

  console.log("Processing payment request:", { senderId, recipientId, amount, orderId });

  if (!senderId || typeof senderId !== 'number' || senderId <= 0) {
    console.warn("Payment rejected: Invalid sender ID", senderId);
    return res.status(401).json({ success: false, message: ERROR_MSG_UNAUTHORIZED });
  }
  if (!recipientId || typeof recipientId !== 'number' || recipientId <= 0) {
    console.warn("Payment rejected: Invalid recipient ID", recipientId);
    return res.status(400).json({ success: false, message: ERROR_MSG_INVALID_RECIPIENT });
  }
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    console.warn("Payment rejected: Invalid amount", amount);
    return res.status(400).json({ success: false, message: ERROR_MSG_INVALID_AMOUNT });
  }
  if (senderId === recipientId) {
    console.warn("Payment rejected: Self-payment attempt", senderId);
    return res.status(400).json({ success: false, message: ERROR_MSG_SELF_PAYMENT });
  }
  if (orderId && typeof orderId !== 'string') {
    console.warn("Payment rejected: Invalid order ID format", orderId);
    return res.status(400).json({ success: false, message: ERROR_MSG_INVALID_ORDER_ID });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    console.log("Transaction started for payment from", senderId, "to", recipientId);

    if (orderId) {
      console.log("Checking for duplicate payment for order:", orderId);
      const idempotencyCheck = await client.query(
        `SELECT 1 FROM wallet_transactions
         WHERE order_id = $1
         AND user_id = $2
         AND transaction_type = $3
         AND transaction_status = $4
         LIMIT 1`,
        [orderId, senderId, TRANSACTION_TYPE_PAYMENT, TRANSACTION_STATUS_COMPLETED]
      );
      if (idempotencyCheck.rows.length > 0) {
        await client.query("ROLLBACK");
        console.log(`Idempotency Check: Order ${orderId} already paid by user ID ${senderId}.`);
        return res.status(200).json({ success: true, message: INFO_MSG_PAYMENT_ALREADY_COMPLETED });
      }
    }

    console.log("Updating sender wallet balance. Sender:", senderId, "Amount:", amount);
    const senderUpdateResult = await client.query(
      `UPDATE users
       SET wallet_balance = wallet_balance - $1,
           lifetime_spent = COALESCE(lifetime_spent, 0) + $1
       WHERE id = $2 AND wallet_balance >= $1
       RETURNING id, wallet_balance`,
      [amount, senderId]
    );

    if (senderUpdateResult.rowCount === 0) {
      const senderExists = await client.query('SELECT id, wallet_balance FROM users WHERE id = $1 LIMIT 1', [senderId]);
      await client.query("ROLLBACK");

      if (senderExists.rowCount === 0) {
        console.warn(`Payment failed: Sender user ID ${senderId} not found during update attempt.`);
        return res.status(404).json({ success: false, message: ERROR_MSG_SENDER_NOT_FOUND });
      } else {
        console.warn(`Payment failed: Insufficient balance for user ID ${senderId}. Amount: ${amount}, Balance: ${senderExists.rows[0].wallet_balance}`);
        return res.status(400).json({ success: false, message: ERROR_MSG_INSUFFICIENT_BALANCE });
      }
    }

    console.log("Updating recipient wallet balance. Recipient:", recipientId, "Amount:", amount);
    const recipientUpdateResult = await client.query(
      `UPDATE users
       SET wallet_balance = wallet_balance + $1
       WHERE id = $2
       RETURNING id, wallet_balance`,
      [amount, recipientId]
    );

    if (recipientUpdateResult.rowCount === 0) {
      await client.query("ROLLBACK");
      console.error(`Payment failed: Recipient user ID ${recipientId} not found. Rolling back transaction.`);
      return res.status(404).json({ success: false, message: ERROR_MSG_RECIPIENT_NOT_FOUND });
    }

    const senderTransactionId = uuidv4();
    const recipientTransactionId = uuidv4();

    console.log("Recording transactions in wallet_transactions table");
    await client.query(
      `INSERT INTO wallet_transactions
         (
           user_id, transaction_id, transaction_type, transaction_status, amount,
           related_user_id, order_id, related_transaction_id
         )
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8),
         ($6, $8, $9, $4, $10, $1, $7, $2)
      `,
      [
        senderId,
        senderTransactionId,
        TRANSACTION_TYPE_PAYMENT,
        TRANSACTION_STATUS_COMPLETED,
        -Math.abs(amount),
        recipientId,
        orderId,
        recipientTransactionId,
        TRANSACTION_TYPE_RECEIVE,
        Math.abs(amount)
      ]
    );

    await client.query("COMMIT");
    console.log(`Payment successful: ${amount} transferred from user ${senderId} to user ${recipientId} for order ${orderId}`);

    res.status(200).json({
      success: true,
      message: SUCCESS_MSG_PAYMENT,
      details: {
        orderId: orderId,
        amount: amount,
        newBalance: senderUpdateResult.rows[0].wallet_balance
      }
    });

  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
        console.log(`Transaction rolled back due to error for Order ${orderId}, Sender ${senderId}.`);
      } catch (rollbackError) {
        if (rollbackError.message !== 'cannot rollback - no transaction is in progress' && rollbackError.code !== '25P01') {
          console.error("Error attempting to rollback transaction:", rollbackError);
        }
      }
    }
    console.error(`Database Error during payment processing for Order ${orderId}, Sender ${senderId}:`, error);
    res.status(500).json({ success: false, message: ERROR_MSG_PAYMENT_FAILED_INTERNAL });
  } finally {
    if (client) {
      client.release();
    }
  }
};

export const getWalletBalance = async (req, res) => {
  const userId = req.user.uid;

  try {
    const result = await pool.query(
      "SELECT wallet_balance, lifetime_spent FROM users WHERE firebase_uid = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const transactions = await pool.query(
      "SELECT amount, transaction_type, transaction_status, created_at FROM wallet_transactions WHERE user_id = (SELECT id FROM users WHERE firebase_uid = $1) ORDER BY created_at DESC",
      [userId]
    );

    res.json({
      balance: result.rows[0].wallet_balance,
      lifetimeSpent: result.rows[0].lifetime_spent || 0,
      pending: 0,
      transactions: transactions.rows,
    });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

async function getUserBalance(userId) {
  try {

    const result = await pool.query(
      "SELECT wallet_balance FROM users WHERE id = $1",
      [userId]
    );
    if (result.rows.length > 0) {
      console.log("Balance: ", result.rows[0].wallet_balance);
      return result.rows[0].wallet_balance;
    } else {
      throw new Error("Wallet not found for user");
    }
  } catch (error) {
    console.error("Error fetching user balance:", error);
    throw new Error("Failed to fetch user balance");
  }
}
