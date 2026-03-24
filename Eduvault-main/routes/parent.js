const express = require("express");
const router = express.Router();

// ⭐ Subject list
const subjects = require("../utils/subjects");

const Models = require("../models");
const Parent = Models.Parent;
const Student = Models.Student;
const Attendance = Models.Attendance;
const Fee = Models.Fee;
const Result = Models.Result;
const Notice = Models.Notice;

/* =================================================
   HELPER FUNCTIONS
================================================= */
function averageMarks(results) {
  if (!results || results.length === 0) return 0;

  let total = 0;
  let count = 0;

  results.forEach(r => {
    if (Array.isArray(r.subjects)) {
      r.subjects.forEach(s => {
        total += Number(s.marks || 0);
        count++;
      });
    }
  });

  return count === 0 ? 0 : +(total / count).toFixed(2);
}

/* =================================================
   1️⃣ PARENT DASHBOARD
================================================= */
router.get("/dashboard/:id", async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) return res.send("Parent not found");

    // ✅ FIXED
    const student = await Student.findById(parent.student);
    if (!student) return res.send("Student not linked");

    /* ---------- Attendance ---------- */
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

    /* ---------- Fees ---------- */
    const fees = await Fee.find({ student: student._id });

    const totalPaid = fees
      .filter(f => f.status?.toLowerCase() === "paid")
      .reduce((s, f) => s + (f.amount || 0), 0);

    const totalDue = fees
      .filter(f => f.status?.toLowerCase() !== "paid")
      .reduce((s, f) => s + (f.amount || 0), 0);

    /* ---------- Results ---------- */
    const results = await Result.find({ studentId: student.studentId });

    /* ---------- Notices ---------- */
    const notices = await Notice.find({
      $or: [{ forRole: "parent" }, { forRole: "all" }]
    }).sort({ createdAt: -1 });

    res.render("parent/dashboard", {
      parent,
      student,
      attendancePercent,
      totalPresent,
      totalClasses,
      totalPaid,
      totalDue,
      avgMarks: averageMarks(results),
      notices,
      active: "dashboard",
      title: "Parent Dashboard"
    });

  } catch (err) {
    console.error("Parent dashboard error:", err);
    res.send("Error loading parent dashboard");
  }
});

/* =================================================
   2️⃣ STUDENT PROFILE
================================================= */
router.get("/student/:id", async (req, res) => {
  const parent = await Parent.findById(req.params.id);
  if (!parent) return res.send("Parent not found");

  const student = await Student.findById(parent.student);
  if (!student) return res.send("Student not linked");

  res.render("parent/student-profile", {
    parent,
    student,
    active: "student",
    title: "Student Profile"
  });
});

/* =================================================
   3️⃣ ATTENDANCE
================================================= */
router.get("/attendance/:id", async (req, res) => {
  const parent = await Parent.findById(req.params.id);
  if (!parent) return res.send("Parent not found");

  const student = await Student.findById(parent.student);
  if (!student) return res.send("Student not linked");

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

  res.render("parent/attendance", {
    parent,
    student,
    attendance,
    month: currentMonth,
    active: "attendance",
    title: "Attendance Report"
  });
});

/* =================================================
   4️⃣ FEES
================================================= */
router.get("/fees/:id", async (req, res) => {
  const parent = await Parent.findById(req.params.id);
  if (!parent) return res.send("Parent not found");

  const student = await Student.findById(parent.student);
  if (!student) return res.send("Student not linked");

  const fees = await Fee.find({ student: student._id });


  const totalPaid = fees
    .filter(f => f.status?.toLowerCase() === "paid")
    .reduce((s, f) => s + (f.amount || 0), 0);

  const totalDue = fees
    .filter(f => f.status?.toLowerCase() !== "paid")
    .reduce((s, f) => s + (f.amount || 0), 0);

  res.render("parent/fees", {
    parent,
    student,
    fees,
    totalPaid,
    totalDue,
    active: "fees",
    title: "Fees Information"
  });
});

/* =================================================
   5️⃣ RESULTS
================================================= */
router.get("/results/:id", async (req, res) => {
  const parent = await Parent.findById(req.params.id);
  if (!parent) return res.send("Parent not found");

  const student = await Student.findById(parent.student);
  if (!student) return res.send("Student not linked");

  const results = await Result.find({ studentId: student.studentId });
  const subjectResults = results.flatMap(r => r.subjects || []);

  res.render("parent/results", {
    parent,
    student,
    results: subjectResults,
    avgMarks: averageMarks(results),
    active: "results",
    title: "Academic Results"
  });
});

/* =================================================
   6️⃣ NOTICES
================================================= */
router.get("/notices/:id", async (req, res) => {
  const parent = await Parent.findById(req.params.id);
  if (!parent) return res.send("Parent not found");

  const student = await Student.findById(parent.student);

  const notices = await Notice.find({
    $or: [{ forRole: "parent" }, { forRole: "all" }]
  }).sort({ createdAt: -1 });

  res.render("parent/notices", {
    parent,
    student,
    notices,
    active: "notices",
    title: "Parent Notices"
  });
});

module.exports = router;
