const {
  getAdminDashboardStats,
  getUserDashboardStats,
} = require("../services/dashboardService");
const { findUserById } = require("../services/userService");

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);

    if (!user || user.role !== "admin") {
      const userStats = await getUserDashboardStats(userId);
      res.json(userStats);
      return;
    }

    const adminStats = await getAdminDashboardStats();
    res.json(adminStats);
  } catch (error) {
    res.status(500).json({ error: "Server error fetching dashboard stats" });
  }
};

module.exports = {
  getDashboardStats,
};
