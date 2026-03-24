const PDFDocument = require("pdfkit");

module.exports = function streamReceiptPdf(res, data) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=EduVault-Receipt-${data.paymentId}.pdf`
  );

  doc.pipe(res);

  doc.fontSize(20).text("OFFICIAL FEE RECEIPT", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Student Name: ${data.studentName}`);
  doc.text(`Student ID: ${data.studentId}`);
  doc.text(`Fee Type: ${data.feeType}`);
  doc.text(`Amount Paid: ₹${data.amount}`);
  doc.text(`Payment Method: ${data.paymentMethod}`);
  doc.text(`Payment ID: ${data.paymentId}`);
  doc.text("Status: PAID");

  doc.end();
};
