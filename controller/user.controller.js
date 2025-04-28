const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const moment = require('moment');  

let otpStore = {};  

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res.status(404).json({ code: 1, message: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, userExists.password);
    if (!isPasswordValid) {
      return res.status(401).json({ code: 1, message: 'Invalid password' });
    }

    const token = jwt.sign({ id: userExists._id, username: userExists.name, email }, process.env.JWT_SECRET);  // Use environment variable for secret
    return res.status(200).json({
      code: 0,
      message: 'Login successful',
      username: userExists.name,
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 1, message: 'Internal server error' });
  }
};

const forgotpassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ code: 1, message: 'User not found' });
    }

    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,   // your email
        pass: process.env.EMAIL_PASS,   // your app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Link',
      html: `
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ code: 0, message: 'Reset link sent to your email' });

  } catch (error) {
    console.error('Error sending email', error);
    return res.status(500).json({ code: 1, message: 'Failed to send email' });
  }
};

const changepassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the password
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    return res.status(200).json({ code: 0, message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    return res.status(400).json({ code: 1, message: 'Invalid or expired token' });
  }
};


const signup = async (req, res) => {
  const { username, email, password } = req.body;
  
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ code: 1, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name: username,
      email,
      password: hashedPassword,
      isVerified: false,  // Add verification status field
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, username, email }, process.env.JWT_SECRET);  // Use environment variable for secret
    return res.status(201).json({ code: 0, message: 'User created successfully', token });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 1, message: 'Unable to create user' });
  }
};


const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email]) {
    return res.status(400).json({ code: 1, message: 'OTP not sent or expired' });
  }

  const { otp: storedOtp, expiresAt } = otpStore[email];

  if (Date.now() > expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ code: 1, message: 'OTP expired' });
  }

  if (parseInt(otp) !== storedOtp) {
    return res.status(400).json({ code: 1, message: 'Invalid OTP' });
  }

  delete otpStore[email]; // OTP is verified, remove it
  return res.status(200).json({ code: 0, message: 'OTP verified successfully' });
};

// inside your controller.js

const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ code: 1, message: "Email is required" });
  }

  // Generate 6 digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Save OTP and expiration (5 mins)
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 5 minutes expiry
  };

  // Send email with nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    html: `<h2>Your OTP Code is: ${otp}</h2><p>It will expire in 10 minutes.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ code: 0, message: "OTP sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 1, message: "Failed to send OTP" });
  }
};





module.exports = { signup, login, forgotpassword, changepassword ,sendOtp, verifyOtp };
