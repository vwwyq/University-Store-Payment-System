import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        university: true,
        major: true,
        isVerified: true,
        createdAt: true,
        profileImage: true,
      },
    })

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    // Add user to request
    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error.message)
    return res.status(401).json({ message: "Token is not valid" })
  }
}

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "ADMIN") {
    next()
  } else {
    res.status(403).json({ message: "Access denied: Admin privileges required" })
  }
}

