


const fs = require("fs");

const path = require("path");
const express = require("express");
const router = express.Router();

const multer = require("multer");              // ✅ FIRST
const { storage } = require("../utils/cloudinary");  // ✅ AFTER


const streamReceiptPdf = require("../utils/streamReceiptPdf");




const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files allowed"));
    }
    cb(null, true);
  }
});



// ⭐ Global subject list
const subjects = require("../utils/subjects");

const Models = require("../models");
const Student = Models.Student;
const Attendance = Models.Attendance;
const Fee = Models.Fee;

const Notice = Models.Notice;
const Result = require("../models/Result");
const generateResultPdf = require("../utils/generateResultPdf");


/* ---------------- PHOTO UPLOAD ---------------- */


/* ---------------- HELPER ---------------- */

function averageMarks(results) {
  if (!results || results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + (r.marks || 0), 0);
  return +(sum / results.length).toFixed(2);
}

/* =================================================
   1️⃣ STUDENT DASHBOARD
================================================= */
router.get("/dashboard/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.send("Student not found!");

    const currentMonth = new Date().toISOString().slice(0, 7);

    const attendanceRecords = await Attendance.find({
      date: { $regex: `^${currentMonth}` },
      $or: [{ present: student.roll }, { absent: student.roll }]
    });

    let totalPresent = 0;
    attendanceRecords.forEach(r => {
      if (r.present.includes(student.roll)) totalPresent++;
    });

    const totalClasses = attendanceRecords.length;
    const attendancePercent =
      totalClasses === 0 ? 0 : Math.round((totalPresent / totalClasses) * 100);

    const fees = await Fee.find({ student: student._id });

    const totalPaid = fees
      .filter(f => (f.status || "").toLowerCase() === "paid")
      .reduce((s, f) => s + (f.amount || 0), 0);

    const totalDue = fees
      .filter(f => (f.status || "").toLowerCase() !== "paid")
      .reduce((s, f) => s + (f.amount || 0), 0);

    const peerStudents = await Student.find({
      department: student.department,
      section: student.section
    });

    const rankData = [];
    for (const peer of peerStudents) {
      const peerResults = await Result.find({ studentId: peer.studentId });
      rankData.push({
        studentId: peer.studentId,
        avg: averageMarks(peerResults)
      });
    }

    rankData.sort((a, b) => b.avg - a.avg);
    const rankIndex = rankData.findIndex(r => r.studentId === student.studentId);
    const studentRank = rankIndex === -1 ? "-" : rankIndex + 1;

    /* ✅ FIXED NOTICE QUERY */
    const notices = await Notice.find({
      $or: [{ forRole: "student" }, { forRole: "all" }]
    })
      .sort({ createdAt: -1 })
      .limit(10);

    res.render("student/dashboard", {
      student,
      totalPaid,
      totalDue,
      attendancePercent,
      totalPresent,
      totalClasses,
      studentRank,
      totalStudents: rankData.length,
      notices,
      active: "dashboard",
      title: "Student Dashboard"
    });

  } catch (err) {
    console.error("Dashboard error:", err);
    res.send("Error loading dashboard.");
  }
});

/* =================================================
   2️⃣ PROFILE PAGE
================================================= */
router.get("/profile/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.send("Student not found!");

  res.render("student/profile", {
    student,
    active: "profile",
    title: "My Profile"
  });
});

/* =================================================
   3️⃣ ATTENDANCE PAGE
================================================= */
router.get("/attendance/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.send("Student not found!");

  const currentMonth = new Date().toISOString().slice(0, 7);

  const records = await Attendance.find({
    date: { $regex: `^${currentMonth}` },
    $or: [{ present: student.roll }, { absent: student.roll }]
  });

  const attendanceMap = {};

  records.forEach(r => {
    const subject = r.courseId;
    if (!attendanceMap[subject]) {
      attendanceMap[subject] = { present: 0, total: 0 };
    }
    attendanceMap[subject].total++;
    if (r.present.includes(student.roll)) {
      attendanceMap[subject].present++;
    }
  });

  const attendance = subjects.map(sub => {
    const rec = attendanceMap[sub] || { present: 0, total: 0 };
    return {
      subject: sub,
      present: rec.present,
      total: rec.total,
      percent:
        rec.total === 0 ? 0 : Math.round((rec.present / rec.total) * 100)
    };
  });

  res.render("student/attendance", {
    student,
    attendance,
    month: currentMonth,
    active: "attendance",
    title: "Monthly Attendance"
  });
});

/* =================================================
   4️⃣ FEES PAGE
================================================= */
router.get("/fees/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.send("Student not found!");

  const fees = await Fee.find({
    student: student._id   // 🔥 ObjectId match
  }).sort({ createdAt: -1 });

  res.render("student/fees", {
    student,
    fees,
    active: "fees",
    title: "Fees & Payments"
  });
});





/* =================================================
   5️⃣ RESULTS PAGE
================================================= */
router.get("/results/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.send("Student not found!");

  const results = await Result.find({ studentId: student.studentId });

  res.render("student/results", {
    student,
    results,
    active: "results",
    title: "Exam Results"
  });
});

/* =================================================
   6️⃣ NOTICE BOARD
================================================= */
router.get("/notices/:id", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.send("Student not found!");

  /* ✅ FIXED NOTICE QUERY */
  const notices = await Notice.find({
    $or: [{ forRole: "student" }, { forRole: "all" }]
  }).sort({ createdAt: -1 });

  res.render("student/notices", {
    student,
    notices,
    active: "notices",
    title: "Notice Board"
  });
});

/* =================================================
   PROFILE PHOTO UPLOAD
================================================= */
router.post(
  "/profile/:id/upload-photo",
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.redirect("/student/profile/" + req.params.id);
      }

      await Student.findByIdAndUpdate(req.params.id, {
        photo: req.file.path // Cloudinary URL
      });

      res.redirect("/student/profile/" + req.params.id);

    } catch (err) {
      console.error("❌ Photo upload error:", err);
      res.status(500).send("Photo upload failed");
    }
  }
);



   //for generating attendence  pdf



const generateAttendancePdf = require("../utils/generateAttendancePdf");

router.get("/attendance/:id/download-pdf", async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.send("Student not found!");

  const currentMonth = new Date().toISOString().slice(0, 7);

  const records = await Attendance.find({
    date: { $regex: `^${currentMonth}` },
    $or: [{ present: student.roll }, { absent: student.roll }]
  });

  const attendanceMap = {};

  records.forEach(r => {
    const subject = r.courseId;
    if (!attendanceMap[subject]) {
      attendanceMap[subject] = { present: 0, total: 0 };
    }
    attendanceMap[subject].total++;
    if (r.present.includes(student.roll)) {
      attendanceMap[subject].present++;
    }
  });

  const attendance = subjects.map(sub => {
    const rec = attendanceMap[sub] || { present: 0, total: 0 };
    return {
      subject: sub,
      present: rec.present,
      total: rec.total
    };
  });

  generateAttendancePdf(res, student, attendance);
});

//for generating result pdf

router.get("/results/:id/download/:semester", async (req, res) => {
  try {
    const { id, semester } = req.params;

    // 1️⃣ Get student by ObjectId
    const student = await Student.findById(id);
    if (!student) return res.send("Student not found");

    // 2️⃣ Get result using studentId STRING
    const result = await Result.findOne({
      studentId: student.studentId,   // ✅ CORRECT
      semester: Number(semester)
    });

    if (!result) return res.send("Result not found");

    // 3️⃣ Generate PDF
    generateResultPdf(res, student, result);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating result PDF");
  }
});


// ===============================
// 📄 DOWNLOAD FEE RECEIPT BY PAYMENT ID (PDF)
// ===============================
router.get("/receipt/:paymentId", async (req, res) => {

  try {
    const { paymentId } = req.params;

    const fee = await Fee.findOne({ paymentId });
    if (!fee) return res.status(404).send("Receipt not found");

    const student = await Student.findById(fee.student);
    if (!student) return res.status(404).send("Student not found");

    streamReceiptPdf(res, {
      paymentId,
      studentName: student.name,
      studentId: student.studentId,
      feeType: fee.feeType,
      amount: fee.amount,
      paymentMethod: fee.paymentGateway || "Online"
    });

  } catch (err) {
    console.error("❌ Receipt download error:", err);
    res.status(500).send("Receipt download failed");
  }
});






module.exports = router;





