const {
  getAllContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  registerUserForContest,
  validateContestData,
} = require("../services/contestService");
const { findUserById } = require("../services/userService");

const getContests = async (req, res) => {
  try {
    const contests = await getAllContests();
    res.status(200).json(contests);
  } catch (error) {
    res.status(500).json({ error: "Error fetching contests." });
  }
};

const getContest = async (req, res) => {
  try {
    const contest = await getContestById(req.params.id);
    if (!contest) {
      return res.status(404).json({ error: "Contest not found." });
    }
    res.status(200).json(contest);
  } catch (error) {
    res.status(500).json({ error: "Error fetching contest." });
  }
};

const addContest = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { contestId, name, description, startTime, endTime, questions } =
      req.body;
    validateContestData({ contestId, name, description, startTime, endTime });

    const contest = await createContest({
      contestId,
      name,
      description,
      startTime,
      endTime,
      questions,
    });

    res.status(201).json({ message: "Contest created successfully.", contest });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Server error creating contest." });
  }
};

const editContest = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { name, description, startTime, endTime, questions } = req.body;
    if (!name || !description || !startTime || !endTime) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const contest = await updateContest(req.params.id, {
      name,
      description,
      startTime,
      endTime,
      questions,
    });

    res.status(200).json({ message: "Contest updated successfully.", contest });
  } catch (error) {
    if (error.message === "Contest not found.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error updating contest." });
  }
};

const removeContest = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    await deleteContest(req.params.id);
    res.status(200).json({ message: "Contest deleted successfully." });
  } catch (error) {
    if (error.message === "Contest not found.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error deleting contest." });
  }
};

const registerForContest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await registerUserForContest(id, userId);

    res.json({
      message: "Successfully registered for contest",
      contestId: id,
      userId: userId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    if (error.message === "Contest not found") {
      return res.status(404).json({ error: error.message });
    }
    if (error.message === "Already registered for this contest") {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: "Registration failed" });
  }
};

module.exports = {
  getContests,
  getContest,
  addContest,
  editContest,
  removeContest,
  registerForContest,
};
