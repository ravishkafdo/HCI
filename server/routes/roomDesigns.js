const express = require('express');
const router = express.Router();
const RoomDesign = require('../models/RoomDesign');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Middleware to verify authentication token
const authenticate = async (req, res, next) => {
  try {
    console.log('Auth headers:', req.headers.authorization);
    console.log('Cookies:', req.cookies);
    
    let token;
    
    // Check Authorization header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Found token in Authorization header');
    } 
    // Check cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Found token in cookies');
    }
    
    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required - no token provided' 
      });
    }
    
    console.log('Token found, attempting to verify');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully, user ID:', decoded.id);
      req.userId = decoded.id;
      next();
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false, 
          message: 'Your session has expired, please login again' 
        });
      }
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - authentication failed' 
      });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication failed - server error' 
    });
  }
};

// Create a new room design
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, items, wallColors, floorColor, dimensions } = req.body;
    
    const roomDesign = new RoomDesign({
      userId: req.userId,
      name,
      items,
      wallColors,
      floorColor,
      dimensions
    });
    
    await roomDesign.save();
    
    return res.status(201).json({
      success: true,
      data: roomDesign
    });
  } catch (error) {
    console.error('Error creating room design:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create room design',
      error: error.message
    });
  }
});

// Get all room designs for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const roomDesigns = await RoomDesign.find({ userId: req.userId }).sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: roomDesigns.length,
      data: roomDesigns
    });
  } catch (error) {
    console.error('Error fetching room designs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch room designs',
      error: error.message
    });
  }
});

// Get a specific room design
router.get('/:id', authenticate, async (req, res) => {
  try {
    const roomDesign = await RoomDesign.findById(req.params.id);
    
    if (!roomDesign) {
      return res.status(404).json({
        success: false,
        message: 'Room design not found'
      });
    }
    
    // Ensure the user owns this design
    if (roomDesign.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this room design'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: roomDesign
    });
  } catch (error) {
    console.error('Error fetching room design:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch room design',
      error: error.message
    });
  }
});

// Update a room design
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, items, wallColors, floorColor, dimensions } = req.body;
    
    let roomDesign = await RoomDesign.findById(req.params.id);
    
    if (!roomDesign) {
      return res.status(404).json({
        success: false,
        message: 'Room design not found'
      });
    }
    
    // Ensure the user owns this design
    if (roomDesign.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this room design'
      });
    }
    
    roomDesign = await RoomDesign.findByIdAndUpdate(
      req.params.id,
      { name, items, wallColors, floorColor, dimensions },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      data: roomDesign
    });
  } catch (error) {
    console.error('Error updating room design:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update room design',
      error: error.message
    });
  }
});

// Delete a room design
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const roomDesign = await RoomDesign.findById(req.params.id);
    
    if (!roomDesign) {
      return res.status(404).json({
        success: false,
        message: 'Room design not found'
      });
    }
    
    // Ensure the user owns this design
    if (roomDesign.userId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this room design'
      });
    }
    
    await roomDesign.remove();
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting room design:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete room design',
      error: error.message
    });
  }
});

module.exports = router; 