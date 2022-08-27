const jwtr = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  let decoded;

  if (!authHeader) {
    throw Error("No Authorization Header Attached");
  }

  const token = authHeader.split(" ")[1];

  try {
    decoded = jwtr.verify(token, "amiRakib");
  } catch {
    throw Error("Session Expired");
  }

  req.userId = decoded.userId;
  next();
};
