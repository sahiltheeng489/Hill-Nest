const express = require("express");

const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const {
  validateBooking,
  validateObjectIdParam,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/", protect, validateBooking, createBooking);
router.get("/", protect, getBookings);
router.get(
  "/:id",
  protect,
  validateObjectIdParam("id"),
  getBookingById
);
router.put(
  "/:id",
  protect,
  validateObjectIdParam("id"),
  updateBooking
);
router.patch(
  "/:id/cancel",
  protect,
  validateObjectIdParam("id"),
  cancelBooking
);

module.exports = router;
