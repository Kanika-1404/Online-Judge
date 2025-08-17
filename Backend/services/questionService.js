const Question = require("../models/Question");
const Submission = require("../models/Submission");

const getAllQuestions = async () => {
  return await Question.find({}, "title difficulty");
};

const getQuestionById = async (id) => {
  return await Question.findById(id);
};

const createQuestion = async (questionData, userId) => {
  const question = new Question({
    ...questionData,
    createdBy: userId,
  });
  return await question.save();
};

const updateQuestion = async (id, questionData) => {
  const question = await Question.findById(id);
  if (!question) {
    throw new Error("Question not found.");
  }

  question.title = questionData.title.trim();
  question.description = questionData.description.trim();
  question.tags = Array.isArray(questionData.tags)
    ? questionData.tags.map((tag) => tag.trim()).filter((tag) => tag)
    : [];
  question.difficulty = questionData.difficulty;
  question.testCases = questionData.testCases.map((tc) => ({
    input: tc.input.trim(),
    output: tc.output.trim(),
    visibility: tc.visibility || "Private",
  }));

  return await question.save();
};

const deleteQuestion = async (id) => {
  const question = await Question.findById(id);
  if (!question) {
    throw new Error("Question not found.");
  }
  return await question.remove();
};

const countQuestions = async () => {
  return await Question.countDocuments();
};

const getRecentQuestions = async (limit = 5) => {
  return await Question.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("title difficulty");
};

const getQuestionAccuracyData = async (questionId) => {
  try {
    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) {
      throw new Error("Question not found.");
    }

    // Get all submissions for this question using your Submission model
    const submissions = await Submission.find({ 
      questionId: questionId 
    }).select('verdict userId timeSubmitted score language');

    if (submissions.length === 0) {
      return {
        totalSubmissions: 0,
        acceptedSubmissions: 0,
        accuracyPercentage: 0,
        uniqueUsers: 0,
        userAcceptanceRate: 0,
        averageScore: 0,
        recentSubmissions: [],
        questionTitle: question.title,
        questionDifficulty: question.difficulty
      };
    }

    // Calculate statistics based on your Submission model
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(sub => sub.verdict === 'Accepted').length;
    const accuracyPercentage = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;
    
    // Get unique users who attempted this question
    const uniqueUserIds = [...new Set(submissions.map(sub => sub.userId.toString()))];
    const uniqueUsers = uniqueUserIds.length;

    // Get recent submissions (last 10)
    const recentSubmissions = submissions
      .sort((a, b) => new Date(b.timeSubmitted) - new Date(a.timeSubmitted))
      .slice(0, 10)
      .map(sub => ({
        verdict: sub.verdict,
        timeSubmitted: sub.timeSubmitted,
        userId: sub.userId,
        score: sub.score,
        language: sub.language
      }));

    // Calculate acceptance rate by unique users
    const usersWithAcceptedSubmission = await Submission.distinct('userId', {
      questionId: questionId,
      verdict: 'Accepted'
    });
    const userAcceptanceRate = uniqueUsers > 0 ? Math.round((usersWithAcceptedSubmission.length / uniqueUsers) * 100) : 0;

    // Calculate average score
    const totalScore = submissions.reduce((sum, sub) => sum + (sub.score || 0), 0);
    const averageScore = totalSubmissions > 0 ? Math.round(totalScore / totalSubmissions) : 0;

    return {
      totalSubmissions,
      acceptedSubmissions,
      accuracyPercentage,
      uniqueUsers,
      userAcceptanceRate,
      averageScore,
      recentSubmissions,
      questionTitle: question.title,
      questionDifficulty: question.difficulty
    };

  } catch (error) {
    console.error('Error calculating question accuracy:', error);
    throw error;
  }
};

const validateQuestionData = (questionData) => {
  const { title, description, difficulty, testCases } = questionData;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    throw new Error("Title is required and must be a non-empty string.");
  }

  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    throw new Error("Description is required and must be a non-empty string.");
  }

  if (!difficulty || !["Easy", "Medium", "Hard"].includes(difficulty)) {
    throw new Error("Difficulty must be one of: Easy, Medium, Hard.");
  }

  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new Error("At least one test case is required.");
  }

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    if (!tc || typeof tc !== "object") {
      throw new Error(`Test case ${i + 1} must be an object.`);
    }
    if (!tc.input || typeof tc.input !== "string") {
      throw new Error(
        `Test case ${i + 1} input is required and must be a string.`
      );
    }
    if (!tc.output || typeof tc.output !== "string") {
      throw new Error(
        `Test case ${i + 1} output is required and must be a string.`
      );
    }
    if (tc.visibility && !["Public", "Private"].includes(tc.visibility)) {
      throw new Error(
        `Test case ${i + 1} visibility must be Public or Private.`
      );
    }
  }
};

module.exports = {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  countQuestions,
  getRecentQuestions,
  getQuestionAccuracyData,
  validateQuestionData,
};