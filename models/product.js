const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: String,
  image: String,
  price: {
    type: Number,
    required: true,
  },
  category: { type: String, required: true },
  description: {
    type: String,
    required: true,
  },
  company: { type: String, required: true },
});

module.exports = mongoose.model("Product", productSchema);
