const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Skill = require('../models/Skill');

router.get('/dashboard', async (req, res) => {
  const user = await User.findById(req.session.userId);
  res.render('dashboard', { user });
});

router.post('/dashboard', async (req, res) => {
  const { name, dob, semester, subjects, skills } = req.body;
  await User.findByIdAndUpdate(req.session.userId, {
    name,
    dob,
    semester,
    subjects: subjects.split(','),
    skills: skills.split(',')
  });
  res.redirect('/recommendations');
});

router.get('/recommendations', async (req, res) => {
  const user = await User.findById(req.session.userId);
  const recommendations = await Skill.find({ name: { $in: user.skills } });
  res.render('recommendations', { recommendations });
});

module.exports = router;
