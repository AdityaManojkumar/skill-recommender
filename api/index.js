const express = require('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('../routes/auth');
app.use('/auth', authRoutes);

// Export handler
module.exports = app;
