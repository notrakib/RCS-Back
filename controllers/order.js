const Cart = require("../models/cart");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

exports.getOrder = (req, res, next) => {
  Order.find({ userId: req.userId })
    .populate("userId")
    .populate("orderedItems.productId")
    .then((orders) => {
      return res.json({ orders });
    })
    .catch((err) => next(err));
};

exports.postOrder = (req, res, next) => {
  const items = [];

  Cart.find({ userId: req.userId })
    .then((product) => {
      let subTotal = 0;
      product.map((each) => {
        items.push({ productId: each.productId, quantity: each.quantity });
        subTotal = +subTotal + each.total;
      });
      return Order.create({
        userId: req.userId,
        orderedItems: items,
        subTotal,
      });
    })
    .then(() => {
      return Cart.deleteMany({ userId: req.userId });
    })
    .then((result) => res.json({ result }))
    .catch((err) => next(err));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const fileName = "Invoices-" + orderId + ".pdf";
  const invoicePath = path.join("data", "invoices", fileName);

  const pdfDoc = new PDFDocument();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", 'inline; filename="' + fileName + '"');

  pdfDoc.pipe(fs.createWriteStream(invoicePath));
  pdfDoc.pipe(res);

  pdfDoc.fontSize(26).text("Invoice", { underline: true });
  pdfDoc.text("-----------------");

  Order.findOne({ _id: orderId })
    .populate("userId")
    .populate("orderedItems.productId")
    .then((order) => {
      pdfDoc.fontSize(18).text("User Name: " + order.userId.name);
      pdfDoc.fontSize(18).text("User Email: " + order.userId.email);
      order.orderedItems.map((each) => {
        pdfDoc.fontSize(14).text("Product: " + each.productId.title);
        pdfDoc.fontSize(14).text("Quantity: " + each.quantity);
        pdfDoc.fontSize(14).text("Price: " + each.productId.price);
      });
      pdfDoc.fontSize(18).text("Sub Total: " + order.subTotal);
      pdfDoc.end();
    })
    .catch((err) => next(err));
};
