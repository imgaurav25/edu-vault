const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  // 🔗 Strong link to Student
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
    index: true
  },

  // 📧 Optional (for quick filtering / audit)
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },

  feeType: {
    type: String,
    required: true   // Tuition / Exam / Hostel etc.
  },

  amount: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    enum: ["Paid", "Due"],
    default: "Due"
  },

  date: {
    type: Date
  },

  receiptPdf: {
    type: String   // PDF path
  }
}, { timestamps: true });

module.exports = mongoose.model("Fee", feeSchema);
