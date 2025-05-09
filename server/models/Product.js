const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be positive']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Storage']
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    thumbnail: {
      type: String,
      required: [true, 'Product thumbnail is required']
    },
    images: {
      type: [String],
      default: []
    },
    modelUrl: {
      type: String,
      required: [true, 'Product 3D model URL is required']
    },
    dimensions: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      length: { type: Number, required: true }
    },
    materials: {
      type: [String],
      default: []
    },
    colors: {
      type: [String],
      default: []
    },
    inStock: {
      type: Boolean,
      default: true
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

ProductSchema.index({ title: 'text', description: 'text', category: 'text' });

module.exports = mongoose.model('Product', ProductSchema); 