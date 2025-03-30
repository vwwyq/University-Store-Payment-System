import express from "express"
import { body } from "express-validator"
import multer from "multer"
import path from "path"
import { authenticate } from "../middleware/auth.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/listings")
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

// Placeholder for listing controllers
// These would be imported from a controller file in a complete implementation

// @route   GET /api/listings
// @desc    Get all listings
// @access  Public
router.get("/", (req, res) => {
  res.json({ message: "Get all listings" })
})

// @route   GET /api/listings/:id
// @desc    Get listing by ID
// @access  Public
router.get("/:id", (req, res) => {
  res.json({ message: `Get listing ${req.params.id}` })
})

// @route   POST /api/listings
// @desc    Create a new listing
// @access  Private
router.post(
  "/",
  authenticate,
  upload.array("images", 5),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("category").notEmpty().withMessage("Category is required"),
    body("condition").notEmpty().withMessage("Condition is required"),
    body("location").notEmpty().withMessage("Location is required"),
  ],
  (req, res) => {
    res.json({ message: "Create listing" })
  },
)

// @route   PUT /api/listings/:id
// @desc    Update a listing
// @access  Private
router.put(
  "/:id",
  authenticate,
  [
    body("title").optional().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().notEmpty().withMessage("Description cannot be empty"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("category").optional().notEmpty().withMessage("Category cannot be empty"),
    body("condition").optional().notEmpty().withMessage("Condition cannot be empty"),
    body("location").optional().notEmpty().withMessage("Location cannot be empty"),
  ],
  (req, res) => {
    res.json({ message: `Update listing ${req.params.id}` })
  },
)

// @route   DELETE /api/listings/:id
// @desc    Delete a listing
// @access  Private
router.delete("/:id", authenticate, (req, res) => {
  res.json({ message: `Delete listing ${req.params.id}` })
})

export default router

