const mongoose = require("mongoose");

/* Subject-wise marks */
const subjectSchema = new mongoose.Schema({
  subjectCode: String,
  subjectName: String,
  marks: {
    type: Number,
    required: true
  },
  maxMarks: {
    type: Number,
    default: 100
  }
}, { _id: false });

/* Result Schema */
const resultSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true
  },

  semester: {
    type: Number,
    required: true
  },

  subjects: {
    type: [subjectSchema],
    required: true
  },

  totalMarks: Number,
  percentage: Number,
  cgpa: Number,

  status: {
    type: String,
    enum: ["PASS", "FAIL"],
    default: "PASS"
  },

  published: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

/* 🔥 AUTO CALCULATION — NO next() */
resultSchema.pre("save", function () {
  let obtained = 0;
  let max = 0;

  for (const s of this.subjects) {
    obtained += Number(s.marks || 0);
    max += Number(s.maxMarks || 100);
  }

  this.totalMarks = obtained;

  this.percentage = max === 0
    ? 0
    : Number(((obtained / max) * 100).toFixed(2));

  this.cgpa = Number((this.percentage / 9.5).toFixed(2));
  this.status = this.percentage >= 40 ? "PASS" : "FAIL";
});

module.exports = mongoose.model("Result", resultSchema);
