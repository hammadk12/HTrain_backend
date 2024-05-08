const express = require('express');
const app = express();
const PORT = 5000;
const cors = require('cors')

app.use(cors())

// Middleware to check for API key
const checkApiKey = (req, res, next) => {
    const apiKey = req.header('X-API-KEY');
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

app.get('/api/exercises', checkApiKey, (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});
  
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});