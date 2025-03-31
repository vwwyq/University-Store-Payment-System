import { Router } from 'express';
import authenticateToken from '../middleware/authMid.js';
import { pool } from '../db.js';

const router = Router();

router.get('/user', authenticateToken, async (req, res) => {
  if (req.user && req.user.id) {
    try {
      let balance = req.user.balance;

      if (balance === undefined || balance === null) {
        console.log(`Fetching balance for user ID: ${req.user.id}`);
        const balanceResult = await pool.query(
          'SELECT wallet_balance FROM users WHERE id = $1',
          [req.user.id]
        );

        if (balanceResult.rows.length > 0) {
          balance = balanceResult.rows[0].wallet_balance.toString();
        } else {
          console.error(`User balance not found in DB for authenticated user ID: ${req.user.id}`);
          balance = "0.00";
        }
      }

      res.status(200).json({
        success: true,
        id: req.user.id,
        uid: req.user.uid,
        balance: balance
      });

    } catch (error) {
      console.error(`Error processing user ID ${req.user.id}:`, error);
      res.status(500).json({ success: false, message: 'Internal server error while retrieving user data' });
    }
  } else {
    console.warn('GET middleware error');
    res.status(401).json({ success: false, message: 'Unauthorized: User invalid' });
  }
});

export default router;
