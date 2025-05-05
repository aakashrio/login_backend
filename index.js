const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./services/database');  // Database connection
const userRoutes = require('./routes/routers');  // Import your routes

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Register routes
app.use('/auth', userRoutes);  // Make sure to include '/api' or change to your desired base route

app.get('/status', (req, res) => {
  res.json({ status: 'online' });
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

// Connect to the database and then start the server
connectDB().then(() => {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`);
  });
});
