// Import the Room model so we can interact with MongoDB
const Room = require("../models/Room");
const Booking = require("../models/Booking");

/**
 * @desc    Get all rooms
 * @route   GET /api/rooms
 * @access  Public
 */
const getRooms = async (req, res) => {
  try {
    const {
      minPrice,
      maxPrice,
      checkIn,
      checkOut,
      available,
      search,
    } = req.query;

    const query = {};

    if (minPrice) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }

    if (available === "true") {
      query.available = true;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (req.query.roomType) {
      query.roomType = req.query.roomType;
    }

    if (checkIn && checkOut) {
      const from = new Date(checkIn);
      const to = new Date(checkOut);

      if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from > to) {
        return res.status(400).json({
          message: "Invalid check-in or check-out date range.",
        });
      }

      const overlappingBookings = await Booking.find({
        status: { $in: ["pending", "confirmed"] },
        checkIn: { $lt: to },
        checkOut: { $gt: from },
      }).select("room");

      const unavailableRoomIds = overlappingBookings.map((booking) => booking.room);

      if (unavailableRoomIds.length > 0) {
        query._id = { $nin: unavailableRoomIds };
      }
    }

    const rooms = await Room.find(query);

    // Send filtered rooms back to the frontend as JSON
    res.json(rooms);
  } catch (error) {
    // Handle unexpected server/database errors
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * @desc    Create a new room
 * @route   POST /api/rooms
 * @access  Public (Admin later)
 */
const createRoom = async (req, res) => {
  try {
    // Create a new Room object using request body data
    const room = new Room(req.body);

    // Save room into MongoDB
    const savedRoom = await room.save();

    // Return newly created room
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * @desc    Get a single room by ID
 * @route   GET /api/rooms/:id
 * @access  Public
 */
const getRoomById = async (req, res) => {
  try {
    // req.params.id comes from URL
    // Example: /api/rooms/683f4f123456
    const room = await Room.findById(req.params.id);

    // If room doesn't exist
    if (!room) {
      return res.status(404).json({
        message: "Room not found",
      });
    }

    // Return room data
    res.json(room);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Export functions so routes can use them
module.exports = {
  getRooms,
  createRoom,
  getRoomById,
};
