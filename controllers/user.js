const User = require("../models/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

exports.postSignup = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.errors.length != 0) {
    throw Error(errors.errors[0].msg);
  }

  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;

  bcrypt
    .hash(password, 12)
    .then((hashedpassword) => {
      return User.create({ name, email, password: hashedpassword });
    })
    .then((result) => {
      res.json({ result });
    })
    .catch((err) => next(err));
};

exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.errors.length != 0) {
    throw Error(errors.errors[0].msg);
  }

  const email = req.body.email;
  const password = req.body.password;
  let userInfo;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        throw Error("Invalid Email");
      } else {
        userInfo = {
          userId: user._id,
          email: user.email,
          name: user.name,
          logoutTime: +new Date() + 3600000,
        };
        return bcrypt
          .compare(password, user.password)
          .then((matched) => {
            if (matched) {
              const token = jwt.sign(userInfo, "amiRakib", { expiresIn: "1h" });
              return res.json({ token, userInfo });
            } else {
              throw Error("Invalid Password");
            }
          })
          .catch((err) => next(err));
      }
    })
    .catch((err) => next(err));
};

exports.postForgotPassword = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.errors.length != 0) {
    throw Error(errors.errors[0].msg);
  }

  crypto.randomBytes(12, (err, buffer) => {
    if (err) {
      throw Error(err);
    }
    const token = buffer.toString("hex");

    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          throw Error("Email does not exist");
        } else {
          user.token = token;
          user.expiaryDate = Date.now() + 3600000;
          return user.save();
        }
      })
      .then(() => {
        res.json({
          link: "/reset-password/" + token,
        });
      })
      .catch((err) => next(err));
  });
};

exports.postResetPassword = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.errors.length != 0) {
    throw Error(errors.errors[0].msg);
  }

  const token = req.params.token;
  const password = req.body.password;

  User.findOne({ token, expiaryDate: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        throw Error("Link not valid anymore");
      } else {
        return bcrypt.hash(password, 12).then((hashedpassword) => {
          user.password = hashedpassword;
          user.token = undefined;
          user.expiaryDate = undefined;
          user.save().then((result) => res.json({ result }));
        });
      }
    })
    .catch((err) => next(err));
};
