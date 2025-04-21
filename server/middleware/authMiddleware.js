const jwt = require("jsonwebtoken");
const config = require("../config/config");

exports.authenticate = (req, res, next) => {
  // Get token from header or cookie
  const token = req.header("x-auth-token") || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};
