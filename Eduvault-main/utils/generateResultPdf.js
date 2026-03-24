const PDFDocument = require("pdfkit");

const axios = require("axios");


module.exports = async function generateResultPdf(res, student, result) 
{
  const doc = new PDFDocument({ size: "A4", margin: 0 });
  doc.pipe(res);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${student.name}_Semester_${result.semester}_Result.pdf`
  );

  /* ===================== COLOR SYSTEM ===================== */
  const C = {
    primary: "#1f2937",     // charcoal
    gold: "#c9a227",        // champagne gold
    accent: "#4f46e5",
    success: "#16a34a",
    danger: "#dc2626",
    muted: "#6b7280",
    soft: "#f8fafc",
    white: "#ffffff",
    border: "#e5e7eb",
    dark: "#111827",

  };

  /* ===================== BACKGROUND ===================== */
  doc.rect(0, 0, 595, 842).fill(C.soft);

  /* ===================== HEADER BAR ===================== */
  doc.rect(0, 0, 595, 120).fill(C.primary);

  doc
    .fillColor(C.gold)
    .font("Helvetica-Bold")
    .fontSize(24)
    .text("ACADEMIC RESULT REPORT", 40, 45);

  doc
    .fillColor("#e5e7eb")
    .fontSize(11)
    .text("EduVault · Digital Academic Intelligence", 40, 78);

  /* ===================== STUDENT PHOTO ===================== */
  /* ===================== STUDENT PHOTO (CLOUDINARY) ===================== */
const avatarX = 460;
const avatarY = 30;

if (student.photo && student.photo.startsWith("http")) {
  try {
    const response = await axios.get(student.photo, {
      responseType: "arraybuffer"
    });

    const imgBuffer = Buffer.from(response.data, "binary");

    doc.save()
      .circle(avatarX + 40, avatarY + 40, 40)
      .clip()
      .image(imgBuffer, avatarX, avatarY, {
        width: 80,
        height: 80
      })
      .restore();

  } catch (err) {
    console.error("PDF photo load failed:", err.message);
  }
}



  /* ===================== STUDENT CARD (FAKE SHADOW) ===================== */
  const cardY = 150;

  // Shadow layer
  doc.roundedRect(44, cardY + 6, 507, 120, 24).fill("#d1d5db");

  // Main card
  doc.roundedRect(40, cardY, 515, 120, 24).fill(C.white);

  doc
    .fillColor(C.primary)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text(student.name.toUpperCase(), 70, cardY + 30);

  doc
    .font("Helvetica")
    .fontSize(12)
    .fillColor(C.muted)
    .text(`Roll No: ${student.roll}`, 70, cardY + 64)
    .text(`Student ID: ${student.studentId}`, 230, cardY + 64)
    .text(`Semester: ${result.semester}`, 420, cardY + 64);

  /* ===================== KPI SECTION ===================== */
  const kpiY = cardY + 150;

  function kpi(x, label, value, color) {
    // shadow
    doc.roundedRect(x + 3, kpiY + 5, 120, 75, 18).fill("#e5e7eb");
    // card
    doc.roundedRect(x, kpiY, 120, 75, 18).fill(C.white);

    doc
      .fillColor(C.muted)
      .fontSize(11)
      .text(label, x + 14, kpiY + 14);

    doc
      .fillColor(color)
      .font("Helvetica-Bold")
      .fontSize(22)
      .text(value, x + 14, kpiY + 40);
  }

  kpi(40, "TOTAL MARKS", result.totalMarks, C.accent);
  kpi(185, "PERCENTAGE", `${result.percentage}%`, C.success);
  kpi(330, "CGPA", result.cgpa, C.gold);
  kpi(
    475,
    "STATUS",
    result.status,
    result.status === "PASS" ? C.success : C.danger
  );

  /* ===================== SUBJECT PERFORMANCE ===================== */
  let y = kpiY + 110;

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(C.primary)
    .text("Subject-wise Performance", 40, y);

  y += 20;

  result.subjects.forEach(s => {
    const pass = s.marks >= 40;
    const color = pass ? C.success : C.danger;

    doc.roundedRect(40, y, 515, 52, 14).fill(C.white);

    doc
      .fillColor(C.primary)
      .font("Helvetica-Bold")
      .fontSize(13)
      .text(s.subjectName, 60, y + 18);

    doc
      .fillColor(color)
      .fontSize(13)
      .text(`${s.marks}/${s.maxMarks}`, 380, y + 18);

    doc
      .font("Helvetica-Bold")
      .text(pass ? "PASS" : "FAIL", 480, y + 18);

    y += 62;

    if (y > 720) {
      doc.addPage();
      y = 60;
    }
  });


/* ===== INSPIRATIONAL QUOTE ===== */

doc
  .moveTo(80, 760)
  .lineTo(515, 760)
  .stroke(C.border);

doc
  .font("Helvetica-Oblique")
  .fontSize(11)
  .fillColor(C.dark)
  .text(
    "“Education is the most powerful weapon which you can use to change the world.”",
    80,
    772,
    { align: "center", width: 435 }
  );

doc
  .font("Helvetica")
  .fontSize(9)
  .fillColor(C.muted)
  .text(
    "— Nelson Mandela",
    80,
    795,
    { align: "center", width: 435 }
  );

  /* ===================== FOOTER ===================== */
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(C.muted)
    .text(
      "This is a system-generated academic document • Verified by EduVault",
      40,
      820,
      { align: "center", width: 515 }
    );

  doc.end();
};
