const { runTestCases } = require("../services/compilerService");
const { getQuestionById } = require("../services/questionService");
const {
  createSubmission,
  getSubmissionsByUserAndQuestion,
  getSubmissionsByUser,
  calculateUserAccuracy,
} = require("../services/submissionService");
const { findUserById } = require("../services/userService");

const submitCode = async (req, res) => {
  try {
    const { code, format, questionId } = req.body;
    if (!code || !format || !questionId) {
      return res
        .status(400)
        .json({ error: "Code, format, and questionId are required" });
    }

    const question = await getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const testCases = question.testCases;
    const { results, allPassed } = await runTestCases(code, format, testCases);

    const verdict = allPassed ? "Accepted" : "Wrong Answer";

    // Save submission details
    const submission = await createSubmission({
      userId: req.user.id,
      questionId,
      code,
      language: format,
      verdict,
      score: allPassed ? 100 : 0,
    });

    res.json({ verdict, results });
  } catch (error) {
    res.status(500).json({ error: "Server error during code submission" });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.id;

    const submissions = await getSubmissionsByUserAndQuestion(
      userId,
      questionId
    );
    res.json({ submissions });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching submissions" });
  }
};

const getUserAccuracy = async (req, res) => {
  try {
    const requestingUserId = req.user.id;
    const targetUserId = req.params.userId || requestingUserId;

    // Check if user is requesting their own data or is admin
    const requestingUser = await findUserById(requestingUserId);
    if (!requestingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (targetUserId !== requestingUserId && requestingUser.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const submissions = await getSubmissionsByUser(targetUserId);
    const accuracyStats = calculateUserAccuracy(submissions);

    res.json({
      ...accuracyStats,
      submissions: submissions.map((sub) => ({
        question: sub.questionId,
        verdict: sub.verdict,
        score: sub.score,
        language: sub.language,
        timeSubmitted: sub.timeSubmitted,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: "Server error fetching user accuracy" });
  }
};

module.exports = {
  submitCode,
  getSubmissions,
  getUserAccuracy,
};
