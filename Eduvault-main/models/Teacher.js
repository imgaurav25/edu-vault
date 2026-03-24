const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
  teacherId: String,
  name: String,
  email: String,
  phone: String,
  department: String,
  subjects: [String]
});

module.exports = mongoose.model("Teacher", teacherSchema);
