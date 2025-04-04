import express from "express";
import authenticateToken from "../middleware/authMid.js";
import rateLimit from "express-rate-limit";
import {
  topUpWallet,
  getWalletBalance,
  processPayment,
  getTransactionHistory,
} from "../controllers/walletController.js";

const router = express.Router();
const limiter = rateLimit({
  windowsMs: 60 * 1000,
  max: 3,
  message: { success: false, message: "Too many requests, please try again later" },
})
router.use(authenticateToken);

router.post("/topup", limiter, topUpWallet);
router.get("/history", getTransactionHistory);
router.post("/pay", limiter, processPayment);
router.get("/balance", getWalletBalance);

export default router;
