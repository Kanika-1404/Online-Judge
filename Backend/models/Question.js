const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  // Unique ID for the question (MongoDB _id is already unique)
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  tags: [{
    type: String
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  testCases: [{
    input: {
      type: String,
      required: true,
    },
    output: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ['Public', 'Private'],
      default: 'Private',
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
