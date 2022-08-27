const express = require("express");

const route = express.Router();

const orderController = require("../controllers/order");
const isAuth = require("../middleware/auth");

route.get("/order", isAuth, orderController.getOrder);
route.post("/order", isAuth, orderController.postOrder);
route.get("/order/:orderId", isAuth, orderController.getInvoice);

module.exports = route;
