require('dotenv').config()

const { Pool } = require('pg') // Desconstruct pg to get the Pool module only

// Create a connection pool
const pool = new Pool({
  user: process.env.DB_USER, // Replace with PostgreSQL username
  host: process.env.DB_HOST, // Database host (Local development)
  database: process.env.DB_DATABASE, // Database name
  password: process.env.DB_PASSWORD, // Password field
  port: process.env.DB_PORT, // Default PosgreSQL port
})

// Exports the pool for use in other files
module.exports = pool
