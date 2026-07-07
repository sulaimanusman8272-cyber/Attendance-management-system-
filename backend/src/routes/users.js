const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get all students in the institution
router.get('/students', auth, roleCheck('admin', 'teacher'), async (req, res) => {
  const { institution_id } = req.user;
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE institution_id = $1 AND role = 'student' ORDER BY name",
      [institution_id]
    );
    res.json({ students: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
