const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Room = require("../models/Room");

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

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
    const bookings = await Booking.find({ user: req.user._id }).populate("room");
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

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
};
