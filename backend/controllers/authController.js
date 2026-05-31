const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const REFRESH_COOKIE_NAME = "project_f_refresh_token";

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
    }
  );
};

const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

const getCookie = (req, name) => {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const cookie = cookies
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const buildUrl = (req, path) => `${req.protocol}://${req.get("host")}${path}`;

const buildAuthResponse = (user) => ({
  token: generateToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
  },
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: "A user with this email already exists" });
    }

    const user = await User.create({ name, email, password });
    const verificationToken = user.createEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, generateRefreshToken(user._id));

    return res.status(201).json({
      ...buildAuthResponse(user),
      emailVerification: {
        required: true,
        expiresIn: "24h",
        devUrl: buildUrl(req, `/api/auth/verify-email/${verificationToken}`),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    setRefreshCookie(res, generateRefreshToken(user._id));

    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const refreshSession = async (req, res) => {
  try {
    const refreshToken = getCookie(req, REFRESH_COOKIE_NAME);

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "User no longer exists" });
    }

    setRefreshCookie(res, generateRefreshToken(user._id));
    return res.status(200).json(buildAuthResponse(user));
  } catch (error) {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Refresh token invalid" });
  }
};

const logoutUser = (req, res) => {
  clearRefreshCookie(res);
  return res.status(200).json({ message: "Logged out successfully" });
};

const verifyEmail = async (req, res) => {
  try {
    const tokenHash = hashToken(req.params.token);
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Verification token is invalid or expired" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      message: "Email verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Email verification failed", error: error.message });
  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    const response = {
      message: "If an account exists for this email, a password reset link has been created.",
    };

    if (!user) {
      return res.status(200).json(response);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    if (process.env.NODE_ENV !== "production") {
      response.devUrl = buildUrl(req, `/api/auth/reset-password/${resetToken}`);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Password reset request failed", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const tokenHash = hashToken(req.params.token);
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Password reset token is invalid or expired" });
    }

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    setRefreshCookie(res, generateRefreshToken(user._id));

    return res.status(200).json({
      message: "Password reset successfully",
      ...buildAuthResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: "Password reset failed", error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
};
