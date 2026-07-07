const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { markAttendance, getAttendanceBySession } = require('../controllers/attendanceController');

router.post('/mark', auth, roleCheck('student'), markAttendance);
router.get('/session/:session_id', auth, roleCheck('teacher', 'admin'), getAttendanceBySession);

module.exports = router;
