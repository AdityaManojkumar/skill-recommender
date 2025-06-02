const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    collegeId: String,
    name: String,
    dob: String,
    semester: String,
    subjects: [String],
    skills: [String]
});

module.exports = mongoose.model('User', userSchema);
