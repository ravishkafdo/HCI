const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { 
      category, 
      sort = 'createdAt', 
      order = 'desc', 
      page = 1, 
      limit = 10,
      search
    } = req.query;
    
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    const total = await Product.countDocuments(filter);
    
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;
    
    const products = await Product.find(filter)
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    console.log("Creating product - request body:", JSON.stringify(req.body, null, 2));
    console.log("User in request:", req.user);
    
    const {
      title,
      description,
      price,
      category,
      thumbnail,
      modelUrl,
      dimensions
    } = req.body;
    
    console.log("Dimensions:", dimensions);
    
    if (!title || !description || !price || !category || !thumbnail || !modelUrl || !dimensions) {
      console.log("Missing required fields:", {
        title: !!title,
        description: !!description,
        price: !!price,
        category: !!category,
        thumbnail: !!thumbnail,
        modelUrl: !!modelUrl,
        dimensions: !!dimensions
      });
      
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    console.log("Creating product with validated data");
    const product = await Product.create(req.body);
    console.log("Product created successfully:", product._id);
    
    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    
    let product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    product = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await Product.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
}; 