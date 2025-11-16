const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// IMPORTANT: Enable CORS BEFORE other middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Parse JSON bodies
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'Proxy server is running',
    endpoints: {
      health: 'GET /health',
      proxy: 'POST /api/n8n/webhook'
    },
    timestamp: new Date().toISOString() 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    n8nUrl: process.env.N8N_WEBHOOK_URL ? 'configured' : 'missing'
  });
});

// Proxy endpoint - EXACT PATH
app.post('/api/n8n/webhook', async (req, res) => {
  console.log('\n=== Proxy Request Received ===');
  console.log('Target URL:', process.env.N8N_WEBHOOK_URL);
  console.log('Request Body:', JSON.stringify(req.body, null, 2));

  try {
    if (!process.env.N8N_WEBHOOK_URL) {
      throw new Error('N8N_WEBHOOK_URL not configured in .env file');
    }

    const response = await axios.post(
      process.env.N8N_WEBHOOK_URL,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('=== n8n Response ===');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));

    res.status(response.status).json(response.data);

  } catch (error) {
    console.error('\n=== Proxy Error ===');
    console.error('Error Message:', error.message);
    
    if (error.response) {
      console.error('n8n Response Status:', error.response.status);
      console.error('n8n Response Data:', error.response.data);
      
      res.status(error.response.status).json({
        error: 'n8n error',
        message: error.message,
        details: error.response.data
      });
    } else if (error.request) {
      console.error('No response from n8n');
      
      res.status(503).json({
        error: 'Service unavailable',
        message: 'Could not reach n8n server',
        details: error.message
      });
    } else {
      console.error('Request setup error:', error.message);
      
      res.status(500).json({
        error: 'Proxy error',
        message: error.message
      });
    }
  }
});

// Catch-all 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Not found',
    message: `Route ${req.method} ${req.path} does not exist`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'POST /api/n8n/webhook'
    ]
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Endpoints:`);
  console.log(`  - GET  http://localhost:${PORT}/`);
  console.log(`  - GET  http://localhost:${PORT}/health`);
  console.log(`  - POST http://localhost:${PORT}/api/n8n/webhook`);
  console.log(`${'='.repeat(50)}`);
  console.log(`n8n Target: ${process.env.N8N_WEBHOOK_URL || 'NOT CONFIGURED'}`);
  console.log(`${'='.repeat(50)}\n`);
});

module.exports = app;