import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import { validationResult } from "express-validator"

const prisma = new PrismaClient()

// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        university: true,
        major: true,
        bio: true,
        profileImage: true,
        createdAt: true,
        listings: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            price: true,
            category: true,
            condition: true,
            images: true,
            createdAt: true,
          },
        },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            reviewer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Calculate average rating
    const averageRating =
      user.reviews.length > 0 ? user.reviews.reduce((sum, review) => sum + review.rating, 0) / user.reviews.length : 0

    res.json({
      ...user,
      averageRating,
      reviewCount: user.reviews.length,
    })
  } catch (error) {
    next(error)
  }
}

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { firstName, lastName, major, bio } = req.body
    const userId = req.user.id

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        major,
        bio,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        university: true,
        major: true,
        bio: true,
        profileImage: true,
      },
    })

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    next(error)
  }
}

// Update password
export const updatePassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(newPassword, salt)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    res.json({ message: "Password updated successfully" })
  } catch (error) {
    next(error)
  }
}

// Upload profile image
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const userId = req.user.id
    const profileImage = `/uploads/profile/${req.file.filename}`

    // Update user profile image
    await prisma.user.update({
      where: { id: userId },
      data: { profileImage },
    })

    res.json({
      message: "Profile image uploaded successfully",
      profileImage,
    })
  } catch (error) {
    next(error)
  }
}

// Get user listings
export const getUserListings = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user.id
    const isOwnProfile = userId === req.user.id

    const listings = await prisma.listing.findMany({
      where: {
        sellerId: userId,
        // Only show active listings for other users' profiles
        ...(isOwnProfile ? {} : { isActive: true }),
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(listings)
  } catch (error) {
    next(error)
  }
}

// Get user reviews
export const getUserReviews = async (req, res, next) => {
  try {
    const userId = req.params.id

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    res.json(reviews)
  } catch (error) {
    next(error)
  }
}

