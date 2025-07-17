const mongoose = require('mongoose');
require('dotenv').config();
const Question = require('./models/Question');

async function seedQuestions() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB");

    const questions = [
      {
        title: "Addition of two numbers",
        description: "Write a program to add two integers.",
        tags: ["math", "addition"],
        difficulty: "Easy",
        testCases: [
          { input: "2 3", output: "5", visibility: "Public" },
          { input: "10 20", output: "30", visibility: "Public" },
          { input: "100 200", output: "300", visibility: "Public" },
          { input: "5 15", output: "20", visibility: "Private" },
          { input: "7 8", output: "15", visibility: "Private" },
        ]
      },
      {
        title: "Subtraction of two numbers",
        description: "Write a program to subtract the second integer from the first.",
        tags: ["math", "subtraction"],
        difficulty: "Easy",
        testCases: [
          { input: "10 4", output: "6", visibility: "Public" },
          { input: "20 5", output: "15", visibility: "Public" },
          { input: "50 25", output: "25", visibility: "Public" },
          { input: "30 10", output: "20", visibility: "Private" },
          { input: "100 70", output: "30", visibility: "Private" },
        ]
      },
      {
        title: "Multiplication of two numbers",
        description: "Write a program to multiply two integers.",
        tags: ["math", "multiplication"],
        difficulty: "Easy",
        testCases: [
          { input: "3 4", output: "12", visibility: "Public" },
          { input: "5 6", output: "30", visibility: "Public" },
          { input: "7 8", output: "56", visibility: "Public" },
          { input: "9 9", output: "81", visibility: "Private" },
          { input: "11 12", output: "132", visibility: "Private" },
        ]
      },
      {
        title: "Division of two numbers",
        description: "Write a program to divide the first integer by the second integer.",
        tags: ["math", "division"],
        difficulty: "Easy",
        testCases: [
          { input: "10 2", output: "5", visibility: "Public" },
          { input: "20 4", output: "5", visibility: "Public" },
          { input: "100 10", output: "10", visibility: "Public" },
          { input: "50 5", output: "10", visibility: "Private" },
          { input: "45 9", output: "5", visibility: "Private" },
        ]
      },
    ];

    await Question.insertMany(questions);
    console.log("Questions inserted successfully");
    process.exit();
  } catch (error) {
    console.error("Error seeding questions:", error);
    process.exit(1);
  }
}

seedQuestions();
