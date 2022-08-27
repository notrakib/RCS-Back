const express = require("express");
const route = express.Router();
const { check, body } = require("express-validator");
const User = require("../models/user");
const userController = require("../controllers/user");

route.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email exists already");
          }
        });
      })
      .trim(),
    body("password", "Password length is between 5 to 8")
      .isLength({ min: 5 })
      .isLength({ max: 8 })
      .trim(),

    body("confirm_password")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  userController.postSignup
);

route.post(
  "/login",
  [
    check("email").isEmail().withMessage("Please enter a valid email."),
    body("password", "Invalid Password")
      .isLength({ min: 5 })
      .isLength({ max: 8 })
      .trim(),
  ],
  userController.postLogin
);

route.post(
  "/forgot-password",
  [check("email").isEmail().withMessage("Please enter a valid email.")],
  userController.postForgotPassword
);

route.post(
  "/reset-password/:token",
  [
    body("password", "Password length is between 5 to 8")
      .isLength({ min: 5 })
      .isLength({ max: 8 })
      .trim(),

    body("confirm_password")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  userController.postResetPassword
);

module.exports = route;
