const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();

const dbConnection = require('./database/db')
dbConnection();
const User = require("./models/User");
const Question = require("./models/Question");
const Submission = require("./models/Submission");

const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

const { generateFile } = require("../Compiler/generateFile");
const executeCpp = require("../Compiler/executeCpp");
const executeC = require("../Compiler/executeC");
const executePy = require("../Compiler/executePy");

app.get("/", (req, res) => {
    res.send("Hello, World!");
});

// New API endpoint to run code
app.post("/run-code", async (req, res) => {
    try {
        const { code, format, input } = req.body;
        if (!code || !format) {
            return res.status(400).json({ error: "Code and format are required" });
        }
        // Generate file
        const filePath = generateFile(format, code);
        // Execute file based on format
        let output;
        if (format === "cpp") {
            output = await executeCpp(filePath, input);
        } else if (format === "c") {
            output = await executeC(filePath, input);
        } else if (format === "py") {
            output = await executePy(filePath, input);
        } else {
            return res.status(400).json({ error: `Language ${format} is not supported yet.` });
        }
        console.log({output});
        res.json({ output });
    } catch (error) {
        if (error.stderr) {
            res.status(500).json({ error: error.stderr });
        } else if (error.error) {
            res.status(500).json({ error: error.error.message });
        } else {
            res.status(500).json({ error: "Unknown error occurred" });
        }
    }
});

const { v4: uuidv4 } = require('uuid');

app.post("/register", async(req, res) => {
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

app.post("/login", async (req, res) => {
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
        const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET || 'defaultsecret');
        user.password = undefined;
        res.status(200).json({ message: "Login successful.", user, token });
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

    for (const testCase of testCases) {
      const filePath = generateFile(format, code);
      try {
        let output;
        if (format === "cpp") {
          output = await executeCpp(filePath, testCase.input);
        } else if (format === "c") {
          output = await executeC(filePath, testCase.input);
        } else if (format === "py") {
          output = await executePy(filePath, testCase.input);
        } else {
          return res.status(400).json({ error: `Language ${format} is not supported yet.` });
        }

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

app.listen(5000, ()=> {
    console.log("Server is listening to port 5000.");
});
