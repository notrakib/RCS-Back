const express = require("express");

const route = express.Router();

const cartController = require("../controllers/cart");
const isAuth = require("../middleware/auth");

route.post("/add-cart", isAuth, cartController.postCart);
route.get("/add-cart", cartController.getAddCart);
route.get("/all-cart", isAuth, cartController.getCart);

module.exports = route;
