const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ListingSchema = new Schema({
  type: {
    type: String,
    enum: ["student", "teacher"],
    required: true
  },

  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  image: { url: String },

  // Student fields
  roll: { type: String },
  class: { type: String },
  section: { type: String },

  // Teacher fields
  employeeId: { type: String },
  department: { type: String },
  position: { type: String },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Listing", ListingSchema);

