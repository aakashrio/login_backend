// database.js
const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables from .env file

// MongoDB connection URL from environment variable
const DATA_BASE_URL = process.env.DATA_BASE_URL || 'your-mongodb-connection-string-here';

// Function to connect to the database
const connectDB = async () => {
  try {
    await mongoose.connect(DATA_BASE_URL);  // Removed deprecated options
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);  // Exit the process if connection fails
  }
};

// Export the connection function to be used in other files
module.exports = connectDB;
