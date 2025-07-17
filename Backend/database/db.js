const mongoose = require("mongoose");

const DBConnection = async () => {
  const MONGO_URL = process.env.MONGO_URL; // ✅ matches .env
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      tlsAllowInvalidCertificates: true
    });
    console.log("DB connected");
  } catch (error) {
    console.log("Error connecting to DB", error);
  }
};

module.exports = DBConnection;
