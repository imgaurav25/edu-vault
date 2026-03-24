const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

module.exports = function generateAttendancePdf(
  res,
  student,
  attendance,
  options = {}
) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  doc.pipe(res);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${student.name}_Attendance_Report.pdf`
  );

  /* ===================== CONFIG ===================== */
  const parentName = options.parentName || "Parent / Guardian";
  const instituteName = options.instituteName || "EduVault Institute";
  const logoPath = options.logoPath;
  const classAverage = options.classAverage || {};

  const C = {
    primary: "#4f46e5",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    dark: "#0f172a",
    muted: "#64748b",
    soft: "#f1f5f9",
    white: "#ffffff",
    border: "#e5e7eb"
  };

  /* ===================== WATERMARK ===================== */
  function watermark() {
    if (logoPath && fs.existsSync(logoPath)) {
      doc.opacity(0.05);
      doc.image(logoPath, 140, 260, { width: 320 });
      doc.opacity(1);
    }
  }
  watermark();

  /* ===================== CALCULATIONS ===================== */
  let totalPresent = 0;
  let totalClasses = 0;

  attendance.forEach(a => {
    totalPresent += a.present;
    totalClasses += a.total;
  });

  const overall =
    totalClasses === 0 ? 0 : Math.round((totalPresent / totalClasses) * 100);

  const ranked = [...attendance]
    .map(s => ({
      ...s,
      percent: s.total ? Math.round((s.present / s.total) * 100) : 0
    }))
    .sort((a, b) => b.percent - a.percent);

  /* ===================== HEADER ===================== */
  doc.rect(0, 0, 595, 120).fill(C.primary);
  doc.fillColor("#fff").fontSize(22)
    .text("Attendance Intelligence Report", 110, 38);
  doc.fontSize(11).fillColor("#e0e7ff")
    .text(instituteName, 110, 70);
  doc.fontSize(30).fillColor("#fff").text("Φ", 55, 40);
  doc.moveDown(5);

  /* ===================== STUDENT PHOTO PATH ===================== */
  const studentPhotoPath = student.photo
    ? path.join(process.cwd(), student.photo)
    : null;

  /* ===================== STUDENT PROFILE HERO ===================== */
  const heroY = doc.y;

// Main container
doc.roundedRect(40, heroY, 515, 150, 20).fill(C.white).stroke(C.border);
doc.roundedRect(40, heroY, 6, 150, 20).fill(C.primary);

/* ---------- PHOTO ---------- */
const photoX = 70;
const photoY = heroY + 35;
const photoSize = 80;

doc.circle(photoX + 40, photoY + 40, 42).fill(C.soft);

if (studentPhotoPath && fs.existsSync(studentPhotoPath)) {
  doc.save()
    .circle(photoX + 40, photoY + 40, 40)
    .clip()
    .image(studentPhotoPath, photoX, photoY, {
      width: photoSize,
      height: photoSize
    })
    .restore();
} else {
  doc.circle(photoX + 40, photoY + 40, 40).fill(C.primary);
  doc.fillColor("#fff")
    .fontSize(28)
    .text(student.name.charAt(0).toUpperCase(), photoX + 28, photoY + 22);
}

/* ---------- TEXT DETAILS ---------- */
const textX = 170;

// Greeting
doc.fillColor(C.muted)
  .font("Helvetica")
  .fontSize(10)
  .text("Greetings from EduVault", textX, heroY + 24);

// Student Name (BOLD)
doc.fillColor(C.dark)
  .font("Helvetica-Bold")
  .fontSize(24)
  .text(student.name.toUpperCase(), textX, heroY + 44);

// Roll No
doc.fillColor(C.muted)
  .font("Helvetica")
  .fontSize(13)
  .text("Roll No", textX, heroY + 82);

doc.fillColor(C.dark)
  .font("Helvetica-Bold") // ✅ THIS WAS MISSING
  .fontSize(13)
  .text(student.roll, textX + 55, heroY + 80);

// Student ID
doc.fillColor(C.muted)
  .font("Helvetica")
  .fontSize(13)
  .text("Student ID", textX, heroY + 102);

doc.fillColor(C.dark)
  .font("Helvetica-Bold") // ✅ THIS WAS MISSING
  .fontSize(13)
  .text(student.studentId, textX + 75, heroY + 100);

// Prepared for
doc.fillColor(C.muted)
  .font("Helvetica")
  .fontSize(13)
  .text("Prepared for", textX, heroY + 122);

doc.fillColor(C.dark)
  .font("Helvetica-Bold") // ✅ THIS WAS MISSING
  .fontSize(13)
  .text(parentName, textX + 85, heroY + 120);

// Reset font after section
doc.font("Helvetica");


// Reset font
doc.font("Helvetica");


  /* ===================== STUDENT PROFILE HERO (HTML-LIKE PREMIUM DESIGN) ===================== */



  /* ===================== SUBJECT DASHBOARD ===================== */
  doc.addPage();
watermark();

doc.fontSize(18).fillColor(C.dark)
  .text("Subject-wise AI Performance Dashboard")
  .moveDown(1);

ranked.forEach((sub, i) => {
  if (doc.y > 680) {
    doc.addPage();
    watermark();
  }

  const y = doc.y;                    // ✅ FIX 1
  const p = sub.percent;              // ✅ FIX 2
  const avg = classAverage[sub.subject];
  const theme = p >= 75 ? C.success : p >= 50 ? C.warning : C.danger;

  // ===== Subject Card =====
  doc.roundedRect(40, y, 515, 110, 18).fill(C.soft);
  doc.roundedRect(40, y, 515, 34, 18).fill(theme);

  doc.fillColor("#fff").fontSize(14)
    .text(`#${i + 1}  ${sub.subject.toUpperCase()}`, 60, y + 10);

  doc.fillColor(C.dark).fontSize(12)
    .text(`Attendance: ${p}%`, 60, y + 55)
    .text(`Class Avg: ${avg ?? "N/A"}%`, 200, y + 55);

  // ===== Rounded Progress Ring =====
  const ringCX = 460;
  const ringCY = y + 70;
  const ringR = 26;
  const ringWidth = 8;

  // Background ring
  doc.circle(ringCX, ringCY, ringR)
    .lineWidth(ringWidth)
    .stroke(C.border);

  // Filled arc
  doc.arc(
      ringCX,
      ringCY,
      ringR,
      -Math.PI / 2,
      -Math.PI / 2 + (2 * Math.PI * p) / 100
    )
    .lineWidth(ringWidth)
    .stroke(theme);

  // Percentage text
  doc.fillColor(C.dark)
    .fontSize(10)
    .text(`${p}%`, ringCX - 10, ringCY - 6);

  doc.moveDown(3);
});
/* ===================== DONUT SUMMARY ===================== */
doc.addPage();
watermark();

// Title
doc.fillColor(C.dark)
  .font("Helvetica-Bold")
  .fontSize(18)
  .text("Overall Attendance Summary", { align: "center" })
  .moveDown(2);

// Donut chart
const cx = 300, cy = 350, r = 100;

doc.circle(cx, cy, r)
  .lineWidth(22)
  .stroke(C.border);

doc.arc(
  cx,
  cy,
  r,
  -Math.PI / 2,
  -Math.PI / 2 + (2 * Math.PI * overall) / 100
)
  .lineWidth(22)
  .stroke(
    overall >= 75 ? C.success : overall >= 50 ? C.warning : C.danger
  );

// Percentage text
doc.fillColor(C.dark)
  .font("Helvetica-Bold")
  .fontSize(34)
  .text(`${overall}%`, cx - 45, cy - 22);

doc.fillColor(C.muted)
  .font("Helvetica")
  .fontSize(12)
  .text("Attendance Rate", cx - 48, cy + 18);

/* ===================== DIVIDER ===================== */
doc.moveTo(120, cy + 130)
  .lineTo(480, cy + 130)
  .stroke(C.border);

/* ===================== MOTIVATIONAL MESSAGE ===================== */
doc.font("Helvetica-Bold")
  .fillColor(C.dark)
  .fontSize(14)
  .text(
    "Success is achieved through consistent effort, not by mere wishes.",
    100,
    cy + 150,
    { align: "center", width: 400 }
  );

/* ===================== TAGLINE ===================== */
doc.font("Helvetica-Oblique")
  .fillColor(C.muted)
  .fontSize(10)
  .text(
    "— Commitment • Consistency • Academic Discipline",
    100,
    cy + 180,
    { align: "center", width: 400 }
  );


  /* ===================== END ===================== */
  doc.end();
};







