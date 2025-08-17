const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { getDashboardStats } = require("../controllers/dashboardController");

router.get("/dashboard-stats", authenticateToken, getDashboardStats);

module.exports = router;
