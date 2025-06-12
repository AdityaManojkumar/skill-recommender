const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise'); // use promise-based client

// Create MySQL connection pool (adjust with your own config)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'your_database_name',
});

// Helper function to query with promises
async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Render register page
router.get('/register', (req, res) => {
  res.render('register');
});

// Registration route
router.post('/register', async (req, res) => {
  const { username, email, collegeID, password } = req.body;

  if (!username || !email || !password || !collegeID) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Check if username or email already exists
    const existingUsers = await query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user securely
    await query(
      'INSERT INTO users (username, email, collegeID, password) VALUES (?, ?, ?, ?)',
      [username, email, collegeID, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // Fetch user by username
    const users = await query('SELECT * FROM users WHERE username = ?', [username]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const user = users[0];

    // Compare hashed passwords
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Login success: you can create session or JWT here
    // For example:
    // req.session.userId = user.id;
    // or return JWT token

    res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
