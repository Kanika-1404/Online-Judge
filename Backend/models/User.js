const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  profile: {
    bio: {
      type: String,
      default: '',
    },
    stats: {
        solved: {
            type: Number,
            default: 0,
        },
        rating: {
            type: Number,
            default: 1200,
        },
    },
  },
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
  }],
  contestsRegistered: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contest',
  }],
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
