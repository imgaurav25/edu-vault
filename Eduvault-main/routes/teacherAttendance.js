const express = require("express");
const router = express.Router();
const Models = require("../models");
const Student = Models.Student;
const Attendance = Models.Attendance;

// ⭐ Import one shared subject list (used by both Teacher + Student portal)
const subjects = require("../utils/subjects");

/* -----------------------------------------------------
   1️⃣ SHOW ATTENDANCE PANEL
----------------------------------------------------- */
router.get("/attendance", async (req, res) => {
  try {
    const students = await Student.find();

    res.render("teacher/attendancePanel", { 
      students,
      subjects,     // ⭐ Now loaded from utils/subjects.js
      active: "attendance",
      title: "Attendance Panel"
    });

  } catch (err) {
    console.error("Attendance panel error:", err);
    res.send("Error loading attendance panel.");
  }
});

/* -----------------------------------------------------
   2️⃣ SAVE ATTENDANCE (FINAL PRODUCTION-READY VERSION)
----------------------------------------------------- */
// router.post("/attendance/save", async (req, res) => {
//   try {
//     console.log("=== attendance save request ===");
//     console.log("Headers:", req.headers["content-type"]);
//     console.log("Raw Body:", req.body);

//     let { subject, date, presentStudents } = req.body;

//     // Normalize presentStudents input
//     if (!presentStudents) presentStudents = [];
//     if (!Array.isArray(presentStudents)) presentStudents = [presentStudents];

//     presentStudents = presentStudents.map(id => String(id).trim()).filter(id => id !== "");

//     console.log("Clean Present Students:", presentStudents);

//     if (!subject || !date) {
//       return res.status(400).send("Subject and Date are required!");
//     }

//     // Fetch all students
//     const students = await Student.find();

//     for (const s of students) {
//       const studentId = String(s.roll || s.studentId).trim();

//       if (!studentId) {
//         console.warn("Skipping student with missing ID:", s);
//         continue;
//       }

//       // Find attendance record for this student + subject
//       let record = await Attendance.findOne({ studentId, subject });

//       if (!record) {
//         record = new Attendance({
//           studentId,
//           subject,
//           presentDates: [],
//           totalClasses: 0
//         });
//       }

//       // Increase total class count
//       record.totalClasses += 1;

//       // Mark present
//       if (presentStudents.includes(studentId)) {
//         if (!record.presentDates.includes(date)) {
//           record.presentDates.push(date);
//         }
//       }

//       await record.save();
//     }

//     console.log("Attendance Saved:", {
//       subject,
//       date,
//       presentCount: presentStudents.length
//     });

//     res.redirect("/teacher/attendance");

//   } catch (err) {
//     console.error("Attendance save error:", err);
//     res.status(500).send("Error saving attendance.");
//   }
// });



router.post("/attendance/save", async (req, res) => {
  try {
    let { subject, date, presentStudents } = req.body;

    if (!subject || !date) {
      return res.status(400).send("Subject and Date are required");
    }

    // normalize presentStudents
    if (!presentStudents) presentStudents = [];
    if (!Array.isArray(presentStudents)) {
      presentStudents = [presentStudents];
    }

    presentStudents = presentStudents.map(s => String(s).trim());

    const students = await Student.find();

    const present = [];
    const absent = [];

    for (const s of students) {
      const roll = String(s.roll || s.studentId).trim();
      if (!roll) continue;

      if (presentStudents.includes(roll)) {
        present.push(roll);
      } else {
        absent.push(roll);
      }
    }

    // 🔥 SAVE EXACTLY AS PER SCHEMA
    await Attendance.create({
      courseId: subject,                 // MUST match subjects.js
      date: date,
      present: present,
      absent: absent
    });

    console.log("✅ Attendance saved:", {
      subject,
      date,
      present: present.length,
      absent: absent.length
    });

    res.redirect("/teacher/attendance");

  } catch (err) {
    console.error("❌ Attendance save error:", err);
    res.status(500).send("Error saving attendance");
  }
});

module.exports = router;
