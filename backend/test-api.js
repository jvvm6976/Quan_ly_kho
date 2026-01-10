const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Categories test route
app.get('/api/categories', (req, res) => {
  res.json([
    { id: 1, name: 'CPUs', description: 'Central Processing Units' },
    { id: 2, name: 'Motherboards', description: 'Computer Motherboards' },
    { id: 3, name: 'Memory', description: 'RAM and Memory Modules' },
    { id: 4, name: 'Storage', description: 'Hard Drives and SSDs' },
    { id: 5, name: 'Graphics Cards', description: 'Video and Graphics Cards' }
  ]);
});

// Start server
app.listen(PORT, () => {
  console.log(`Test API server is running on port ${PORT}`);
});
