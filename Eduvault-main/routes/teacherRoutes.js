const express = require("express");
const router = express.Router();

const Models = require("../models");
const Student = Models.Student;
const Notice = Models.Notice;
const Result = Models.Result;



/* =====================================================
   STUDENTS
===================================================== */

// ADD STUDENT FORM
router.get("/add", (req, res) => {
  res.render("teacher/addStudent", {
    active: "teacher",
    title: "Add Student"
  });
});

// SAVE STUDENT


// SAVE STUDENT (🔥 FIXED)
const bcrypt = require("bcryptjs");
const Parent = Models.Parent;

// SAVE STUDENT + PARENT (🔥 FINAL FIX)
router.post("/add", async (req, res) => {
  try {
    const {
      password,
     parentName,        
      parentEmail,
      parentPassword,
      ...studentFields
    } = req.body;

    // 🔴 CHECK 1: Student ID already exists
    const studentIdExists = await Student.findOne({
      studentId: studentFields.studentId
    });
    if (studentIdExists) {
      return res.send("Student ID already exists");
    }

    // 🔴 CHECK 2: Student Email already exists
    const studentEmailExists = await Student.findOne({
      email: studentFields.email
    });
    if (studentEmailExists) {
      return res.send("Student email already exists");
    }

    // 🔴 CHECK 3: Parent Email already exists
    const parentEmailExists = await Parent.findOne({
      email: parentEmail
    });
    if (parentEmailExists) {
      return res.send("Parent email already exists");
    }

    // 🔐 HASH STUDENT PASSWORD (ONLY STUDENT)
    const studentHashedPassword = await bcrypt.hash(password, 10);

    // ✅ CREATE STUDENT
    const student = await Student.create({
      ...studentFields,
      password: studentHashedPassword
    });

    // ✅ CREATE PARENT (NO HASH HERE ❗)
    await Parent.create({
    name: parentName.trim(),   // 🔥 REQUIRED
      email: parentEmail.trim(),
      password: parentPassword,
      student: student._id
    });
    res.redirect("/admin/teacher");

  } catch (err) {
    console.error("❌ Error creating student/parent:", err);
    res.send("Error adding student");
  }
});


// LIST STUDENTS
router.get("/", async (req, res) => {
  const students = await Student.find().sort({
    department: 1,
    section: 1,
    roll: 1
  });

  res.render("teacher/listStudents", {
    students,
    active: "teacher",
    title: "Manage Students"
  });
});

// DELETE STUDENT
router.post("/delete/:id", async (req, res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.redirect("/admin/teacher");
});

/* =====================================================
   NOTICES
===================================================== */

router.get("/notices", async (req, res) => {
  const notices = await Notice.find().sort({ createdAt: -1 });

  res.render("teacher/notices", {
    notices,
    active: "notices",
    title: "Create Notice"
  });
});

router.post("/notices/create", async (req, res) => {
  await Notice.create({
    title: req.body.title,
    content: req.body.content,
    priority: req.body.priority,
    forRole: req.body.audience,
    createdAt: new Date()
  });

  res.redirect("/admin/teacher/notices");
});

/* =====================================================
   RESULTS (ERP LEVEL – FINAL FIXED)
===================================================== */

const subjectsList = require("../utils/subjects");

/* ---------- ADD RESULT FORM ---------- */
router.get("/results/add", async (req, res) => {
  const students = await Student.find().sort({ roll: 1 });

  res.render("teacher/results", {
    students,
    subjects: subjectsList,
    active: "results",
    title: "Add Result"
  });
});

/* ---------- SAVE RESULT ---------- */
router.post("/results/add", async (req, res) => {
  try {
    const { studentId, semester, subjects } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.send("No subjects provided");
    }

    const exists = await Result.findOne({ studentId, semester });
    if (exists) {
      return res.send("Result already exists for this student & semester");
    }

    await Result.create({
      studentId,
      semester,
      subjects
    });

    res.redirect("/admin/teacher/results/add?success=true");


  } catch (err) {
    console.error("❌ Result save error:", err);
    res.send("Result not saved");
  }
});

/* ---------- VIEW RESULTS ---------- */
router.get("/results", async (req, res) => {
  const results = await Result.find().sort({ createdAt: -1 });
  const students = await Student.find().sort({ roll: 1 });

  res.render("teacher/results", {
    results,
    students,
    title: "Manage Results",
    active: "results"
  });
});

/* ---------- EDIT RESULT ---------- */
router.get("/results/edit/:id", async (req, res) => {
  const result = await Result.findById(req.params.id);

  res.render("teacher/editResult", {
    result,
    subjects: subjectsList,
    active: "results",
    title: "Edit Result"
  });
});

/* ---------- UPDATE RESULT (🔥 FIXED) ---------- */
router.post("/results/edit/:id", async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);

    result.studentId = req.body.studentId;
    result.semester = req.body.semester;
    result.subjects = req.body.subjects;

    await result.save(); // 🔥 triggers pre("save")

    res.redirect("/admin/teacher/results");
  } catch (err) {
    console.error(err);
    res.send("Update failed");
  }
});

module.exports = router;
