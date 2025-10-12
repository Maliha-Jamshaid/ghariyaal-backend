const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: String,
    required: [true, 'Please specify product category'],
    enum: ['Men', 'Women'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide product image URL'],
  },
  stock: {
    type: Number,
    required: [true, 'Please provide product stock quantity'],
    min: [0, 'Stock cannot be negative'],
  },
}, {
  timestamps: true,
});

// Add text index for search functionality
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;