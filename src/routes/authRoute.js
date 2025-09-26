const express = require('express');
const router = express.Router();
const {register, login,forgetPassword, resetPassword, profile} = require('../controllers/authController');
const auth = require ('../middleware/authMiddleware');

// Public routes
router.post ('/register', register);
router.post ('/login', login);
router.post ('/forgot-password', forgetPassword);
router.post ('/reset-password/:token', resetPassword);
router.get ('/profile', auth, profile);

module.exports = router;