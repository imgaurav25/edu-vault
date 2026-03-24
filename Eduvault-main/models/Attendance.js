// const mongoose = require("mongoose");

// const attendanceSchema = new mongoose.Schema({
//   courseId: String,
//   date: String,
//   present: [String],
//   absent: [String]
// });

// module.exports = mongoose.model("Attendance", attendanceSchema);



const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    // Subject name (must match subjects.js exactly)
    courseId: {
      type: String,
      required: true,
      trim: true
    },

    // Attendance date (YYYY-MM-DD)
    date: {
      type: String,
      required: true
    },

    // Rolls of present students
    present: {
      type: [String],
      default: []
    },

    // Rolls of absent students
    absent: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// 🔒 Prevent duplicate attendance for same subject + date
attendanceSchema.index({ courseId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
