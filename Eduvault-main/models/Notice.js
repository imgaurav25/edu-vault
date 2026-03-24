// const mongoose = require("mongoose");

// const noticeSchema = new mongoose.Schema({
//   noticeId: String,
//   title: String,
//   date: String,
//   message: String
// });

// module.exports = mongoose.model("Notice", noticeSchema);




const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },

  forRole: {
    type: String,
    enum: ["student", "teacher", "all"],
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Notice", noticeSchema);

