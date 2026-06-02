const express = require("express");
const { loginUser, registerUser } = require("../controllers/authController");
const { authRateLimiter } = require("../middleware/rateLimitMiddleware");

const router = express.Router();

router.post("/register", authRateLimiter, registerUser);
router.post("/login", authRateLimiter, loginUser);

module.exports = router;
