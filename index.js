const express = require('express');
const axios = require('axios')
const NodeCache = require('node-cache')
const cache = new NodeCache ({ stdTTL: 300 })
const cors = require('cors')
require('dotenv').config()
const app = express();
const PORT = process.env.PORT || 5000;
// const apiKey = process.env.BACKEND_API_KEY
const apiKey = '+LNP8mg1hDCqYaUM+C6ElQ==xZ3S7GJWP3oQZBvU'

app.use(cors())

// endpoint for api key
app.get('/api/api-key', async (req, res) => {
  res.json({ apiKey: apiKey })
})

// endpoint for exercises
app.get('/api/exercises', async (req, res) => {
  const cacheKey = 'exerciseData'
  const cachedData = cache.get(cacheKey)
  
  if (cachedData && cachedData.muscle === req.query.muscle) {
    console.log('Serving from cache')
    return res.json(cachedData)
  }

  try {
    const muscle = req.query.muscle
    console.log("Received muscle:", muscle)
    const response = await axios({
      method: 'GET',
      url: `https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`,
      headers: { 'X-API-KEY': apiKey }
    })
    cache.set(cacheKey, { muscle: muscle, data: response.data})
    res.json(response.data)
    } catch (error) {
        console.error("Failed to fetch data:", error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
})

// Route handler for the root path
app.get('/', (req, res) => {
    res.send('Server is running');
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });