const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: String,
  projects: [String],
  companies: [String]
});

module.exports = mongoose.model('Skill', SkillSchema);
