import { Router } from 'express';
import authenticateToken from '../middleware/authMid.js';
import { pool } from '../db.js';

const router = Router();

router.get('/user', authenticateToken, async (req, res) => {
  if (!req.user || !req.user.id) {
    console.warn("No user ID found");
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
      const query = `SELECT ${dbFields.join(',')} FROM users WHERE id = $1`;
      const userDetails = await pool.query(query, [req.user.id]);

      if (userDetails.rows.length > 0) {
        let details = userDetails.rows[0];
        for (const field of fields) {
          if (field === 'balance') {
            response.balance = details.wallet_balance ? details.wallet_balance.toString() : "0.00";
          } else if (field === 'firstname') {
            response.firstname = details.firstname ? details.firstname.toString() : "John";
            console.log("FirstName requested", details.firstname)
          } else if (field === 'lastname') {
            response.lastname = details.lastname ? details.lastname.toString() : "Doe";
          }
        }
      } else {
        return res.status(404).json({ success: false, message: "User not found" });
      }
    } else {
      return res.status(400).json({ success: false, message: "No fields requested" });
    }

    res.status(200).json(response);

  } catch (error) {
    console.error(`Error processing user ID ${req.user.id}:`, error);
    res.status(500).json({ success: false, message: 'Internal server error while retrieving user data' });
  }
});

export default router;
