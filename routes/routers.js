const express = require('express');
const { signup, login , forgotpassword , changepassword} = require('../controller/user.controller');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgotpassword',forgotpassword)
router.post('/reset-password/:token', changepassword);

module.exports = router;
