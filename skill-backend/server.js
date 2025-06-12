const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const client = require('prom-client');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Prometheus metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const register = client.register;

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Sample route
app.get('/', (req, res) => {
  res.send('SkillMatch Backend is running!');
});

app.get('/leetcode/:skill', async (req, res) => {
  const skill = req.params.skill.toLowerCase();
  const dummyQuestions = {
    javascript: ["Two Sum", "Valid Parentheses", "Merge Intervals"],
    python: ["Add Two Numbers", "Longest Substring", "Word Ladder"],
    java: ["LRU Cache", "Median of Two Sorted Arrays", "Clone Graph"]
  };
  res.json(dummyQuestions[skill] || ["No questions found."]);
});

app.get('/leetcode/:skill', async (req, res) => {
  const skill = req.params.skill.toLowerCase();
  const dummyQuestions = {
    javascript: ["Two Sum", "Valid Parentheses", "Merge Intervals"],
    python: ["Add Two Numbers", "Longest Substring", "Word Ladder"],
    java: ["LRU Cache", "Median of Two Sorted Arrays", "Clone Graph"]
  };
  res.json(dummyQuestions[skill] || ["No questions found."]);
});



// MongoDB connection (use your own URI)
mongoose.connect('mongodb://localhost:27017/skillmatch', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected");
}).catch(err => {
  console.error("MongoDB connection failed:", err);
});

app.listen(PORT, () => {
  console.log(`SkillMatch Backend running on port ${PORT}`);
});
