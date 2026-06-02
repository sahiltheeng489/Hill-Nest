const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

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

const createBooking = async (req, res) => {
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

    const roomExists = await Room.findById(room);
    if (!roomExists) {
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
      return res.status(409).json({ message: "Room is not available for the selected dates" });
    }

    const booking = await Booking.create({
      user: req.user._id,
      room,
      name,
      email,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: normalizedGuests,
    });

    return res.status(201).json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate("room").sort({ createdAt: -1 });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id).populate("room");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: you can only access your own bookings" });
    }

    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, checkIn, checkOut, guests, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: you can only update your own bookings" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Cancelled bookings cannot be updated" });
    }

    if (status !== undefined && status !== booking.status) {
      return res.status(403).json({ message: "Forbidden: booking status cannot be changed from this endpoint" });
    }

    if (email !== undefined && !isValidEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const nextCheckIn = checkIn ? new Date(checkIn) : booking.checkIn;
    const nextCheckOut = checkOut ? new Date(checkOut) : booking.checkOut;

    if (Number.isNaN(nextCheckIn.getTime()) || Number.isNaN(nextCheckOut.getTime())) {
      return res.status(400).json({ message: "Invalid booking dates" });
    }

    if (nextCheckOut <= nextCheckIn) {
      return res.status(400).json({ message: "Check-out must be after check-in" });
    }

    const nextGuests = guests !== undefined ? Number(guests) : booking.guests;
    if (!Number.isInteger(nextGuests) || nextGuests < 1) {
      return res.status(400).json({ message: "Guests must be a positive integer" });
    }

    const conflictExists = await hasRoomConflict({
      room: booking.room,
      checkIn: nextCheckIn,
      checkOut: nextCheckOut,
      excludeBookingId: booking._id,
    });

    if (conflictExists) {
      return res.status(409).json({ message: "Room is not available for the selected dates" });
    }

    booking.name = name ?? booking.name;
    booking.email = email ?? booking.email;
    booking.checkIn = nextCheckIn;
    booking.checkOut = nextCheckOut;
    booking.guests = nextGuests;

    await booking.save();
    return res.json(booking);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: you can only cancel your own bookings" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
};
