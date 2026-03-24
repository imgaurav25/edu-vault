


// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// const parentSchema = new mongoose.Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//       index: true // ✅ added for faster lookup
//     },

//     password: {
//       type: String,
//       required: true
//     },

//     // 🔗 Linked student (_id reference)
//     student: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Student",
//       required: true,
//       index: true // ✅ added for relation performance
//     }
//   },
//   { timestamps: true }
// );

// /* =================================================
//    🔐 HASH PASSWORD BEFORE SAVE (SAFE)
// ================================================= */
// parentSchema.pre("save", async function () {
//   try {
//     if (!this.isModified("password")) return;
//     this.password = await bcrypt.hash(this.password, 10);
//   } catch (err) {
//     throw err; // ✅ prevents silent failure
//   }
// });

// /* =================================================
//    🔑 PASSWORD CHECK METHOD
// ================================================= */
// parentSchema.methods.comparePassword = async function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// module.exports = mongoose.model("Parent", parentSchema);


const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const parentSchema = new mongoose.Schema(
  {
    // 👤 Parent Full Name (NEW)
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true // ✅ added for faster lookup
    },

    password: {
      type: String,
      required: true
    },

    // 🔗 Linked student (_id reference)
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true // ✅ added for relation performance
    }
  },
  { timestamps: true }
);

/* =================================================
   🔐 HASH PASSWORD BEFORE SAVE (SAFE)
================================================= */
parentSchema.pre("save", async function () {
  try {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
  } catch (err) {
    throw err; // ✅ prevents silent failure
  }
});

/* =================================================
   🔑 PASSWORD CHECK METHOD
================================================= */
parentSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Parent", parentSchema);
