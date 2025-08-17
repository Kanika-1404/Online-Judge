const User = require("../models/User");
const Question = require("../models/Question");
const Contest = require("../models/Contest");
const Submission = require("../models/Submission");

const getAdminDashboardStats = async () => {
  const [totalQuestions, totalContests, totalUsers, totalSubmissions] =
    await Promise.all([
      Question.countDocuments(),
      Contest.countDocuments(),
      User.countDocuments(),
      Submission.countDocuments(),
    ]);

  const recentQuestions = await Question.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title difficulty");

  const recentContests = await Contest.find()
    .sort({ startTime: -1 })
    .limit(5)
    .select("name startTime");

  return {
    stats: {
      totalQuestions,
      totalContests,
      totalUsers,
      totalSubmissions,
    },
    recentQuestions,
    recentContests,
  };
};

const getUserDashboardStats = async (userId) => {
  const userSubmissions = await Submission.find({ userId });
  const uniqueQuestionsSolved = [
    ...new Set(userSubmissions.map((sub) => sub.questionId.toString())),
  ].length;

  const totalQuestions = await Question.countDocuments();
  const totalContests = await Contest.countDocuments();

  return {
    totalQuestions,
    totalContests,
    totalSubmissions: userSubmissions.length,
    questionsSolved: uniqueQuestionsSolved,
    rank: Math.floor(Math.random() * 1000) + 1,
  };
};

module.exports = {
  getAdminDashboardStats,
  getUserDashboardStats,
};
