const jwt = require("jsonwebtoken");
const User = require("../models/User");

//protect profile routes
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization || req.headers.Authorization;
    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      next();
    } else {
      res.status(401).json({ message: "Not Authorized" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token Failed", error: error.message });
  }
};

//Admin Only

const adminOnly = (req, res, next) => {

  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(402).json({ message: "Admin Only can Access" });
  }
};

module.exports = { adminOnly, protect };
