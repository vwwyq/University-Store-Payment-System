import express from "express";
import authenticateToken from "../middleware/authMid.js";
import { Message } from "../models/Message.js";

const router = express.Router();

// Get all messages between two users
router.get("/:receiverId", authenticateToken, async (req, res) => {
  const { receiverId } = req.params;
  const userId = req.user.uid;

  // Optional pagination
  const limit = parseInt(req.query.limit) || 50;
  const skip = parseInt(req.query.skip) || 0;

  try {

    console.log(`Fetching messages between ${userId} and ${receiverId}`);
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    }).sort({ timestamp: 1 }) .skip(skip)
    .limit(limit);
    console.log(`Found ${messages.length} messages`);
    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Could not fetch messages" });
  }
});

// Get the latest message between two users
router.get("/:receiverId/latest", authenticateToken, async (req, res) => {
  const { receiverId } = req.params;
  const userId = req.user.uid;

  try {
    console.log(`Fetching latest message between ${userId} and ${receiverId}`);
    const latestMessage = await Message.findOne({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId }
      ]
    }).sort({ timestamp: -1 });

    res.json(latestMessage || {});
  } catch (err) {
    console.error("Error fetching latest message:", err);
    res.status(500).json({ error: "Could not fetch latest message" });
  }
});

// Get message counts for unread messages (for notifications)
router.get("/unread/count", authenticateToken, async (req, res) => {
    const userId = req.user.uid;
    
    try {
      // In a real app, you would track read/unread status
      // This is a placeholder implementation
      const conversations = await Message.aggregate([
        {
          $match: {
            receiverId: userId,
            // In real implementation, add a condition for unread messages
          }
        },
        {
          $group: {
            _id: "$senderId",
            count: { $sum: 1 },
            latestMessage: { $max: "$timestamp" }
          }
        }
      ]);
      
      res.json(conversations);
    } catch (err) {
      console.error("Error fetching unread counts:", err);
      res.status(500).json({ error: "Could not fetch unread message counts" });
    }
  });
  


export default router;
