// Import Express and CORS
const express = require("express"); // Import express library (server creation, route definition, handles HTTP requests)
const cors = require("cors"); // Import cross-origin resource sharing library (allows backend to frontend comms on a diff domain or port)
const pool = require("./db"); // Import the connection pool from db.js
const bcrypt = require("bcrypt"); // Import bcrypt for password hashing
const jwt = require("jsonwebtoken"); // Import jwt for authentication handling
require("dotenv").config(); // Get JWT secret from here
const { encrypt } = require("./encryption"); // Encrypt method to encrypt vault's passwords
const { decrypt } = require("./encryption"); // Decrypt method to decrypt vault's passwords when fetching

// Create an instance of express
const app = express(); // Main object of the server (express instance)
const PORT = process.env.PORT || 5000; // process.env.PORT allows for dynamic assignment in a production environment
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // Enable credentials (cookies, etc.)
};
// Middleware
app.use(cors(corsOptions)); // Allows frontend to make API requests to your backend (http://localhost:5000)
app.use(express.json()); // Middleware to parse JSON data, "understanding JSON payloads"

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"]; // Get authorization header
  const token = authHeader && authHeader.split(" ")[1]; // Extract token

  if (!token) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }
  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload to the request object
    next(); // Continue, skipping rest of the code
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}
// Routes (Define a basic route)
app.get("/", (req, res) => {
  // Response to a client's GET request
  res.send("Hello from the backend!");
});
// Test route for DB query
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()"); // Test query to get the current time
    res.json({
      message: "Database connection successful!",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection error: ", error.message);
    res.status(500).json({ error: "Database connection failed." });
  }
});
// Endpoint to register users
app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Check if user exists first
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({
        Error: "Email already exists, login or choose a different one.",
      });
    }
    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const newUser = await pool.query(
      `INSERT INTO users (username, email, password) 
       VALUES ($1, $2, $3)
       RETURNING uid, username, email, profile_path
      `,
      [username, email, hashedPassword]
    );
    if (!newUser.rows[0]) {
      throw new Error("Failed to create user");
    }
    const uid = newUser.rows[0].uid;
    // Create default vault
    const defaultVault = await pool.query(
      `INSERT INTO vaults (uid, name) VALUES ($1, $2) RETURNING vid`,
      [uid, "Default Vault"]
    );
    const vid = defaultVault.rows[0].vid;

    const emptyEncrypted = encrypt("");
    // Default passwords
    await pool.query(
      `INSERT INTO passwords(vid, name, url, username, password) VALUES
      ($1, 'YouTube', 'https://youtube.com', $2, $3),
      ($1, 'Instagram', 'https://instagram.com', $2, $3),
      ($1, 'Outlook', 'https://outlook.com', $2, $3),
      ($1, 'Google', 'https://accounts.google.com', $2, $3),
      ($1, 'Facebook', 'https://facebook.com', $2, $3)
      `,
      [vid, email, emptyEncrypted]
    );
    res.status(201).json({
      message: "User registered successfully.",
      user: newUser.rows[0],
    });
  } catch (error) {
    console.error("Registration error: ", error.message);
    res.status(500).json({ error: "Error during registration." });
  }
});
// Endpoint to login after registration
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query(
      "SELECT uid, username, email, password, profile_path FROM users WHERE email = $1",
      [email]
    );
    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid email or password." });
    }
    const token = jwt.sign(
      { uid: user.uid, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    await pool.query(
      `INSERT INTO logs (uid, action, date, time)
       VALUES ($1, $2, CURRENT_DATE, CURRENT_TIME)`,
      [user.uid, "User logged in"]
    );
    res.json({
      token,
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        profile_path: user.profile_path,
      },
    });
  } catch (error) {
    console.error("Login error: ", error.message);
    res.status(500).json({ error: "Error during login." });
  }
});
// User profile data endpoint
app.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT uid, username, email, profile_path FROM users WHERE uid = $1",
      [req.user.uid]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "User not found." });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Fetch /me error: ", error.message);
    res.status(500).json({ error: "Error fetching user data." });
  }
});
// Endpoint to get vault information
app.get("/vaults", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT vid, name FROM vaults WHERE uid = $1",
      [req.user.uid]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching vaults: ", error.message);
    res.status(500).json({ error: "Could not retrieve vaults" });
  }
});
// Endpoint to modify passwords
app.put("/passwords/:pid", authenticateToken, async (req, res) => {
  const { pid } = req.params;
  const { name, username, password, url } = req.body;

  try {
    const entry = await pool.query(
      `
      SELECT p.*, v.uid FROM passwords p
      JOIN vaults v ON p.vid = v.vid
      WHERE p.pid = $1
      `,
      [pid]
    );
    if (entry.rows.length === 0) {
      return res.status(404).json({ error: "Password entry not found." });
    }
    const passwordEntry = entry.rows[0];
    if (passwordEntry.uid != req.user.uid) {
      return res
        .status(403)
        .json({ error: "Unauthorized to modify this password" });
    }
    const encryptedPassword = encrypt(password); // Encrypt password before adding it to database
    // Update password
    await pool.query(
      `UPDATE passwords
       SET name = $1, username = $2, password = $3, url = $4
       WHERE pid = $5`,
      [name, username, encryptedPassword, url, pid]
    );
    res.json({ message: "Password entry updated." });
  } catch (error) {
    console.error("Update error: ", error.message);
    res.status(500).json({ error: "Failed to update password" });
  }
});
// Endpoint to get all paswords for the default vault
app.get("/vaults/:vid/passwords", authenticateToken, async (req, res) => {
  const { vid } = req.params;

  try {
    // Check if vault belongs to user
    const vaultCheck = await pool.query(
      "SELECT * FROM vaults WHERE vid = $1 AND uid = $2",
      [vid, req.user.uid]
    );
    if (vaultCheck.rows.length === 0) {
      return res.status(403).json({ error: "Access denied." });
    }
    // Fetch passwords for the vault
    const passwords = await pool.query(
      `SELECT pid, name, url, username, password
       FROM passwords
       WHERE vid = $1`,
      [vid]
    );
    // Decrypt each password
    const decryptedPasswords = passwords.rows.map((entry) => ({
      ...entry,
      password: decrypt(entry.password),
    }));
    res.json(decryptedPasswords);
  } catch (error) {
    console.error("Error fetching passwords: ", error.message);
    res.status(500).json({ error: "Could not fetch passwords." });
  }
});
// Endpoint to add new password entries to vault
app.post("/vaults/:vid/passwords", authenticateToken, async (req, res) => {
  const { vid } = req.params;
  const { name, url, username, password } = req.body;

  try {
    // Verify vault
    const checkVault = await pool.query(
      "SELECT * FROM vaults WHERE vid = $1 AND uid = $2",
      [vid, req.user.uid]
    );
    if (checkVault.rows.length === 0) {
      return res.status(403).json({ error: "Access denied" });
    }
    // Encrypt password
    const encryptedPassword = encrypt(password);

    const insert = await pool.query(
      `INSERT INTO passwords (vid, name, url, username, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING pid, name, url, username`,
      [vid, name, url, username, encryptedPassword]
    );
    res.status(201).json({
      message: "Password added",
      password: insert.rows[0],
    });
  } catch (error) {
    console.error("Error while adding password: ", error.message);
    res.status(500).json({ error: "Failed to add password." });
  }
});

// Start the server
app.listen(PORT, () => {
  // PORT to listen for requests
  console.log(`Server is running on http://localhost:${PORT}`);
});
