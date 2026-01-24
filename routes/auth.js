const express = require('express');
const router = express.Router();
const { sendOTPToUser, verifyOTP, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/send-otp', sendOTPToUser);
router.post('/verify-otp', verifyOTP);
router.post('/logout', protect, logout);

module.exports = router;