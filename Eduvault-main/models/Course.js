const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseId: String,
  name: String,
  credits: Number,
  department: String
});

module.exports = mongoose.model("Course", courseSchema);
