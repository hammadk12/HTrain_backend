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

const allowedOrigins = [
  'https://htrain-frontend-hammads-projects-216b65c7.vercel.app',
  'https://htrain-frontend.vercel.app/'
]

app.use(cors())

// setting CORS headers explicitly
const setCORSHeaders = (res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
}

// endpoint for api key 1
app.get('/api/api-key', async (req, res) => {
  try {
    setCORSHeaders(res);
    res.json({ apiKey: apiKey });
  } catch (error) {
    console.error('Error in /api/api-key:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// endpoint for exercises api-ninja
app.get('/api/exercises', async (req, res) => {
  try {
    setCORSHeaders(res)
  
  const cacheKey = 'exerciseData'
  const cachedData = cache.get(cacheKey)
  
  if (cachedData && cachedData.muscle === req.query.muscle) {
    console.log('Serving from cache')
    return res.json(cachedData)
  }

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
        if (error.response && error.response.status === 429) {
          res.status(429).json({error: 'API limit reached. Please try again later and contact admin'})
        } else {
          res.status(500).json({ error: 'Failed to fetch data' });
        }
    }
})


// endpoint for api key 2
app.get('/api/api-key2', async (req, res) => {
  try {
    setCORSHeaders(res)
    res.json({ apiKey2: apiKey2 });
  } catch (error) {
    console.error('Error in /api/api-key2:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// endpoint for exercises rapid-api
app.get('/api/exercises-rapidapi', async (req, res) => {
  try {
    setCORSHeaders(res);
  
  const { muscle } = req.query
  const cacheKey = `exerciseDataRapidAPI`
  const cachedData = cache.get(cacheKey)

  if (cachedData && Date.now() - cachedData.timestamp < 7200 * 1000 && cachedData.data[muscle]) {
    console.log('Serving from cache')
    return res.json(cachedData.data[muscle])
  }

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

    if (error.response && error.response.status === 429) {
      res.status(429).json({error: 'API limit reached. Please try again later and contact admin'})
    } else {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  }
})

// Route handler for the root path
app.get('/', (req, res) => {
    res.send('Server is running!!!!!!!!!!!!!');
  });

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });