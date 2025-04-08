import { Router } from 'express';
import authenticateToken from '../middleware/authMid.js';
import { pool } from '../db.js';

const router = Router();

// Get all listings for the logged-in user
router.get('/my-listings', authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized: User invalid or expired" 
      });
    }

    const userId = req.user.id;
    
    // Optional query parameters for filtering
    const status = req.query.status || 'active'; // Default to active listings
    const sortBy = req.query.sortBy || 'created_at'; // Default sort by creation date
    const sortOrder = req.query.sortOrder || 'DESC'; // Default to newest first
    
    // Validate sort parameters to prevent SQL injection
    const validSortFields = ['created_at', 'updated_at', 'price', 'title'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    // Validate status to prevent SQL injection
    const validStatuses = ['active', 'sold', 'deleted', 'all'];
    const finalStatus = validStatuses.includes(status) ? status : 'active';
    
    // Build the query
    let query = `
      SELECT 
        id, 
        title, 
        description, 
        price, 
        category, 
        condition, 
        status, 
        featured, 
        created_at, 
        updated_at
      FROM listings 
      WHERE user_id = $1
    `;
    
    const queryParams = [userId];
    
    // Add status filter if not 'all'
    if (finalStatus !== 'all') {
      query += ` AND status = $2`;
      queryParams.push(finalStatus);
    }
    
    // Add sorting
    query += ` ORDER BY ${finalSortBy} ${finalSortOrder}`;
    
    console.log("Executing query:", query);
    console.log("With params:", queryParams);
    
    const result = await pool.query(query, queryParams);
    
    console.log(`Found ${result.rows.length} listings for user ${userId}`);
    
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      listings: result.rows
    });
    
  } catch (error) {
    console.error("Error fetching user listings:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error while retrieving listings",
      error: error.message
    });
  }
});

// Get details for a specific listing
router.get('/listing/:id', authenticateToken, async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT l.*, u.email, u.firstname, u.lastname
       FROM listings l
       JOIN users u ON l.user_id = u.id
       WHERE l.id = $1`,
      [listingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }

    const listing = result.rows[0];
    
    // Add a flag to indicate if this is the user's own listing
    listing.isOwner = listing.user_id === userId;

    return res.status(200).json({
      success: true,
      listing
    });

  } catch (error) {
    console.error("Error fetching listing details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while retrieving listing",
      error: error.message
    });
  }
});

// Create a new listing
router.post('/listing', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, price, category, condition } = req.body;
    
    // Validate required fields
    if (!title || !price || !category) {
      return res.status(400).json({
        success: false,
        message: "Title, price, and category are required"
      });
    }
    
    // Insert the new listing
    const result = await pool.query(
      `INSERT INTO listings 
        (user_id, title, description, price, category, condition) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [userId, title, description, price, category, condition]
    );
    
    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing: result.rows[0]
    });
    
  } catch (error) {
    console.error("Error creating listing:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating listing",
      error: error.message
    });
  }
});

// Update an existing listing
router.put('/listing/:id', authenticateToken, async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;
    const { title, description, price, category, condition, status } = req.body;
    
    // Check if the listing exists and belongs to the user
    const checkResult = await pool.query(
      "SELECT user_id FROM listings WHERE id = $1",
      [listingId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }
    
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this listing"
      });
    }
    
    // Build the update query dynamically
    let updateQuery = "UPDATE listings SET updated_at = CURRENT_TIMESTAMP";
    const queryParams = [];
    let paramCounter = 1;
    
    // Add fields to update only if they are provided
    if (title !== undefined) {
      updateQuery += `, title = $${paramCounter}`;
      queryParams.push(title);
      paramCounter++;
    }
    
    if (description !== undefined) {
      updateQuery += `, description = $${paramCounter}`;
      queryParams.push(description);
      paramCounter++;
    }
    
    if (price !== undefined) {
      updateQuery += `, price = $${paramCounter}`;
      queryParams.push(price);
      paramCounter++;
    }
    
    if (category !== undefined) {
      updateQuery += `, category = $${paramCounter}`;
      queryParams.push(category);
      paramCounter++;
    }
    
    if (condition !== undefined) {
      updateQuery += `, condition = $${paramCounter}`;
      queryParams.push(condition);
      paramCounter++;
    }
    
    if (status !== undefined) {
      updateQuery += `, status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }
    
    // Add WHERE clause and listing ID
    updateQuery += ` WHERE id = $${paramCounter} RETURNING *`;
    queryParams.push(listingId);
    
    // Execute the update
    const result = await pool.query(updateQuery, queryParams);
    
    return res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      listing: result.rows[0]
    });
    
  } catch (error) {
    console.error("Error updating listing:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while updating listing",
      error: error.message
    });
  }
});

// Delete a listing (soft delete by changing status)
router.delete('/listing/:id', authenticateToken, async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;
    
    // Check if listing exists and belongs to the user
    const checkResult = await pool.query(
      "SELECT user_id FROM listings WHERE id = $1",
      [listingId]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Listing not found"
      });
    }
    
    if (checkResult.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this listing"
      });
    }
    
    // Soft delete by changing status to 'deleted'
    await pool.query(
      "UPDATE listings SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [listingId]
    );
    
    return res.status(200).json({
      success: true,
      message: "Listing deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting listing:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while deleting listing",
      error: error.message
    });
  }
});

export default router;