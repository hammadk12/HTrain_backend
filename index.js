const express = require('express');
const axios = require('axios')
const NodeCache = require('node-cache')
const cors = require('cors')
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 5000;
const apiKey = process.env.API_KEY
const apiKey2 = process.env.API_KEY_E
const cache = new NodeCache ({ stdTTL: 7200 })

const frontendUrl = 'https://htrain-frontend-hammads-projects-216b65c7.vercel.app'

app.use(cors({
  origin: frontendUrl,
  methods: ['GET', 'POST'],
  credentials: true,
  
}))


// endpoint for api key 1
app.get('/api/api-key', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ apiKey: apiKey })
})

// endpoint for exercises api-ninja
app.get('/api/exercises', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');

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


// endpoint for api key 2
app.get('/api/api-key2', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.json({ apiKey2: apiKey2 })
})

// endpoint for exercises rapid-api
app.get('/api/exercises-rapidapi', async (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  
  const { muscle } = req.query
  const cacheKey = `exerciseDataRapidAPI`
  const cachedData = cache.get(cacheKey)

  if (cachedData && Date.now() - cachedData.timestamp < 7200 * 1000 && cachedData.data[muscle]) {
    console.log('Serving from cache')
    return res.json(cachedData.data[muscle])
  }

  try {
    console.log("Received muscle:", muscle)
    const response = await axios ({
      method: 'GET', 
      url: 'https://work-out-api1.p.rapidapi.com/search',
      params: { Muscles: muscle},
      headers: {
        'X-RapidAPI-Key': apiKey2,
        'X-RapidAPI-Host': 'work-out-api1.p.rapidapi.com',
      },
    })
    const newData = cachedData ? cachedData.data : {}
    newData[muscle] = response.data
    cache.set(cacheKey, { timestamp: Date.now(), data: newData })
    res.json(response.data)
  } catch (error) {
    console.error('Failed to fetch data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
})

// Route handler for the root path
app.get('/', (req, res) => {
    res.send('Server is running!!!!!!!!!!!!!');
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });