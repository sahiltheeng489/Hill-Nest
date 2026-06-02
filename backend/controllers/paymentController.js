const crypto = require("crypto");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_KEY_ID === "rzp_test_REPLACE_ME"
    ) {
      throw new Error(
        "Razorpay keys are not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to backend/.env"
      );
    }

    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return _razorpay;
};

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"];

const hasRoomConflict = async ({ room, checkIn, checkOut, excludeBookingId }) => {
  const query = {
    room,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const overlappingBooking = await Booking.findOne(query).select("_id");
  return Boolean(overlappingBooking);
};

const createOrder = async (req, res) => {
  try {
    const { room, name, email, checkIn, checkOut, guests } = req.body;

    if (!room || !name || !email || !checkIn || !checkOut || guests === undefined) {
      return res.status(400).json({ message: "All booking fields are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(room)) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ message: "Room not found" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: "Invalid booking dates" });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const normalizedGuests = Number(guests);
    if (!Number.isInteger(normalizedGuests) || normalizedGuests < 1) {
      return res.status(400).json({ message: "Guests must be a positive integer" });
    }

    const conflictExists = await hasRoomConflict({
      room,
      checkIn: checkInDate,
      checkOut: checkOutDate,
    });

    if (conflictExists) {
      return res.status(409).json({ message: "Room is no longer available for the selected dates" });
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((checkOutDate - checkInDate) / msPerDay);
    const totalRupees = nights * roomDoc.price;
    const totalPaise = totalRupees * 100;

    const order = await getRazorpay().orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        roomId: room,
        userId: req.user._id.toString(),
        nights: nights.toString(),
      },
    });

    return res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      nights,
      totalRupees,
      roomName: roomDoc.name,
    });
  } catch (error) {
    console.error("createOrder error:", error);
    return res.status(500).json({ message: error.message || "Failed to create payment order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      room,
      name,
      email,
      checkIn,
      checkOut,
      guests,
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    if (!room || !name || !email || !checkIn || !checkOut || guests === undefined) {
      return res.status(400).json({ message: "Missing booking fields" });
    }

    if (!mongoose.Types.ObjectId.isValid(room)) {
      return res.status(400).json({ message: "Invalid room id" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed: invalid signature" });
    }

    const roomDoc = await Room.findById(room);
    if (!roomDoc) {
      return res.status(404).json({ message: "Room not found" });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ message: "Invalid booking dates" });
    }

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const normalizedGuests = Number(guests);
    if (!Number.isInteger(normalizedGuests) || normalizedGuests < 1) {
      return res.status(400).json({ message: "Guests must be a positive integer" });
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((checkOutDate - checkInDate) / msPerDay);
    const totalPaise = nights * roomDoc.price * 100;

    const razorpayOrder = await getRazorpay().orders.fetch(razorpayOrderId);
    const orderRoomId = razorpayOrder.notes?.roomId;
    const orderUserId = razorpayOrder.notes?.userId;
    const orderNights = Number(razorpayOrder.notes?.nights);

    if (
      razorpayOrder.amount !== totalPaise ||
      razorpayOrder.currency !== "INR" ||
      orderRoomId !== room ||
      orderUserId !== req.user._id.toString() ||
      orderNights !== nights
    ) {
      return res.status(400).json({ message: "Payment verification failed: order details do not match booking" });
    }

    const existing = await Booking.findOne({ "payment.razorpayPaymentId": razorpayPaymentId });
    if (existing) {
      if (existing.user.toString() !== req.user._id.toString()) {
        return res.status(409).json({ message: "Payment has already been linked to another booking" });
      }
      return res.status(200).json(existing);
    }

    const conflictExists = await hasRoomConflict({
      room,
      checkIn: checkInDate,
      checkOut: checkOutDate,
    });

    if (conflictExists) {
      return res.status(409).json({ message: "Room is no longer available for the selected dates" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      room,
      name,
      email,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: normalizedGuests,
      status: "confirmed",
      payment: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: totalPaise,
        currency: "INR",
        status: "paid",
      },
    });

    return res.status(201).json(booking);
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ message: error.message || "Payment verification error" });
  }
};

module.exports = { createOrder, verifyPayment };
