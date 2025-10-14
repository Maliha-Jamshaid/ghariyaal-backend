const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');
const { cartItemValidation, idParamValidation } = require('../middleware/validationMiddleware');

const router = express.Router();

// Protect all cart routes
router.use(protect);

router
  .route('/')
  .get(getCart)
  .post(cartItemValidation, addToCart)
  .put(cartItemValidation, updateCartItem)
  .delete(clearCart);

router.delete('/items/:productId', idParamValidation, removeFromCart);

module.exports = router;