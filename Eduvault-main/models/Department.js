const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
  deptId: String,
  name: String,
  hod: String
});

module.exports = mongoose.model("Department", departmentSchema);
