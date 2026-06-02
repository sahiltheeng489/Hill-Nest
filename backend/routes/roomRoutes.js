// Import Express
const express = require("express");

// Create router object
const router = express.Router();

// Import controller functions
const {
  getRooms,
  createRoom,
  getRoomById,
} = require("../controllers/roomController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// GET all rooms
router.get("/", getRooms);

// POST new room
router.post("/", protect, authorizeRoles("admin"), createRoom);

// GET single room by ID
router.get("/:id", getRoomById);

// Export router
module.exports = router;
