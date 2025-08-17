const Submission = require("../models/Submission");

const createSubmission = async (submissionData) => {
  const submission = new Submission(submissionData);
  return await submission.save();
};

const getSubmissionsByUserAndQuestion = async (userId, questionId) => {
  return await Submission.find({ questionId, userId })
    .sort({ timeSubmitted: -1 })
    .select("verdict score timeSubmitted language code");
};

const getSubmissionsByUser = async (userId) => {
  return await Submission.find({ userId })
    .populate("questionId", "title difficulty")
    .sort({ timeSubmitted: -1 });
};

const countSubmissions = async () => {
  return await Submission.countDocuments();
};

const calculateUserAccuracy = (submissions) => {
  if (!submissions || submissions.length === 0) {
    return {
      overallAccuracy: 0,
      totalSubmissions: 0,
      acceptedSubmissions: 0,
      rejectedSubmissions: 0,
      pendingSubmissions: 0,
    };
  }

  const totalSubmissions = submissions.length;
  const acceptedSubmissions = submissions.filter(
    (sub) => sub.verdict === "Accepted"
  ).length;
  const rejectedSubmissions = submissions.filter(
    (sub) => sub.verdict === "Wrong Answer"
  ).length;
  const pendingSubmissions = submissions.filter(
    (sub) => sub.verdict === "Pending"
  ).length;

  const overallAccuracy = (acceptedSubmissions / totalSubmissions) * 100;

  return {
    overallAccuracy: Math.round(overallAccuracy * 100) / 100,
    totalSubmissions,
    acceptedSubmissions,
    rejectedSubmissions,
    pendingSubmissions,
  };
};

module.exports = {
  createSubmission,
  getSubmissionsByUserAndQuestion,
  getSubmissionsByUser,
  countSubmissions,
  calculateUserAccuracy,
};
