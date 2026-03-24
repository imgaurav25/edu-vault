const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const sendReceipt = require("../utils/sendReceipt");

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount, listingId } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${listingId}_${Date.now()}`
    });

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: "INR",
      key_id: process.env.RAZORPAY_KEY_ID
    });

  } catch (err) {
    console.log("Razorpay Create Order Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PAYMENT SUCCESS
router.post("/payment-success", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      title,
      amount,
      location
    } = req.body;

    // Signature Verification
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: "Verification failed" });
    }

    // Send email receipt
    await sendReceipt(email, {
      hotel: title,
      location,
      amount,
      paymentId: razorpay_payment_id
    });

    res.json({ success: true });

  } catch (err) {
    console.log("Payment Success Error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
