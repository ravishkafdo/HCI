const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/create-admin", authController.createAdmin); 

router.get("/profile", authMiddleware.authenticate, authController.getProfile);

module.exports = router;
