const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();

const dbConnection = require('./database/db')
dbConnection();
const User = require("./models/User");
const Question = require("./models/Question");
const Submission = require("./models/Submission");
const Contest = require("./models/Contest");
const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

// Update CORS to allow your Vercel frontend
app.use(cors({
  origin: ['https://online-judge-lac.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Remove ALL local compiler dependencies - use AWS compiler service via HTTP
const { generateReview } = require("./Ai-review.js");

app.get("/", (req, res) => {
    res.send("Hello, World!");
});



// New API endpoint for admin registration
// GET route to serve admin registration form
app.get("/register-admin", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admin Registration</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 500px;
                    margin: 50px auto;
                    padding: 20px;
                    background-color: #f5f5f5;
                }
                .container {
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                h1 {
                    color: #333;
                    text-align: center;
                    margin-bottom: 30px;
                }
                .form-group {
                    margin-bottom: 20px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                    color: #555;
                }
                input[type="text"],
                input[type="email"],
                input[type="password"] {
                    width: 100%;
                    padding: 10px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    box-sizing: border-box;
                }
                button {
                    width: 100%;
                    padding: 12px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                button:hover {
                    background-color: #0056b3;
                }
                .error {
                    color: red;
                    margin-top: 10px;
                }
                .success {
                    color: green;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Admin Registration</h1>
                <form id="adminForm" method="POST" action="/register-admin">
                    <div class="form-group">
                        <label for="name">Full Name:</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" id="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit">Register as Admin</button>
                </form>
                <div id="message" class="message"></div>
            </div>
            <script>
                document.getElementById('adminForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = Object.fromEntries(formData);
                    
                    try {
                        const response = await fetch('/register-admin', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(data)
                        });
                        const result = await response.json();
                        
                        if (response.ok) {
                            document.getElementById('message').innerHTML = '<p class="success">' + result.message + '</p>';
                            e.target.reset();
                        } else {
                            document.getElementById('message').innerHTML = '<p class="error">' + (result.error || 'Registration failed') + '</p>';
                        }
                    } catch (error) {
                        document.getElementById('message').innerHTML = '<p class="error">Network error. Please try again.</p>';
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// POST route for admin registration (existing)
app.post("/register-admin", async(req, res) => {
    const { name, email, password } = req.body;
    if (!(name && email && password)){
        return res.status(400).send("Please fill all info.");
    }
    // check if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser){
        return res.status(400).send("User already exist with this email.");
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save admin user in DB with role 'admin'
    const user = await User.create({
        userId: uuidv4(),
        fullName: name,
        email,
        password: hashedPassword,
        role: 'admin'
    });
    // generate token
    const token = jwt.sign({id: user._id, email}, process.env.JWT_SECRET || 'defaultsecret');
    user.password = undefined;
    res.status(200).json({message: "Admin registered successfully.", user});
});

app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    if (!(email && password)) {
        return res.status(400).send("Please provide email and password.");
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send("Invalid email or password.");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).send("Invalid email or password.");
        }
        
        // Include role information in response
        const token = jwt.sign({ id: user._id, email, role: user.role }, process.env.JWT_SECRET || 'defaultsecret');
        user.password = undefined;
        
        // Return role information for redirection
        res.status(200).json({ 
            message: "Login successful.", 
            user, 
            token, 
            role: user.role,
            redirectUrl: user.role === 'admin' ? '/admin-dashboard' : '/dashboard'
        });
    } catch (error) {
        res.status(500).send("Server error.");
    }
});


app.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find({}, 'title difficulty');
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).send("Error fetching questions.");
  }
});

app.get("/questions/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).send("Question not found.");
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).send("Error fetching question.");
  }
});

// Update question - admin only
app.put("/questions/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { title, description, tags, difficulty, testCases } = req.body;
    
    // Detailed validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required and must be a non-empty string." });
    }
    
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: "Description is required and must be a non-empty string." });
    }
    
    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ error: "Difficulty must be one of: Easy, Medium, Hard." });
    }
    
    if (!Array.isArray(testCases) || testCases.length === 0) {
      return res.status(400).json({ error: "At least one test case is required." });
    }
    
    // Validate test cases structure
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      if (!tc || typeof tc !== 'object') {
        return res.status(400).json({ error: `Test case ${i + 1} must be an object.` });
      }
      if (!tc.input || typeof tc.input !== 'string') {
        return res.status(400).json({ error: `Test case ${i + 1} input is required and must be a string.` });
      }
      if (!tc.output || typeof tc.output !== 'string') {
        return res.status(400).json({ error: `Test case ${i + 1} output is required and must be a string.` });
      }
      if (tc.visibility && !['Public', 'Private'].includes(tc.visibility)) {
        return res.status(400).json({ error: `Test case ${i + 1} visibility must be Public or Private.` });
      }
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    question.title = title.trim();
    question.description = description.trim();
    question.tags = Array.isArray(tags) ? tags.map(tag => tag.trim()).filter(tag => tag) : [];
    question.difficulty = difficulty;
    question.testCases = testCases.map(tc => ({
      input: tc.input.trim(),
      output: tc.output.trim(),
      visibility: tc.visibility || 'Private'
    }));

    await question.save();
    res.status(200).json({ 
      message: "Question updated successfully.", 
      question: {
        _id: question._id,
        title: question.title,
        description: question.description,
        tags: question.tags,
        difficulty: question.difficulty,
        testCases: question.testCases
      }
    });
  } catch (error) {
    console.error("Error updating question:", error);
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: "Validation failed", details: validationErrors });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({ error: "Invalid question ID format." });
    }
    
    res.status(500).json({ 
      error: "Server error updating question.", 
      details: process.env.NODE_ENV === 'development' ? error.message : "Internal server error"
    });
  }
});

// Delete question - admin only
app.delete("/questions/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found." });
    }

    await question.remove();
    res.status(200).json({ message: "Question deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error deleting question." });
  }
});

// New API endpoint to create a question - only accessible by admin role
app.post("/questions", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    // Fetch user to check role
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { title, description, tags, difficulty, testCases } = req.body;
    if (!title || !description || !difficulty || !testCases) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Create new question
    const question = new Question({
      title,
      description,
      tags,
      difficulty,
      testCases,
      createdBy: userId
    });

    await question.save();
    res.status(201).json({ message: "Question created successfully.", question });
  } catch (error) {
    res.status(500).json({ error: "Server error creating question." });
  }
});


// Middleware to authenticate and extract userId from JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token missing' });

  jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Contest routes

// Get all contests
app.get("/contests", async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('questions', 'title difficulty')
      .populate('registeredUsers', 'fullName email');
    res.status(200).json(contests);
  } catch (error) {
    res.status(500).json({ error: "Error fetching contests." });
  }
});

// Get contest by id
app.get("/contests/:id", async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('questions', 'title difficulty')
      .populate('registeredUsers', 'fullName email');
    if (!contest) {
      return res.status(404).json({ error: "Contest not found." });
    }
    res.status(200).json(contest);
  } catch (error) {
    res.status(500).json({ error: "Error fetching contest." });
  }
});

// Create contest - admin only
app.post("/contests", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { contestId, name, description, startTime, endTime, questions } = req.body;
    if (!contestId || !name || !description || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const contest = new Contest({
      contestId,
      name,
      description,
      startTime,
      endTime,
      questions,
      registeredUsers: []
    });

    await contest.save();
    res.status(201).json({ message: "Contest created successfully.", contest });
  } catch (error) {
    res.status(500).json({ error: "Server error creating contest." });
  }
});


// New API endpoint to run code - uses AWS compiler service
app.post("/api/run-code", async (req, res) => {
    try {
        const { code, format, input } = req.body;
        if (!code || !format) {
            return res.status(400).json({ error: "Code and format are required" });
        }

        // Use AWS compiler service instead of local compiler
        const compilerUrl = process.env.COMPILER_URL || 'http://localhost:8000';
        
        const response = await fetch(`${compilerUrl}/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, format, input }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Compiler service error');
        }

        const result = await response.json();
        res.json(result);
    } catch (error) {
        console.error("Compiler service error:", error);
        res.status(500).json({ 
            error: "Failed to execute code",
            details: error.message 
        });
    }
});

// New API endpoint to generate AI review
app.post("/generate-review", async (req, res) => {
    try {
        const { question, code } = req.body;
        if (!question || !code) {
            return res.status(400).json({ error: "Question and code are required" });
        }
        const review = await generateReview(question, code);
        res.json({ review });
    } catch (error) {
        res.status(500).json({ error: "Error generating AI review" });
    }
});

const { v4: uuidv4 } = require('uuid');

app.post("/api/register", async(req, res) => {
    const { name, email, password } = req.body;
    if (!(name && email && password)){
        res.status(400).send("Please fill all info.")
    }
    // check if user already exist
    const existingUser = await User.findOne({ email });
    if (existingUser){
        return res.status(400).send("User already exist with this email.")
    }
    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Save user in DB
    const user = await User.create({
        userId: uuidv4(),
        fullName: name,
        email,
        password: hashedPassword
    });
    // generate token
    const token = jwt.sign({id: user._id, email}, process.env.JWT_SECRET || 'defaultsecret');
    user.password = undefined;
    res.status(200).json({message: "You have successfully registered.", user});
});


// Update contest - admin only
app.put("/contests/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { name, description, startTime, endTime, questions } = req.body;
    if (!name || !description || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found." });
    }

    contest.name = name;
    contest.description = description;
    contest.startTime = startTime;
    contest.endTime = endTime;
    contest.questions = questions;

    await contest.save();
    res.status(200).json({ message: "Contest updated successfully.", contest });
  } catch (error) {
    res.status(500).json({ error: "Server error updating contest." });
  }
});

// Delete contest - admin only
app.delete("/contests/:id", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found." });
    }

    await contest.remove();
    res.status(200).json({ message: "Contest deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: "Server error deleting contest." });
  }
});

// Register for contest
app.post("/contests/:id/register", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ error: 'Contest not found' });
    }
    
    // Check if user already registered
    if (contest.registeredUsers.includes(userId)) {
      return res.status(400).json({ error: 'Already registered for this contest' });
    }
    
    // Add user to registered users
    contest.registeredUsers.push(userId);
    await contest.save();
    
    res.json({ 
      message: 'Successfully registered for contest',
      contestId: id,
      userId: userId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Updated submit-code endpoint - uses AWS compiler service
app.post("/submit-code", authenticateToken, async (req, res) => {
  try {
    const { code, format, questionId } = req.body;
    if (!code || !format || !questionId) {
      return res.status(400).json({ error: "Code, format, and questionId are required" });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const testCases = question.testCases;
    const results = [];
    let allPassed = true;

    // Use AWS compiler service for each test case
    const compilerUrl = process.env.COMPILER_URL || 'http://localhost:8000';
    
    for (const testCase of testCases) {
      try {
        const response = await fetch(`${compilerUrl}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, format, input: testCase.input }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Compiler service error');
        }

        const result = await response.json();
        const output = result.output;
        
        const trimmedOutput = output.trim();
        const expectedOutput = testCase.output.trim();

        const passed = trimmedOutput === expectedOutput;
        if (!passed) {
          allPassed = false;
        }

        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: output,
          passed,
          visibility: testCase.visibility,
        });
      } catch (error) {
        allPassed = false;
        results.push({
          input: testCase.input,
          expectedOutput: testCase.output,
          actualOutput: error.toString(),
          passed: false,
          visibility: testCase.visibility,
        });
      }
    }

    const verdict = allPassed ? "Accepted" : "Wrong Answer";

    // Save submission details
    const submission = new Submission({
      userId: req.user.id,
      questionId,
      code,
      language: format,
      verdict,
      score: allPassed ? 100 : 0,
    });
    await submission.save();

    res.json({ verdict, results });
  } catch (error) {
    res.status(500).json({ error: "Server error during code submission" });
  }
});

// New API endpoint to get previous submissions for a question by the authenticated user
app.get("/submissions/:questionId", authenticateToken, async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const submissions = await Submission.find({ questionId, userId })
      .sort({ timeSubmitted: -1 })
      .select('verdict score timeSubmitted language code');

    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching submissions" });
  }
});

// New endpoint to get dashboard statistics - admin only
app.get("/dashboard-stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    // For regular users, return their personal stats
    if (!user || user.role !== 'admin') {
      // Get user-specific stats
      const userSubmissions = await Submission.find({ userId });
      const uniqueQuestionsSolved = [...new Set(userSubmissions.map(sub => sub.questionId.toString()))].length;
      
      // For now, return simplified stats for regular users
      const totalQuestions = await Question.countDocuments();
      const totalContests = await Contest.countDocuments();
      
      res.json({
        totalQuestions,
        totalContests,
        totalSubmissions: userSubmissions.length,
        questionsSolved: uniqueQuestionsSolved,
        rank: Math.floor(Math.random() * 1000) + 1 // Placeholder rank
      });
      return;
    }

    // Admin stats
    const [
      totalQuestions,
      totalContests,
      totalUsers,
      totalSubmissions
    ] = await Promise.all([
      Question.countDocuments(),
      Contest.countDocuments(),
      User.countDocuments(),
      Submission.countDocuments()
    ]);

    const recentQuestions = await Question.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title difficulty');

    const recentContests = await Contest.find()
      .sort({ startTime: -1 })
      .limit(5)
      .select('name startTime');

    res.json({
      stats: {
        totalQuestions,
        totalContests,
        totalUsers,
        totalSubmissions
      },
      recentQuestions,
      recentContests
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching dashboard stats" });
  }
});

// New endpoint to get user accuracy statistics
app.get("/api/user/accuracy/:userId?", authenticateToken, async (req, res) => {
  try {
    const requestingUserId = req.user.id;
    const targetUserId = req.params.userId || requestingUserId;
    
    // Check if user is requesting their own data or is admin
    const requestingUser = await User.findById(requestingUserId);
    if (!requestingUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (targetUserId !== requestingUserId && requestingUser.role !== 'admin') {
      return res.status(403).json({ error: "Access denied" });
    }

    const submissions = await Submission.find({ userId: targetUserId })
      .populate('questionId', 'title difficulty')
      .sort({ timeSubmitted: -1 });

    if (!submissions || submissions.length === 0) {
      return res.json({
        overallAccuracy: 0,
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        rejectedSubmissions: 0,
        pendingSubmissions: 0
      });
    }

    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'Accepted').length;
    const rejectedSubmissions = submissions.filter(sub => sub.verdict === 'Wrong Answer').length;
    const pendingSubmissions = submissions.filter(sub => sub.verdict === 'Pending').length;

    const overallAccuracy = (acceptedSubmissions / totalSubmissions) * 100;

    res.json({
      overallAccuracy: Math.round(overallAccuracy * 100) / 100,
      totalSubmissions,
      acceptedSubmissions,
      rejectedSubmissions,
      pendingSubmissions,
      submissions: submissions.map(sub => ({
        question: sub.questionId,
        verdict: sub.verdict,
        score: sub.score,
        language: sub.language,
        timeSubmitted: sub.timeSubmitted
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching user accuracy" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
