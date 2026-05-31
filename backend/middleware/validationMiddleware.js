const mongoose = require("mongoose");

const isValidEmail = (email) =>
  typeof email === "string" && /\S+@\S+\.\S+/.test(email);

const isPresent = (value) =>
  value !== undefined && value !== null && String(value).trim() !== "";

const sendValidationError = (res, errors) =>
  res.status(400).json({
    message: "Validation failed",
    errors,
  });

const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!isPresent(name)) errors.push("Name is required");
  if (!isValidEmail(email)) errors.push("A valid email is required");
  if (!isPresent(password) || String(password).length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (errors.length) return sendValidationError(res, errors);

  req.body.name = String(name).trim();
  req.body.email = String(email).trim().toLowerCase();
  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!isValidEmail(email)) errors.push("A valid email is required");
  if (!isPresent(password)) errors.push("Password is required");

  if (errors.length) return sendValidationError(res, errors);

  req.body.email = String(email).trim().toLowerCase();
  return next();
};

const validatePasswordResetRequest = (req, res, next) => {
  if (!isValidEmail(req.body.email)) {
    return sendValidationError(res, ["A valid email is required"]);
  }

  req.body.email = String(req.body.email).trim().toLowerCase();
  return next();
};

const validatePasswordReset = (req, res, next) => {
  const { password } = req.body;

  if (!isPresent(password) || String(password).length < 6) {
    return sendValidationError(res, ["Password must be at least 6 characters"]);
  }

  return next();
};

const validateRoom = (req, res, next) => {
  const { name, price, description, image, available } = req.body;
  const errors = [];
  const normalizedPrice = Number(price);

  if (!isPresent(name)) errors.push("Room name is required");
  if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
    errors.push("Room price must be a positive number");
  }
  if (!isPresent(description)) errors.push("Room description is required");
  if (available !== undefined && typeof available !== "boolean") {
    errors.push("Available must be true or false");
  }

  if (errors.length) return sendValidationError(res, errors);

  req.body.name = String(name).trim();
  req.body.price = normalizedPrice;
  req.body.description = String(description).trim();
  req.body.image = isPresent(image) ? String(image).trim() : "";
  req.body.available = available === undefined ? true : available;
  return next();
};

const validateBooking = (req, res, next) => {
  const { room, name, email, checkIn, checkOut, guests } = req.body;
  const errors = [];

  if (!mongoose.Types.ObjectId.isValid(room)) errors.push("A valid room id is required");
  if (!isPresent(name)) errors.push("Guest name is required");
  if (!isValidEmail(email)) errors.push("A valid email is required");

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    errors.push("Valid booking dates are required");
  } else if (checkOutDate <= checkInDate) {
    errors.push("Check-out must be after check-in");
  }

  const normalizedGuests = Number(guests);
  if (!Number.isInteger(normalizedGuests) || normalizedGuests < 1) {
    errors.push("Guests must be a positive integer");
  }

  if (errors.length) return sendValidationError(res, errors);

  req.body.room = room;
  req.body.name = String(name).trim();
  req.body.email = String(email).trim().toLowerCase();
  req.body.checkIn = checkInDate;
  req.body.checkOut = checkOutDate;
  req.body.guests = normalizedGuests;
  return next();
};

const validateObjectIdParam = (paramName) => (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params[paramName])) {
    return sendValidationError(res, [`Invalid ${paramName}`]);
  }

  return next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validatePasswordResetRequest,
  validatePasswordReset,
  validateRoom,
  validateBooking,
  validateObjectIdParam,
};
