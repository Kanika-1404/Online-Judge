const {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  validateQuestionData,
  getQuestionAccuracyData,
} = require("../services/questionService");
const { findUserById } = require("../services/userService");

const getQuestions = async (req, res) => {
  try {
    const questions = await getAllQuestions();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).send("Error fetching questions.");
  }
};

const getQuestion = async (req, res) => {
  try {
    const question = await getQuestionById(req.params.id);
    if (!question) {
      return res.status(404).send("Question not found.");
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(500).send("Error fetching question.");
  }
};

const getQuestionAccuracy = async (req, res) => {
  try {
    const questionId = req.params.id;
    const accuracyData = await getQuestionAccuracyData(questionId);
    res.status(200).json(accuracyData);
  } catch (error) {
    console.error("Error fetching question accuracy:", error);
    res.status(500).json({ error: "Error fetching question accuracy." });
  }
};

const addQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { title, description, tags, difficulty, testCases } = req.body;
    if (!title || !description || !difficulty || !testCases) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const question = await createQuestion(
      {
        title,
        description,
        tags,
        difficulty,
        testCases,
      },
      userId
    );

    res
      .status(201)
      .json({ message: "Question created successfully.", question });
  } catch (error) {
    res.status(500).json({ error: "Server error creating question." });
  }
};

const editQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    const { title, description, tags, difficulty, testCases } = req.body;

    validateQuestionData({ title, description, difficulty, testCases });

    const question = await updateQuestion(req.params.id, {
      title,
      description,
      tags,
      difficulty,
      testCases,
    });

    res.status(200).json({
      message: "Question updated successfully.",
      question: {
        _id: question._id,
        title: question.title,
        description: question.description,
        tags: question.tags,
        difficulty: question.difficulty,
        testCases: question.testCases,
      },
    });
  } catch (error) {
    console.error("Error updating question:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res
        .status(400)
        .json({ error: "Validation failed", details: validationErrors });
    }

    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid question ID format." });
    }

    if (error.message === "Question not found.") {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({
      error: "Server error updating question.",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

const removeQuestion = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Admins only." });
    }

    await deleteQuestion(req.params.id);
    res.status(200).json({ message: "Question deleted successfully." });
  } catch (error) {
    if (error.message === "Question not found.") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Server error deleting question." });
  }
};

module.exports = {
  getQuestions,
  getQuestion,
  getQuestionAccuracy,
  addQuestion,
  editQuestion,
  removeQuestion,
};