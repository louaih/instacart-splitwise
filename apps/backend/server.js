const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')

const app = express()
const PORT = process.env.PORT || 3001

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true
}))

app.use(express.json())

// Proxy endpoint for Splitwise API
app.all('/api/splitwise/*', async (req, res) => {
  try {
    const endpoint = req.path.replace('/api/splitwise', '')
    const url = `https://secure.splitwise.com/api/v3.0${endpoint}`
    
    console.log(`Proxying request to: ${url}`)
    console.log('Request method:', req.method)
    console.log('Request headers:', req.headers)
    console.log('Request body:', req.body)
    
    const headers = {
      'Authorization': req.headers.authorization,
      'Content-Type': 'application/json'
    }
    
    // Prepare the request options
    const requestOptions = {
      method: req.method,
      headers
    }
    
    // Only add body for non-GET requests
    if (req.method !== 'GET' && req.body) {
      requestOptions.body = JSON.stringify(req.body)
      console.log('Request body being sent:', requestOptions.body)
    }
    
    const response = await fetch(url, requestOptions)
    
    console.log(`Response status: ${response.status}`)
    
    const data = await response.text()
    console.log('Response data:', data)
    
    // Set the same content type as the original response
    res.set('Content-Type', response.headers.get('content-type') || 'application/json')
    res.status(response.status).send(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Proxy request failed', details: error.message })
  }
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Splitwise proxy server is running' })
})

app.listen(PORT, () => {
  console.log(`Splitwise proxy server running on port ${PORT}`)
}) 