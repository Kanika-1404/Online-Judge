const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const createUser = async (name, email, password, role = "user") => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exist with this email.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    userId: uuidv4(),
    fullName: name,
    email,
    password: hashedPassword,
    role,
  });

  return user;
};

const authenticateUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid email or password.");
  }

  return user;
};

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "defaultsecret"
  );
};

const findUserById = async (userId) => {
  return await User.findById(userId);
};

module.exports = {
  createUser,
  authenticateUser,
  generateToken,
  findUserById,
};
