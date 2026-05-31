const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String,
  roomType: String,
  available: Boolean,
});

module.exports = mongoose.model("Room", roomSchema);