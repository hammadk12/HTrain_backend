require('dotenv').config()
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware')
const app = express();
const PORT = 5000;
const cors = require('cors')

app.use(cors())

app.get('/api/api-key', (req, res) => {
    res.json({ apiKey: process.env.BACKEND_API_KEY });
  });
  
  // Middleware to check for API key
  const checkApiKey = (req, res, next) => {
    const apiKey = req.header('X-API-KEY');
    if (!apiKey || apiKey !== process.env.BACKEND_API_KEY) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  };

  // Proxy middleware configuration
app.use(
    '/api/exercises',
    createProxyMiddleware({
      target: 'https://api.api-ninjas.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/exercises': '/v1/exercises',
      },
    })
  );
  
  // Route handler for the root path
app.get('/', (req, res) => {
    res.send('Server is running');
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });