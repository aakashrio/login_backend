const express = require('express');
const router = express.Router();
const { login, signup, forgotpassword, sendOtp, verifyOtp } = require('../controller/user.controller');

// Other routes...
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotpassword', forgotpassword);
router.post('/verifyemail', sendOtp);   // <-- New
router.post('/verifyotp', verifyOtp);    // <-- New

module.exports = router;
