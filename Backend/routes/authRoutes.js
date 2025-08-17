const express = require("express");
const router = express.Router();
const {
  getAdminRegisterForm,
  registerAdmin,
  registerUser,
  login,
} = require("../controllers/authController");

router.get("/register-admin", getAdminRegisterForm);
router.post("/register-admin", registerAdmin);

router.post("/api/register", registerUser);
router.post("/api/login", login);

module.exports = router;
