const express = require('express');
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all order routes
router.use(protect);

// Customer routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);

// Admin routes
router.get('/admin/orders', restrictTo('admin'), getAllOrders);

// Shared routes (with authorization in controller)
router.get('/:id', getOrder);

// Admin only routes
router.patch('/admin/orders/:id', restrictTo('admin'), updateOrderStatus);

module.exports = router;