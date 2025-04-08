import { Router } from 'express';
import authenticateToken from '../middleware/authMid.js';
import { pool } from '../db.js';

const router = Router();


router.get('/user', authenticateToken, async (req, res) => {
  if (!req.user || !req.user.id) {
    console.warn("No user ID found in request", req.user);
    return res.status(401).json({ success: false, message: "Unauthorized: User invalid or expired" });
  }

  const fields = req.query.fields ? req.query.fields.split(',') : ['balance', 'firstname', 'lastname'];

  try {
    let response = { success: true, id: req.user.id, uid: req.user.uid };
    let dbFields = [];
    const fieldMap = {
      balance: 'wallet_balance',
      firstname: 'firstname',
      lastname: 'lastname',
      registrationDate: 'registration_date',
    };

    for (const field of fields) {
      if (fieldMap[field]) {
        dbFields.push(fieldMap[field]);
      }
    }

    if (dbFields.length > 0) {
      // Modified this query to ensure we're looking up with the right field
      const query = `SELECT ${dbFields.join(',')} FROM users WHERE id = $1`;
      console.log("Executing query:", query, "with ID:", req.user.id);
      
      const userDetails = await pool.query(query, [req.user.id]);
      console.log("Query result:", userDetails.rows);

      if (userDetails.rows.length > 0) {
        // Process user details and return them
        let details = userDetails.rows[0];
        for (const field of fields) {
          if (field === 'balance') {
            response.balance = details.wallet_balance ? details.wallet_balance.toString() : "0.00";
          } else if (field === 'firstname') {
            response.firstName = details.firstname ? details.firstname.toString() : "";
          } else if (field === 'lastname') {
            response.lastName = details.lastname ? details.lastname.toString() : "";
          } else if (field === 'registrationDate') {
            response.registrationDate = details.registration_date ? details.registration_date.toString() : "";
          }
        }
        
        console.log("Sending response:", response);
        return res.status(200).json(response);
      } else {
        console.log("User not found with ID:", req.user.id);
        return res.status(404).json({ success: false, message: "User not found" });
      }
    } else {
      return res.status(400).json({ success: false, message: "No fields requested" });
    }

  } catch (error) {
    console.error(`Error processing user ID ${req.user.id}:`, error);
    res.status(500).json({ success: false, message: 'Internal server error while retrieving user data' });
  }
});

// Get current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, firebase_uid, email, firstname, lastname FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all users (for contacts)
// Replace this route in your user.js file

// Get all users (for contacts)
router.get("/users", authenticateToken, async (req, res) => {
  try {
    // Optional query parameter for search
    const searchQuery = req.query.search ? `%${req.query.search}%` : null;
    
    // Default to selecting all users if no search parameter
    let query = `
      SELECT id, firebase_uid, email, firstname, lastname 
      FROM users 
      WHERE id != $1
    `;
    
    let params = [req.user.id]; // Exclude current user
    
    // If search parameter provided, add more specific WHERE clauses
    if (searchQuery) {
      query = `
        SELECT id, firebase_uid, email, firstname, lastname 
        FROM users 
        WHERE id != $1 AND (
          email ILIKE $2 OR 
          firstname ILIKE $2 OR 
          lastname ILIKE $2
        )
      `;
      params.push(searchQuery);
    }
    
    // Add order by to get consistent results
    query += " ORDER BY firstname ASC, lastname ASC";
    
    console.log("Executing query:", query);
    console.log("With params:", params);
    
    const result = await pool.query(query, params);
    console.log(`Found ${result.rows.length} users`);
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Get specific user profile
router.get("/user/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, firebase_uid, email, firstname, lastname FROM users WHERE id = $1 OR firebase_uid = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Add this to your user.js routes file

// Get user's listings
router.get("/listings", authenticateToken, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized: User invalid or expired" });
    }
    
    const userId = req.user.id;
    console.log(`Fetching listings for user ID: ${userId}`);
    
    const query = `
      SELECT l.id, l.title, l.description, l.price, l.category, 
             l.condition, l.status, l.featured, l.created_at, l.updated_at
      FROM listings l
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    console.log(`Found ${result.rows.length} listings for user ${userId}`);
    
    res.json({
      success: true,
      listings: result.rows
    });
  } catch (error) {
    console.error("Error fetching user listings:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      details: error.message 
    });
  }
});



// Create a new listing
router.post("/listing", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      title, 
      description, 
      price, 
      category, 
      condition,
      price_negotiable,
      payment_mode,
      meetup_location,
      availability 
    } = req.body;
    
    // Validate required fields
    if (!title || !price || !category || !condition || !price_negotiable || !payment_mode) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields" 
      });
    }
    
    // Validate price format
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid price format" 
      });
    }
    
    // Validate condition is one of the allowed values
    const allowedConditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];
    if (!allowedConditions.includes(condition)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid condition value" 
      });
    }

    // Validate payment mode
    const allowedPaymentModes = ['all', 'wallet', 'cash'];
    if (payment_mode && !allowedPaymentModes.includes(payment_mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment mode value"
      });
    }
    
    // Convert isNegotiable to boolean
    const isNegotiableValue = price_negotiable === 'yes';
    
    // Insert the new listing
    const query = `
      INSERT INTO listings (
        user_id, title, description, price, category, condition, status,
        price_negotiable, payment_mode, meetup_location, availability
      ) VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10)
      RETURNING id, title, status, created_at
    `;
    
    const values = [
      userId, title, description, priceValue, category, condition,
      isNegotiableValue, payment_mode || 'all', meetup_location, availability
    ];
    
    const result = await pool.query(query, values);
    
    res.status(201).json({
      success: true,
      message: "Listing created successfully",
      listing: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      details: error.message 
    });
  }
});

// Add a route to get a specific listing by ID
router.get("/listing/:id", authenticateToken, async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;
    
    const query = `
      SELECT * FROM listings 
      WHERE id = $1 AND (user_id = $2 OR status = 'active')
    `;
    
    const result = await pool.query(query, [listingId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    
    res.json({
      success: true,
      listing: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Add this to your user.js routes file

// Delete a listing (soft delete by changing status to 'deleted')
router.delete("/listing/:id", authenticateToken, async (req, res) => {
  try {
    const listingId = req.params.id;
    const userId = req.user.id;
    
    // First, check if the listing belongs to the user
    const checkQuery = `
      SELECT id FROM listings 
      WHERE id = $1 AND user_id = $2
    `;
    
    const checkResult = await pool.query(checkQuery, [listingId, userId]);
    
    if (checkResult.rows.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to delete this listing" 
      });
    }
    
    // Update the status to 'deleted' (soft delete)
    const updateQuery = `
      UPDATE listings 
      SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;
    
    const result = await pool.query(updateQuery, [listingId, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }
    
    res.json({
      success: true,
      message: "Listing successfully deleted"
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Get listings by category
router.get("/listings/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    
    let query = `
      SELECT l.id, l.title, l.description, l.price, l.category, 
             l.condition, l.status, l.created_at, l.updated_at,
             u.firstname, u.lastname
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.status = 'active'
    `;
    
    const params = [];
    
    // If a specific category is requested (not "all")
    if (category && category !== 'all') {
      query += ` AND l.category = $1`;
      params.push(category);
    }
    
    // Order by creation date, newest first
    query += ` ORDER BY l.created_at DESC LIMIT 12`;
    
    const result = await pool.query(query, params);
    
    res.json({
      success: true,
      listings: result.rows
    });
  } catch (error) {
    console.error("Error fetching listings by category:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      details: error.message 
    });
  }
});

// Get recent listings
router.get("/listings/recent", async (req, res) => {
  try {
    const query = `
      SELECT l.id, l.title, l.description, l.price, l.category, 
             l.condition, l.status, l.created_at, l.updated_at,
             u.firstname, u.lastname
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.status = 'active'
      ORDER BY l.created_at DESC
      LIMIT 12
    `;
    
    const result = await pool.query(query, []);
    
    res.json({
      success: true,
      listings: result.rows
    });
  } catch (error) {
    console.error("Error fetching recent listings:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      details: error.message 
    });
  }
});


export default router;