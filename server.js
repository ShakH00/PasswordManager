// Import Express and CORS
const express = require('express') // Import express library (server creation, route definition, handles HTTP requests)
const cors = require('cors') // Import cross-origin resource sharing library (allows backend to frontend comms on a diff domain or port)
const pool = require('./db') // Import the connection pool from db.js
const bcrypt = require('bcrypt') // Import bcrypt for password hashing
const jwt = require('jsonwebtoken') // Import jwt for authentication handling
require('dotenv').config() // Get JWT secret from here

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
// Routes (Define a basic route)
app.get('/', (req, res) => {
    // Response to a client's GET request
    res.send('Hello from the backend!')
})
// Test route for DB query
app.get('/test-db', async (req, res) => {
    try {
      const result = await pool.query('SELECT NOW()') // Test query to get the current time
      res.json({
        message: 'Database connection successful!',
        time: result.rows[0].now,
      })
    } catch (error) {
      console.error('Database connection error: ', error.message)
      res.status(500).json({ error: 'Database connection failed.' })
    }
})
// Endpoint to register users
app.post('/register', async (req, res) => {
  const {username, email, password} = req.body
  try {
    // Check if user exists first
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({Error: 'Email already exists, login or choose a different one.'})
    }
    // Hash password using bcrypt
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password) 
       VALUES ($1, $2, $3)
       RETURNING uid, username, email, profile_path
      `, [username, email, hashedPassword]
    )
    // Create default vault
    await pool.query(
      `INSERT INTO vaults (uid, name) VALUES ($1, $2)`,
      [uid, 'Default Vault']
    )
    res.status(201).json({
      message: 'User registered successfully.',
      user: newUser.rows[0]
    })
  } catch (error) {
    console.error('Registration error: ', error.message)
    res.status(500).json({error: 'Error during registration.'})
  }
})
// Endpoint to login after registration
app.post('/login', async (req, res) => {
  const {email, password} = req.body
  try {
    const userResult = await pool.query(
      'SELECT uid, username, email, password, profile_path FROM users WHERE email = $1', [email]
    )
    if (userResult.rows.length === 0) {
      return res.status(400).json({error: 'Invalid email or password'})
    }
    const user = userResult.rows[0]
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({error: 'Invalid email or password.'})
    }
    const token = jwt.sign({uid: user.uid, email: user.email}, process.env.JWT_SECRET, 
      {expiresIn: '10m',  
    })
    res.json({
      token,
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        profile_path: user.profile_path,
      },
    })
  } catch (error) {
    console.error('Login error: ', error.message)
    res.status(500).json({error: 'Error during login.'})
  }
})
// User profile data endpoint
app.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT uid, username, email, profile_path FROM users WHERE uid = $1', [req.user.uid]
    )
    if (result.rows.length === 0) {
      return res.status(400).json({error: 'User not found.'})
    }
    res.json(result.rows[0])
  } catch (error) {
    console.error('Fetch /me error: ', error.message)
    res.status(500).json({error: 'Error fetching user data.'})
  }
})
// Endpoint to get vault information
app.get('/vaults', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT vid, name FROM vaults WHERE uid = $1', [req.user.uid]
    )
    res.json(rows)
  } catch (error) {
    console.error('Error fetching vaults: ', error.message)
    res.status(500).json({error: 'Could not retrieve vaults'})
  }
})
// Start the server
app.listen(PORT, () => {
    // PORT to listen for requests
    console.log(`Server is running on http://localhost:${PORT}`)
  })