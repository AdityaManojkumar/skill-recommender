const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

// Create MySQL connection pool (adjust with your own config)
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_mysql_user',
  password: 'your_mysql_password',
  database: 'your_database_name',
});

// Helper function to query with promises
const query = (sql, params) =>
  new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) reject(error);
      else resolve(results);
    });
  });

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Validate input (basic)
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    // Use parameterized query to prevent SQL Injection
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const results = await query(sql, [username, password]);

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // User found — create session or JWT here (simplified)
    res.json({ message: 'Login successful', user: results[0] });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registration route example
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email required' });
  }

  try {
    // Check if username already exists
    const existingUser = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Insert new user securely
    const insertSql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    await query(insertSql, [username, password, email]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
