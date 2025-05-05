const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files based on type
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images/');
    } else if (file.mimetype === 'application/octet-stream' || 
               file.mimetype === 'model/gltf-binary' || 
               file.mimetype === 'model/gltf+json') {
      cb(null, 'uploads/models/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const extension = path.extname(file.originalname);
    const filename = `${uuidv4()}${extension}`;
    cb(null, filename);
  }
});

// Filter files by type
const fileFilter = (req, file, cb) => {
  // Accept images, 3D models (glb, gltf)
  if (file.mimetype.startsWith('image/') || 
      file.mimetype === 'application/octet-stream' ||
      file.mimetype === 'model/gltf-binary' || 
      file.mimetype === 'model/gltf+json' ||
      path.extname(file.originalname).toLowerCase() === '.glb' ||
      path.extname(file.originalname).toLowerCase() === '.gltf') {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

// Create multer upload object
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100 MB limit
});

// Middleware for handling upload errors
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum file size is 100MB.'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  } else if (err) {
    return res.status(400).json({
      success: false, 
      message: err.message
    });
  }
  next();
};

// Export middleware for different upload types
exports.uploadProduct = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'images', maxCount: 5 },
  { name: 'model', maxCount: 1 }
]);

exports.uploadSingle = upload.single('file'); 