import express from "express";
import authenticateToken from "../middleware/authMid.js";
import {
  topUpWallet,
  getWalletBalance,
  processPayment,
  getTransactionHistory,
} from "../controllers/walletController.js";

const router = express.Router();
router.use(authenticateToken);

router.post("/topup", topUpWallet);
router.get("/history", getTransactionHistory);
router.post("/pay", processPayment);
router.get("/balance", getWalletBalance);

export default router;
