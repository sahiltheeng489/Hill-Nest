// Import Express
const express = require("express");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { validateRoom, validateObjectIdParam } = require("../middleware/validationMiddleware");

// Create router object
const router = express.Router();

// Import controller functions
const {
  getRooms,
  createRoom,
  getRoomById,
} = require("../controllers/roomController");

// GET all rooms
router.get("/", getRooms);

// POST new room
router.post("/", protect, authorizeRoles("admin"), validateRoom, createRoom);

// GET single room by ID
router.get("/:id", validateObjectIdParam("id"), getRoomById);

// Export router
module.exports = router;
