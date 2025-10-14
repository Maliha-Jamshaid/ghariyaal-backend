const Product = require('../models/productModel');
const { AppError } = require('../utils/errorHandler');
const ApiResponse = require('../utils/apiResponse');

// Get all products with filtering and pagination
exports.getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const queryObj = {};

    // Category filtering
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    let query = Product.find(queryObj);

    // Search functionality
    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    query = query.skip(skip).limit(limit);

    // Execute query
    const products = await query;
    const total = await Product.countDocuments(queryObj);

    return ApiResponse.successWithPagination(
      res,
      products,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      'Products retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

// Get single product
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    return ApiResponse.success(res, 200, product, 'Product retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Create new product (Admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    return ApiResponse.created(res, product, 'Product created successfully');
  } catch (error) {
    next(error);
  }
};

// Update product (Admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    return ApiResponse.success(res, 200, product, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete product (Admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    return ApiResponse.success(res, 200, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};