const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { createCourse, getCourses, enrollStudent } = require('../controllers/courseController');

router.post('/', auth, roleCheck('teacher', 'admin'), createCourse);
router.get('/', auth, getCourses);
router.post('/enroll', auth, roleCheck('admin', 'teacher'), enrollStudent);

module.exports = router;
