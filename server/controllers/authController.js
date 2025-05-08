const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/config");
const { sendWelcomeEmail } = require("../services/emailService");


// Helper function to generate token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    config.JWT_SECRET,
    { expiresIn: "24h" } // Token expires in 24 hours
  );
};

// @desc    Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, mobileNumber, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create new user with role (default to 'user' if not specified)
    const user = new User({ 
      name, 
      email, 
      mobileNumber, 
      password,
      role: role || 'user'  // Add role field
    });
    await user.save();

    // Generate token using JWT_SECRET from .env
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET, // Directly using from .env
      { expiresIn: "24h" }
    );

    // Return response without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Create admin user (development only)
// @route   POST /api/auth/create-admin
// @access  Public (should be restricted in production)
exports.createAdmin = async (req, res) => {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: "This endpoint is disabled in production mode"
      });
    }

    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create admin user
    const adminUser = new User({
      name,
      email,
      password,
      role: 'admin'
    });
    
    await adminUser.save();

    res.status(201).json({
      success: true,
      message: "Admin user created successfully",
      email: adminUser.email
    });
  } catch (error) {
    console.error("Admin Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create admin user",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Authenticate user
// @route   POST /api/auth/login
// @access  Public
// In authController.js
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'admin@example.com';
    const ADMIN_PASSWORD = 'adminpass';

    // Check if credentials match hardcoded admin
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create admin user object
      const adminUser = {
        _id: '645f1c5b3c8c1234567890ab', // Fixed ID for admin
        name: 'Admin User',
        email: ADMIN_EMAIL,
        role: 'admin'
      };

      // Create token
      const token = jwt.sign(
        { id: adminUser._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" } // Extend to 7 days instead of 24h
      );

      // Return admin data
      return res.json({
        success: true,
        token,
        user: adminUser,
      });
    }

    // Regular database authentication if not hardcoded admin
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Extend to 7 days instead of 24h
    );

    // Return user data (without password)
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;

    res.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get profile",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, mobileNumber } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = name || user.name;
    user.mobileNumber = mobileNumber || user.mobileNumber;

    await user.save();

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};
