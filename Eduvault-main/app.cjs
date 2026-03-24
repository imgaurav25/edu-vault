// ================== REQUIREMENTS ==================
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eduvault";
const app = express();


app.use(
  session({
    secret: process.env.SESSION_SECRET || "eduvault_secret_key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
      stringify: false,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);






const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Models = require("./models");
const Parent = Models.Parent;

// parent routes
const parentRoutes = require("./routes/parent");



const bcrypt = require("bcryptjs");

const sendResetMail = require("./utils/sendResetMail");


  

//for upload photo 
app.use("/uploads", express.static("uploads"));

//for test('should first', () => { second })
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// 📌 Only calling the function, not writing email code here
const sendContactMail = require("./utils/sendContactMail");
const sendPdfReceipt = require("./utils/sendPdfReceipt");


// const teacherRoutes = require("./routes/teacherRoutes");
const teacherRoutes = require("./routes/teacherRoutes");

// teacher routes FIRST
app.use("/admin/teacher", teacherRoutes);
app.use("/teacher", teacherRoutes);

// teacher attendance NEXT
const teacherAttendance = require("./routes/teacherAttendance");
app.use("/teacher", teacherAttendance);



//for inside student login
const studentPortal = require("./routes/studentPortal");
app.use("/student", studentPortal);

// ✅ parent routes (MISSING LINE)
app.use("/parent", parentRoutes);




// const teacherAttendance = require("./routes/teacherAttendance");
// app.use("/teacher", teacherAttendance);





const Student = Models.Student;        // from Student.js (rename student.js → Student.js recommended)
const Attendance = Models.Attendance;
const Fee = Models.Fee;
const Notice = Models.Notice;
const Course = Models.Course;
const Department = Models.Department;
const Result = Models.Result;
const Teacher = Models.Teacher;

// ================== MIDDLEWARE ==================

app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// 🔥 FIX: GLOBAL DEFAULT active VARIABLE (must be before all routes)
app.use((req, res, next) => {
  res.locals.active = "";  
  next();
});

// student routes BELOW middleware
// app.use("/admin/teacher", teacherRoutes);


// ================== DATABASE (SERVERLESS SAFE) ==================
mongoose.set("bufferCommands", false);
mongoose.set("strictQuery", false);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");
  return cached.conn;
}

// connect DB before every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("❌ DB Error:", err.message);
    res.status(500).send("Database connection failed");
  }
});


// ================== UI PAGES ==================
app.get("/", (req, res) => res.render("listings/home", { active: "home" }));
app.get("/mission", (req, res) => res.render("listings/mission", { active: "mission" }));
app.get("/features", (req, res) => res.render("listings/features", { active: "features" }));
app.get("/about", (req, res) => res.render("listings/about", { active: "about" }));
app.get("/faq", (req, res) => res.render("listings/faq", { active: "faq" }));
app.get("/payment", (req, res) => res.render("listings/payment", { active: "payment" }));
app.get("/contact", (req, res) => res.render("listings/contact", { active: "contact" }));

// ================== LOGIN PAGE ==================
app.get("/login", (req, res) => {
  res.render("auth/chooseLogin", { active: "login" });
});

// 🔥 FIX ADDED BELOW (ONLY THIS WAS THE BUG)
app.get("/login/:role", (req, res) => {
  res.render("auth/login", { 
    role: req.params.role,
    active: "login"   // <-- FIXED! login page now works
  });
});



//for  admin login 
app.get("/admin/dashboard", (req, res) => {
  res.render("admin/dashboard", { active: "admin" });
});

app.post("/login", async (req, res) => {
  const { user, password, role } = req.body;

  // ---------- STUDENT LOGIN ----------
  if (role === "student") {
  const student = await Student.findOne({
    $or: [
      { email: user.trim() },
      { roll: user.trim() },
      { studentId: user.trim() }
    ]
  });

  if (!student) return res.send("Student not found!");

  const isMatch = await bcrypt.compare(password, student.password);
  if (!isMatch) return res.send("Wrong password!");

  // ✅ save session
  req.session.studentId = student._id;

  return res.redirect(`/student/dashboard/${student._id}`);
}


  // ---------- ADMIN / TEACHER LOGIN ----------
  if ((role === "admin" || role === "teacher") &&
      user === "admin@gmail.com" &&
      password === "admin123") {
    return res.redirect("/admin/dashboard");
  }
  // ---------- PARENT LOGIN ----------
if (role === "parent") {
  const parent = await Parent.findOne({ email: user.trim() });
  if (!parent) return res.send("Parent not found!");

  const isMatch = await bcrypt.compare(password, parent.password);
  if (!isMatch) return res.send("Wrong password!");

  // ✅ save parent session
  req.session.parentId = parent._id;

  return res.redirect(`/parent/dashboard/${parent._id}`);
}


  // ---------- INVALID LOGIN ----------
  return res.send("Invalid Login!");
});



// ================== CONTACT ==================
app.post("/contact", async (req, res) => {
  console.log("📩 Contact Form:", req.body);
  const sent = await sendContactMail(req.body);
  res.send(sent ? "📬 Email Sent!" : "⚠️ Email Failed!");
});

// ================== PAYMENT WORKFLOW ==================

// 1️⃣ Collect form data and pass to checkout screen
app.post("/payment/checkout", async (req, res) => {
  try {
    const { studentId, studentName, studentEmail, studentPhone, feeType, amount } = req.body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await instance.orders.create({
      amount: Number(amount) * 100,
      currency: "INR",
      receipt: "EDUV_" + Date.now()
    });

    res.render("listings/paymentCheckout", {
      order,
      key_id: process.env.RAZORPAY_KEY_ID,
      studentId,
      studentName,
      studentEmail,
      studentPhone,
      feeType,
     amount
    });

  } catch (err) {
    console.log(err);
    res.send("❌ Payment Order Failed!");
  }
});

// 2️⃣ Create Razorpay order API
app.post("/create-order", async (req, res) => {
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const order = await instance.orders.create({
      amount: req.body.amount * 100,
      currency: "INR"
    });

    res.json({ success: true, order });

  } catch (error) {
    console.log(error);
    res.json({ success: false });
  }
});

// 3️⃣ Verified Payment + Save Fee + Send Receipt
app.post("/payment-success", async (req, res) => {
  try {
    const { 
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      studentId,
      studentName,
      studentEmail,
      studentPhone,
      feeType,
    
      amount
    } = req.body;

    /* ================= VERIFY RAZORPAY ================= */
    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (sign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "⚠ Payment verification failed"
      });
    }

    /* ================= FIND STUDENT (SAFE) ================= */
    let student = null;

    if (mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }

    if (!student) {
      student = await Student.findOne({
        $or: [{ studentId }, { email: studentEmail }]
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    /* ================= SAVE FEE RECORD ================= */
    await Fee.create({
      student: student._id,
      studentEmail: student.email,
      feeType,
      amount: Number(amount),
      status: "Paid",
      paymentId: razorpay_payment_id,
      paymentGateway: "Razorpay",
      date: new Date(),
      receiptPdf: "EMAILED" // ✅ Vercel-safe
    });

    /* ================= SEND PDF RECEIPT ================= */
    await sendPdfReceipt({
  paymentId: razorpay_payment_id,
  studentName,
  studentId,
  feeType: feeType || "Academic Fee",   // ✅ FIX
  amount,
  studentEmail,
  studentPhone,
  paymentMethod: "Online Payment (Razorpay)"
});


    /* ================= RESPONSE ================= */
    return res.status(200).json({
      success: true,
      message: "✅ Payment verified, fee saved & receipt emailed"
    });

  } catch (err) {
    console.error("❌ Payment Success Error:", err);

    return res.status(500).json({
      success: false,
      message: "Payment verified but receipt failed"
    });
  }
});


      //for forget password

app.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password");
});


app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.send("Email not registered");
    }

    const token = crypto.randomBytes(32).toString("hex");

    student.resetToken = token;
    student.resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour
    await student.save();

    await sendResetMail(email, token);

    res.send("Password reset link sent to email");
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).send("Something went wrong");
  }
});


// GET reset page
app.get("/api/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const student = await Student.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!student) {
      return res.send("Invalid or expired reset link");
    }
 res.set("Cache-Control", "no-store");
  
    res.render("auth/reset-password", { token });
  } catch (err) {
    console.error("Reset password GET error:", err);
    res.status(500).send("Server error");
  }
});

// POST new password
app.post("/api/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const student = await Student.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!student) {
      return res.send("Token expired or invalid");
    }

    student.password = await bcrypt.hash(password, 10);
    student.resetToken = undefined;
    student.resetTokenExpiry = undefined;
    await student.save();

    res.redirect("/login");
  } catch (err) {
    console.error("Reset password POST error:", err);
    res.status(500).send("Password reset failed");
  }
});



module.exports = app;
// ================== SERVER ==================