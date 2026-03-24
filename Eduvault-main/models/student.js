
const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    unique: true
  },
  roll: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,          // 🔥 IMPORTANT for login & reset
    required: true
  },
  phone: String,

  department: {
    type: String,
    required: true
  },

  section: {
    type: String,
    default: "A"
  },

  semester: Number,
  year: Number,

  courses: [String],

  fatherName: String,
  motherName: String,

  address: String,

  dateOfBirth: Date,
  gender: String,

  guardianPhone: String,

  /* 🔐 PASSWORD (REQUIRED FOR LOGIN) */
  password: {
    type: String,
    required: true
  },

  /* 🔐 FORGOT PASSWORD */
  resetToken: String,
  resetTokenExpiry: Date,

  /* 📷 PROFILE PHOTO */
  photo: {
    type: String,
    default: "/uploads/profile/default.png"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Student", studentSchema);
