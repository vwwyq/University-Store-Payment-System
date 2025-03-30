import express from "express"
import { body } from "express-validator"
import { register, login, getCurrentUser } from "../controllers/authController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
  ],
  register,
)

// @route   POST /api/auth/login
// @desc    Login user and get token
// @access  Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please include a valid email"),
    body("password").exists().withMessage("Password is required"),
  ],
  login,
)

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", authenticate, getCurrentUser)

export default router

