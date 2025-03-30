import express from "express"
import { body } from "express-validator"
import { getWalletBalance, addFunds, getTransactionHistory, processPurchase } from "../controllers/walletController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// @route   GET /api/wallet/balance
// @desc    Get wallet balance
// @access  Private
router.get("/balance", authenticate, getWalletBalance)

// @route   POST /api/wallet/add-funds
// @desc    Add funds to wallet
// @access  Private
router.post(
  "/add-funds",
  authenticate,
  [body("amount").isFloat({ min: 1 }).withMessage("Amount must be at least 1")],
  addFunds,
)

// @route   GET /api/wallet/transactions
// @desc    Get transaction history
// @access  Private
router.get("/transactions", authenticate, getTransactionHistory)

// @route   POST /api/wallet/purchase
// @desc    Process a purchase
// @access  Private
router.post(
  "/purchase",
  authenticate,
  [
    body("listingId").notEmpty().withMessage("Listing ID is required"),
    body("amount").isFloat({ min: 1 }).withMessage("Amount must be at least 1"),
  ],
  processPurchase,
)

export default router

