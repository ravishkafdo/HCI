const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { uploadProduct, handleUploadError } = require('../middleware/fileUpload');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Process uploads and file paths before handling the request
const processUploads = (req, res, next) => {
  if (!req.files) return next();
  
  // Process thumbnail
  if (req.files.thumbnail && req.files.thumbnail[0]) {
    req.body.thumbnail = `/uploads/images/${req.files.thumbnail[0].filename}`;
  }
  
  // Process additional images
  if (req.files.images) {
    req.body.images = req.files.images.map(
      file => `/uploads/images/${file.filename}`
    );
  }
  
  // Process 3D model
  if (req.files.model && req.files.model[0]) {
    req.body.modelUrl = `/uploads/models/${req.files.model[0].filename}`;
  }
  
  next();
};

// Parse JSON fields
const parseJsonFields = (req, res, next) => {
  // Parse dimensions JSON
  if (req.body.dimensions && typeof req.body.dimensions === 'string') {
    try {
      req.body.dimensions = JSON.parse(req.body.dimensions);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dimensions format'
      });
    }
  }
  
  // Parse materials and colors JSON
  if (req.body.materials && typeof req.body.materials === 'string') {
    try {
      req.body.materials = JSON.parse(req.body.materials);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid materials format'
      });
    }
  }
  
  if (req.body.colors && typeof req.body.colors === 'string') {
    try {
      req.body.colors = JSON.parse(req.body.colors);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid colors format'
      });
    }
  }
  
  next();
};

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);

// Protected admin routes
router.post(
  '/',
  protect,
  adminOnly,
  uploadProduct,
  handleUploadError,
  processUploads,
  parseJsonFields,
  productController.createProduct
);

router.put(
  '/:id',
  protect,
  adminOnly,
  uploadProduct,
  handleUploadError,
  processUploads,
  parseJsonFields,
  productController.updateProduct
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  productController.deleteProduct
);

module.exports = router; 