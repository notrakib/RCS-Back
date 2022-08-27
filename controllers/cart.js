const Cart = require("../models/cart");
const Product = require("../models/product");

exports.getAddCart = (req, res, next) => {
  const where =
    req.query.filter === "" || req.query.filter === undefined
      ? null
      : { category: req.query.filter };
  const curpage = +req.query.page;
  const limit = 2;
  const lpp = 3;
  let numofProds;

  Product.find(where)
    .countDocuments()
    .then((numberofProducts) => {
      numofProds = numberofProducts;
    })
    .then(() => {
      Product.find(where)
        .skip((curpage - 1) * limit)
        .limit(limit)
        .then((products) => {
          res.json({
            products,
            hasPrev: curpage > lpp,
            hasNext:
              Math.floor((curpage - 1) / lpp) * lpp + lpp < numofProds / limit,
            numberofLoop:
              numofProds / limit - Math.floor((curpage - 1) / lpp) * lpp,
            prev: Math.floor((curpage - 1) / lpp) * lpp,
            next: Math.floor((curpage - 1) / lpp) * lpp + +(lpp + 1),
            curpage,
            lpp,
          });
        });
    })
    .catch((err) => next(err));
};

exports.postCart = (req, res, next) => {
  const productId = req.body.productId;
  const price = req.body.price;
  let quantity;

  if (req.body.edit) {
    quantity = req.body.edit;
  } else quantity = req.body.qty;

  Cart.findOne({ userId: req.userId, productId })
    .populate("productId")
    .then((cart) => {
      if (!cart) {
        return Cart.create({
          userId: req.userId,
          productId,
          quantity,
          total: price * quantity,
        });
      } else {
        return Cart.updateOne(
          { userId: req.userId, productId },
          {
            $set: {
              quantity: +quantity + cart.quantity,
              total: +cart.total + cart.productId.price * quantity,
            },
          }
        );
      }
    })
    .then(() => {
      return Cart.deleteMany({ quantity: 0 });
    })
    .then((result) => {
      res.json({ result });
    })
    .catch((err) => next(err));
};

exports.getCart = (req, res, next) => {
  Cart.find({ userId: req.userId })
    .populate("userId")
    .populate("productId")
    .then((cartItems) => {
      res.json({ cartItems });
    })
    .catch((err) => next(err));
};
