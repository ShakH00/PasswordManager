// Import Express and CORS
const express = require('express') // Import express library (server creation, route definition, handles HTTP requests)
const cors = require('cors') // Import cross-origin resource sharing library (allows backend to frontend comms on a diff domain or port)
const pool = require('./db') // Import the connection pool from db.js
const bcrypt = require('bcrypt') // Import bcrypt for password hashing
const jwt = require('jsonwebtoken') // Import jwt for authentication handling

// Create an instance of express
const app = express() // Main object of the server (express instance)
const PORT = process.env.PORT || 5000 // process.env.PORT allows for dynamic assignment in a production environment
const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true, // Enable credentials (cookies, etc.)
}
// Middleware
app.use(cors(corsOptions)) // Allows frontend to make API requests to your backend (http://localhost:5000)
app.use(express.json()) // Middleware to parse JSON data, "understanding JSON payloads"

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'] // Get authorization header
  const token = authHeader && authHeader.split(' ')[1] // Extract token

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Token missing.' })
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Attach decoded payload to the request object
    next() // Continue, skipping rest of the code
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' })
  }
}