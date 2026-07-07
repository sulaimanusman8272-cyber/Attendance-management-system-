const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { createSession, getSessionsByCourse } = require('../controllers/sessionController');

router.post('/', auth, roleCheck('teacher', 'admin'), createSession);
router.get('/course/:course_id', auth, getSessionsByCourse);

module.exports = router;
