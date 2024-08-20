const mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  profilePicture: {
    type: String,
    required: true,
  },
  uuid: {
    type: String,
    required: true,
  },
});

userSchema.plugin(uniqueValidator, {
  message: "Error, expected {PATH} to be unique",
});

module.exports = mongoose.model("User", userSchema);
