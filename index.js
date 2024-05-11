const express = require('express');
const axios = require('axios')
const NodeCache = require('node-cache')
const cache = new NodeCache ({ stdTTL: 300 })
const cors = require('cors')
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())

app.get('/api/api-key', async (req, res) => {
    const cacheKey = 'exerciseData'
    const cachedData = cache.get(cacheKey)

    if (cachedData) {
        console.log('Serving from cache')
        return res.json(cachedData)
    }

  try {
    const response = await axios.get('https://api.api-ninjas.com/v1/exercises', {
        Headers: {
            'X-API-KEY': process.env.BACKEND_API_KEY
        }
    })  
    cache.set(cacheKey, response.data)
    res.json(response.data)
    } catch (error) {
        console.error("Failed to fetch data:", error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
  });
  
// Route handler for the root path
app.get('/', (req, res) => {
    res.send('Server is running');
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });