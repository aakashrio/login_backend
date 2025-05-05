const express = require('express');
const router = express.Router();
const { login, signup, forgotpassword, sendOtp, verifyOtp , changepassword } = require('../controller/user.controller');

// Other routes...
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotpassword', forgotpassword);
router.post('/reset-password/:token',changepassword)
router.post('/verifyemail', sendOtp);
router.post('/verifyotp', verifyOtp);

module.exports = router;
