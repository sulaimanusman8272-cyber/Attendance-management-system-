const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { studentAttendanceReport, defaulterList, courseSummary } = require('../controllers/reportController');

router.get('/course/:course_id/attendance', auth, roleCheck('teacher', 'admin'), studentAttendanceReport);
router.get('/course/:course_id/defaulters', auth, roleCheck('teacher', 'admin'), defaulterList);
router.get('/summary', auth, roleCheck('admin'), courseSummary);

module.exports = router;
