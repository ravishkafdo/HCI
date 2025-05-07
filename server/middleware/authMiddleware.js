const jwt = require("jsonwebtoken");
const User = require('../models/User');

exports.authenticate = (req, res, next) => {
  // Get token from header or cookie
  const token = req.header("x-auth-token") || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Get token from cookie
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check if this is the hardcoded admin account
      if (decoded.id === '645f1c5b3c8c1234567890ab') {
        // Set admin user manually
        req.user = {
          _id: '645f1c5b3c8c1234567890ab',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        };
        return next();
      }
      
      // Get user from database for regular users
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Attach user to request object
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
      error: error.message
    });
  }
};


// Middleware to restrict routes to admins only
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Admin only'
    });
  }
};

// Middleware to restrict routes to designers only
exports.designerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'designer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied: Designer only'
    });
  }
};
