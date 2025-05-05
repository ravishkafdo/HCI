const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/create-admin", authController.createAdmin); // Route for creating admin (dev only)

// Protected routes
router.get("/profile", authMiddleware.authenticate, authController.getProfile);

module.exports = router;
