const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');

// Signup handler
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
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id, username, email }, process.env.JWT_SECRET);  // Use environment variable for secret
    return res.status(201).json({ code: 0, message: 'User created successfully', token });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ code: 1, message: 'Unable to create user' });
  }
};

// Login handler
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

module.exports = { signup, login };
