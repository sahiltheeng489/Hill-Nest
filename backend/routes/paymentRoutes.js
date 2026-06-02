const express = require("express");
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// POST /api/payment/create-order  → creates a Razorpay order (pre-payment)
router.post("/create-order", protect, createOrder);

// POST /api/payment/verify        → verifies signature & creates the Booking
router.post("/verify", protect, verifyPayment);

module.exports = router;
