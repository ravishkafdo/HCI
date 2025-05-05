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
  productController.createProduct
);

router.put(
  '/:id',
  protect,
  adminOnly,
  uploadProduct,
  handleUploadError,
  processUploads,
  productController.updateProduct
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  productController.deleteProduct
);

module.exports = router; 