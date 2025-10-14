const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { productValidation, idParamValidation, paginationValidation } = require('../middleware/validationMiddleware');

const router = express.Router();

// Public routes
router.get('/', paginationValidation, getProducts);
router.get('/:id', idParamValidation, getProduct);

// Admin only routes - using proper REST structure
router.post('/', protect, restrictTo('admin'), productValidation, createProduct);
router.put('/:id', protect, restrictTo('admin'), idParamValidation, productValidation, updateProduct);
router.delete('/:id', protect, restrictTo('admin'), idParamValidation, deleteProduct);

module.exports = router;