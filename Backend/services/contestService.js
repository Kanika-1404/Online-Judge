const Contest = require("../models/Contest");

const getAllContests = async () => {
  return await Contest.find()
    .populate("questions", "title difficulty")
    .populate("registeredUsers", "fullName email");
};

const getContestById = async (id) => {
  return await Contest.findById(id)
    .populate("questions", "title difficulty")
    .populate("registeredUsers", "fullName email");
};

const createContest = async (contestData) => {
  const contest = new Contest({
    ...contestData,
    registeredUsers: [],
  });
  return await contest.save();
};

const updateContest = async (id, contestData) => {
  const contest = await Contest.findById(id);
  if (!contest) {
    throw new Error("Contest not found.");
  }

  contest.name = contestData.name;
  contest.description = contestData.description;
  contest.startTime = contestData.startTime;
  contest.endTime = contestData.endTime;
  contest.questions = contestData.questions;

  return await contest.save();
};

const deleteContest = async (id) => {
  const contest = await Contest.findById(id);
  if (!contest) {
    throw new Error("Contest not found.");
  }
  return await contest.remove();
};

const registerUserForContest = async (contestId, userId) => {
  const contest = await Contest.findById(contestId);
  if (!contest) {
    throw new Error("Contest not found");
  }

  if (contest.registeredUsers.includes(userId)) {
    throw new Error("Already registered for this contest");
  }

  contest.registeredUsers.push(userId);
  return await contest.save();
};

const countContests = async () => {
  return await Contest.countDocuments();
};

const getRecentContests = async (limit = 5) => {
  return await Contest.find()
    .sort({ startTime: -1 })
    .limit(limit)
    .select("name startTime");
};

const validateContestData = (contestData) => {
  const { contestId, name, description, startTime, endTime } = contestData;

  if (!contestId || !name || !description || !startTime || !endTime) {
    throw new Error("Missing required fields.");
  }
};

module.exports = {
  getAllContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  registerUserForContest,
  countContests,
  getRecentContests,
  validateContestData,
};
