const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const {
  getContests,
  getContest,
  addContest,
  editContest,
  removeContest,
  registerForContest,
} = require("../controllers/contestController");

router.get("/contests", getContests);
router.get("/contests/:id", getContest);

router.post("/contests", authenticateToken, addContest);
router.put("/contests/:id", authenticateToken, editContest);
router.delete("/contests/:id", authenticateToken, removeContest);
router.post("/contests/:id/register", authenticateToken, registerForContest);

module.exports = router;
