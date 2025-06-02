const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

// Create MySQL connection pool (update with your credentials)
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
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }
  try {
    // Fetch user by username
    const sql = 'SELECT * FROM users WHERE username = ?';
    const results = await query(sql, [username]);
    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = results[0];

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registration route
router.post('/register', async (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Username, password, and email required' });
  }
  try {
    // Check if username exists
    const existingUser = await query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user securely
    const insertSql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
    await query(insertSql, [username, hashedPassword, email]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
