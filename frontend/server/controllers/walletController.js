import { PrismaClient } from "@prisma/client"
import { validationResult } from "express-validator"

const prisma = new PrismaClient()

// Get wallet balance
export const getWalletBalance = async (req, res, next) => {
  try {
    const userId = req.user.id

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        id: true,
        balance: true,
      },
    })

    if (!wallet) {
      // Create wallet if it doesn't exist
      const newWallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
        },
      })

      return res.json(newWallet)
    }

    res.json(wallet)
  } catch (error) {
    next(error)
  }
}

// Add funds to wallet
export const addFunds = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { amount } = req.body
    const userId = req.user.id

    // Get wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      // Create wallet if it doesn't exist
      wallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
        },
      })
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        walletId: wallet.id,
        amount: Number.parseFloat(amount),
        type: "topup",
        description: "Wallet Top Up",
        status: "completed",
      },
    })

    // Update wallet balance
    const updatedWallet = await prisma.wallet.update({
      where: { id: wallet.id },
      data: {
        balance: { increment: Number.parseFloat(amount) },
      },
    })

    res.json({
      message: "Funds added successfully",
      transaction,
      balance: updatedWallet.balance,
    })
  } catch (error) {
    next(error)
  }
}

// Get transaction history
export const getTransactionHistory = async (req, res, next) => {
  try {
    const userId = req.user.id

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    })

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" })
    }

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: { walletId: wallet.id },
      orderBy: { timestamp: "desc" },
    })

    res.json(transactions)
  } catch (error) {
    next(error)
  }
}

// Process purchase
export const processPurchase = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const { listingId, amount } = req.body
    const buyerId = req.user.id

    // Start transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Get buyer's wallet
      const buyerWallet = await prisma.wallet.findUnique({
        where: { userId: buyerId },
      })

      if (!buyerWallet) {
        throw new Error("Buyer wallet not found")
      }

      // Check if buyer has enough balance
      if (buyerWallet.balance < amount) {
        throw new Error("Insufficient funds")
      }

      // Get listing
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: { seller: true },
      })

      if (!listing) {
        throw new Error("Listing not found")
      }

      if (!listing.isActive) {
        throw new Error("Listing is no longer active")
      }

      // Get seller's wallet
      let sellerWallet = await prisma.wallet.findUnique({
        where: { userId: listing.sellerId },
      })

      if (!sellerWallet) {
        // Create wallet for seller if it doesn't exist
        sellerWallet = await prisma.wallet.create({
          data: {
            userId: listing.sellerId,
            balance: 0,
          },
        })
      }

      // Create purchase record
      const purchase = await prisma.purchase.create({
        data: {
          buyerId,
          listingId,
          status: "completed",
        },
      })

      // Update listing status
      await prisma.listing.update({
        where: { id: listingId },
        data: { isActive: false },
      })

      // Create buyer transaction (deduct funds)
      await prisma.transaction.create({
        data: {
          walletId: buyerWallet.id,
          amount: -Number.parseFloat(amount),
          type: "purchase",
          description: `Purchase: ${listing.title}`,
          status: "completed",
          relatedItemId: listingId,
          relatedUserId: listing.sellerId,
        },
      })

      // Create seller transaction (add funds)
      await prisma.transaction.create({
        data: {
          walletId: sellerWallet.id,
          amount: Number.parseFloat(amount),
          type: "sale",
          description: `Sale: ${listing.title}`,
          status: "completed",
          relatedItemId: listingId,
          relatedUserId: buyerId,
        },
      })

      // Update buyer's wallet balance
      await prisma.wallet.update({
        where: { id: buyerWallet.id },
        data: {
          balance: { decrement: Number.parseFloat(amount) },
        },
      })

      // Update seller's wallet balance
      await prisma.wallet.update({
        where: { id: sellerWallet.id },
        data: {
          balance: { increment: Number.parseFloat(amount) },
        },
      })

      return { purchase, listing }
    })

    res.json({
      message: "Purchase completed successfully",
      purchase: result.purchase,
      listing: result.listing,
    })
  } catch (error) {
    if (error.message === "Insufficient funds") {
      return res.status(400).json({ message: error.message })
    }
    next(error)
  }
}

