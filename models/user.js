const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: String,
  email: String,
  password: String,
  token: String,
  expiaryDate: Date,
});

module.exports = mongoose.model("User", userSchema);
