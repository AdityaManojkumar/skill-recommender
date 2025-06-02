const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware to keep user data between pages
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: true,
}));

// Connect MongoDB
const mongoURL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/skillRecommenderDB';

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// User schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  collegeID: String,
  name: String,
  dob: String,
  semester: Number,
  college: String,
  subjects: [String],
  skills: [String]
});
const User = mongoose.model('User', userSchema);

// Subjects and Skills options
const subjectsList = [
  "Mathematics", "Physics", "Chemistry", "Data Structures", "Algorithms",
  "Operating Systems", "Database Systems", "Computer Networks", "Software Engineering",
  "Machine Learning", "Artificial Intelligence", "Web Development",
  "Mobile App Development", "Cloud Computing", "Cyber Security", "Blockchain",
  "Microprocessors", "Embedded Systems", "Digital Electronics", "Control Systems"
];

const skillsList = [
  "Python", "Machine Learning", "React", "Data Structures", "DBMS",
  "Blockchain", "Cyber Security", "Java", "HTML", "CSS", "JavaScript",
  "Algorithms", "Operating Systems", "Computer Networks", "Software Engineering",
  "Artificial Intelligence", "Web Development", "Mobile App Development",
  "Cloud Computing", "Microprocessors", "Embedded Systems", "Digital Electronics",
  "Control Systems"
];

// Projects recommendations
const projectRecommendations = {
  "Python": ["AI Chatbot", "Web Scraper", "Automation Scripts"],
  "Machine Learning": ["Stock Price Predictor", "Student Performance Analyzer"],
  "React": ["Portfolio Website", "Skill-based Recommender System"],
  "Data Structures": ["Library Management System", "Scheduling Algorithm Visualizer"],
  "DBMS": ["College Database System", "Inventory Tracker"],
  "Blockchain": ["Decentralized Voting App", "Crypto Wallet"],
  "Cyber Security": ["Vulnerability Scanner", "Secure Login System"],
  "Java": ["Bank Management System", "E-commerce Application"],
  "HTML": ["Portfolio Website", "Online Resume Builder"],
  "CSS": ["Animated Landing Page", "Responsive Blog"],
  "JavaScript": ["Interactive Quiz App", "Real-time Chat App"],
  "Algorithms": ["Pathfinding Visualizer", "Sorting Algorithm Visualizer"],
  "Operating Systems": ["Process Scheduler Simulator", "Memory Management Visualizer"],
  "Database Systems": ["E-commerce Backend", "Inventory Management System"],
  "Computer Networks": ["Packet Sniffer", "Chat Application"],
  "Software Engineering": ["Bug Tracker", "Project Management Tool"],
  "Artificial Intelligence": ["Image Classifier", "Voice Assistant"],
  "Web Development": ["Blog Platform", "Event Booking Website"],
  "Mobile App Development": ["Fitness Tracker App", "Expense Manager"],
  "Cloud Computing": ["Serverless URL Shortener", "Cloud Storage App"],
  "Microprocessors": ["Arduino Home Automation", "Sensor Data Logger"],
  "Embedded Systems": ["Smart Door Lock", "Temperature Controller"],
  "Digital Electronics": ["Logic Gate Simulator", "Digital Clock"],
  "Control Systems": ["PID Controller Simulator", "Robot Arm Control"],
};

// Company recommendations
const companyRecommendations = {
  "Python": ["TCS", "Infosys", "Zoho"],
  "Machine Learning": ["Google", "Amazon", "NVIDIA"],
  "React": ["Flipkart", "Zomato", "Paytm"],
  "Data Structures": ["Microsoft", "Amazon", "Samsung"],
  "DBMS": ["Oracle", "IBM", "SAP Labs"],
  "Blockchain": ["Polygon", "CoinDCX", "Binance"],
  "Cyber Security": ["CrowdStrike", "Palo Alto Networks", "Cisco"],
  "Java": ["Wipro", "Capgemini", "Accenture"],
  "HTML": ["Freshworks", "Razorpay", "Zoho"],
  "CSS": ["Swiggy", "Meesho", "Nykaa"],
  "JavaScript": ["Dream11", "CRED", "BrowserStack"],
  "Algorithms": ["Google", "Facebook", "Amazon"],
  "Operating Systems": ["Intel", "Qualcomm", "IBM"],
  "Database Systems": ["MongoDB", "Oracle", "Microsoft"],
  "Computer Networks": ["Cisco", "Juniper", "Huawei"],
  "Software Engineering": ["Infosys", "TCS", "Accenture"],
  "Artificial Intelligence": ["OpenAI", "DeepMind", "Microsoft"],
  "Web Development": ["Shopify", "Airbnb", "Facebook"],
  "Mobile App Development": ["Google", "Apple", "Samsung"],
  "Cloud Computing": ["AWS", "Azure", "Google Cloud"],
  "Microprocessors": ["Intel", "AMD", "Texas Instruments"],
  "Embedded Systems": ["Bosch", "Honeywell", "Siemens"],
  "Digital Electronics": ["Texas Instruments", "Qualcomm", "Analog Devices"],
  "Control Systems": ["ABB", "Siemens", "Schneider Electric"],
};

// ===== ROUTES =====

// Login Page
app.get('/', (req, res) => {
  res.render('login'); // show login page
});

app.post('/login', (req, res) => {
  // Save login details in session
  const { username, email, collegeID } = req.body;
  req.session.userData = { username, email, collegeID };
  res.redirect('/details');
});

// Details Page (name, dob, semester, subjects, skills)
app.get('/details', (req, res) => {
  if (!req.session.userData) return res.redirect('/');

  res.render('details', {
    userData: req.session.userData,
    subjectsList,
    skillsList
  });
});

app.post('/details', async (req, res) => {
  if (!req.session.userData) return res.redirect('/');

  // Save details to session (to allow redisplay)
  const { name, dob, semester, college, subjects = [], skills = [] } = req.body;
  req.session.userData = {
    ...req.session.userData,
    name,
    dob,
    semester,
    college,
    subjects: Array.isArray(subjects) ? subjects : [subjects],
    skills: Array.isArray(skills) ? skills : [skills]
  };

  // Save to MongoDB (overwrite or create new)
  const userData = req.session.userData;
  let user = await User.findOne({ email: userData.email });
  if (!user) user = new User();

  user.username = userData.username;
  user.email = userData.email;
  user.collegeID = userData.collegeID;
  user.name = userData.name;
  user.dob = userData.dob;
  user.semester = userData.semester;
  user.college = userData.college;
  user.subjects = userData.subjects;
  user.skills = userData.skills;

  await user.save();

  res.redirect('/result');
});

// Save Skills (Ajax or form submit)
app.post('/save-skill', async (req, res) => {
  const skill = req.body.skill;
  if (!req.session.userData) return res.status(401).send('Unauthorized');
  let user = await User.findOne({ email: req.session.userData.email });
  if (!user) return res.status(404).send('User not found');

  if (!user.skills.includes(skill)) {
    user.skills.push(skill);
    await user.save();
  }

  res.redirect('/details');
});

// Delete Skill
app.post('/delete-skill', async (req, res) => {
  const skill = req.body.skill;
  if (!req.session.userData) return res.status(401).send('Unauthorized');
  let user = await User.findOne({ email: req.session.userData.email });
  if (!user) return res.status(404).send('User not found');

  user.skills = user.skills.filter(s => s !== skill);
  await user.save();

  res.redirect('/details');
});

// Result Page showing projects and companies
app.get('/result', async (req, res) => {
  if (!req.session.userData) return res.redirect('/');

  let user = await User.findOne({ email: req.session.userData.email });
  if (!user) return res.redirect('/details');

  // Aggregate projects and companies from user skills
  const userSkills = user.skills || [];
  let projects = new Set();
  let companies = new Set();

  userSkills.forEach(skill => {
    const projs = projectRecommendations[skill];
    if (projs) projs.forEach(p => projects.add(p));
    const comps = companyRecommendations[skill];
    if (comps) comps.forEach(c => companies.add(c));
  });

  res.render('result', {
    user,
    projects: Array.from(projects),
    companies: Array.from(companies)
  });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
