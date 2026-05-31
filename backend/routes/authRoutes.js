const express = require("express");
const { authRateLimiter } = require("../middleware/rateLimitMiddleware");
const {
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");
const {
  validateLogin,
  validatePasswordReset,
  validatePasswordResetRequest,
  validateRegister,
} = require("../middleware/validationMiddleware");

const router = express.Router();

router.post("/register", authRateLimiter, validateRegister, registerUser);
router.post("/login", authRateLimiter, validateLogin, loginUser);
router.post("/refresh", refreshSession);
router.post("/logout", logoutUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", validatePasswordResetRequest, requestPasswordReset);
router.post("/reset-password/:token", validatePasswordReset, resetPassword);

module.exports = router;
