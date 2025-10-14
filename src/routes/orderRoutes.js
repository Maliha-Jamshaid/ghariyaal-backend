const express = require('express');
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { orderValidation, orderStatusValidation, idParamValidation } = require('../middleware/validationMiddleware');

const router = express.Router();

// Protect all order routes
router.use(protect);

// Customer routes
router.post('/', orderValidation, createOrder);
router.get('/me', getMyOrders);

// Get single order (with authorization in controller)
router.get('/:id', idParamValidation, getOrder);

// Admin only routes
router.get('/', restrictTo('admin'), getAllOrders);
router.patch('/:id/status', restrictTo('admin'), idParamValidation, orderStatusValidation, updateOrderStatus);

module.exports = router;