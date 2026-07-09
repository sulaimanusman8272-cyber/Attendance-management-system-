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

// Get all teachers in the institution
router.get('/teachers', auth, roleCheck('admin'), async (req, res) => {
  const { institution_id } = req.user;
  try {
    const result = await pool.query(
      "SELECT id, name, email FROM users WHERE institution_id = $1 AND role = 'teacher' ORDER BY name",
      [institution_id]
    );
    res.json({ teachers: result.rows });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// Get total counts of students and teachers
router.get('/counts', auth, roleCheck('admin'), async (req, res) => {
  const { institution_id } = req.user;
  try {
    const result = await pool.query(
      "SELECT role, COUNT(*) as count FROM users WHERE institution_id = $1 AND role IN ('student', 'teacher') GROUP BY role",
      [institution_id]
    );
    const counts = { students: 0, teachers: 0 };
    result.rows.forEach(r => {
      if (r.role === 'student') counts.students = parseInt(r.count);
      if (r.role === 'teacher') counts.teachers = parseInt(r.count);
    });
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
