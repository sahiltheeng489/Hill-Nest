const express = require("express");

const {
  createBooking,
  getBookings,
  getBookingById,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createBooking);
router.get("/", protect, getBookings);
router.get("/:id", protect, getBookingById);

module.exports = router;
