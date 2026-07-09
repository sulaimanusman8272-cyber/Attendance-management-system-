const express = require('express');
const router = express.Router();
const { register, login, signup } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/signup', signup);

module.exports = router;
