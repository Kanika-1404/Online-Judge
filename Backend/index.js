const express = require("express");
const cors = require("cors");
const app = express();
require('dotenv').config();

const dbConnection = require('./database/db')
dbConnection();
const User = require("./models/User");
const Question = require("./models/Question");

const bcrypt = require("bcryptjs")
const jwt = require('jsonwebtoken');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/", (req, res) => {
    res.send("Hello, World!");
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

app.listen(5000, ()=> {
    console.log("Server is listening to port 5000.");
});
