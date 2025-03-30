export const errorHandler = (err, req, res, next) => {
  console.error(err.stack)

  // Prisma error handling
  if (err.code) {
    if (err.code === "P2002") {
      return res.status(400).json({
        message: "A record with this information already exists",
        field: err.meta?.target?.[0],
      })
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        message: "Record not found",
      })
    }
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" })
  }

  // Default error
  res.status(500).json({
    message: err.message || "Internal Server Error",
  })
}

