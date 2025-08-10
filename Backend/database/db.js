const mongoose = require("mongoose");

const DBConnection = async () => {
  const MONGO_URL = process.env.MONGO_URL || 'mongodb://admin:password123@mongodb:27017/onlinejudge?authSource=admin';

  console.log("DEBUG: Using MONGO_URL =", MONGO_URL);
  
  try {
    await mongoose.connect(MONGO_URL, {
      ssl: true,
      tlsAllowInvalidCertificates: false
    });
    console.log("✅ DB connected successfully");
  } catch (error) {
    console.error("❌ Error connecting to DB:", error);
    // Retry connection after 5 seconds
    setTimeout(() => {
      console.log("🔄 Retrying DB connection...");
      DBConnection();
    }, 5000);
  }
};

module.exports = DBConnection;
