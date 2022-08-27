const express = require("express");

const route = express.Router();

const productController = require("../controllers/product");
const isAuth = require("../middleware/auth");

route.post("/add-product", isAuth, productController.postAddProduct);

route.get("/find-product/:prodId", isAuth, productController.getEditProduct);
route.post("/edit-product/:prodId", isAuth, productController.postEditProduct);

module.exports = route;
