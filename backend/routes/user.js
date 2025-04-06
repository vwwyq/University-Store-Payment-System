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

export default router;