import express from "express"
import { body } from "express-validator"
import multer from "multer"
import path from "path"
import {
  getUserProfile,
  updateUserProfile,
  updatePassword,
  uploadProfileImage,
  getUserListings,
  getUserReviews,
} from "../controllers/userController.js"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile")
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/
    const mimetype = filetypes.test(file.mimetype)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

    if (mimetype && extname) {
      return cb(null, true)
    }
    cb(new Error("Only image files are allowed"))
  },
})

// @route   GET /api/users/:id
// @desc    Get user profile
// @access  Public
router.get("/:id", getUserProfile)

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authenticate,
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
  ],
  updateUserProfile,
)

// @route   PUT /api/users/password
// @desc    Update password
// @access  Private
router.put(
  "/password",
  authenticate,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
  ],
  updatePassword,
)

// @route   POST /api/users/profile-image
// @desc    Upload profile image
// @access  Private
router.post("/profile-image", authenticate, upload.single("image"), uploadProfileImage)

// @route   GET /api/users/listings
// @desc    Get current user's listings
// @access  Private
router.get("/listings", authenticate, getUserListings)

// @route   GET /api/users/:id/listings
// @desc    Get user's listings
// @access  Private
router.get("/:id/listings", authenticate, getUserListings)

// @route   GET /api/users/:id/reviews
// @desc    Get user's reviews
// @access  Private
router.get("/:id/reviews", authenticate, getUserReviews)

export default router

