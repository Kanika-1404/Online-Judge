const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const dbConnection = require("./database/db");
dbConnection();

app.use(
  cors({
    origin: [
      "https://codes-arena.netlify.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");
const questionRoutes = require("./routes/questionRoutes");
const contestRoutes = require("./routes/contestRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");

app.use("/", authRoutes);
app.use("/", questionRoutes);
app.use("/", contestRoutes);
app.use("/", submissionRoutes);
app.use("/", dashboardRoutes);
app.use("/", aiRoutes);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
