const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { AppError } = require('../utils/errorHandler');
const ApiResponse = require('../utils/apiResponse');

// Get user's cart
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price imageUrl stock');

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Calculate total price
    const total = await cart.calculateTotal();

    return ApiResponse.success(res, 200, {
      cart,
      total,
    }, 'Cart retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Add item to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.stock < quantity) {
      return next(new AppError('Not enough stock available', 400));
    }

    // Find user's cart or create new one
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity if product already in cart
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      if (product.stock < newQuantity) {
        return next(new AppError('Not enough stock available', 400));
      }
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item to cart
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl');

    const total = await cart.calculateTotal();

    return ApiResponse.success(res, 200, {
      cart,
      total,
    }, 'Item added to cart successfully');
  } catch (error) {
    next(error);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (quantity < 1) {
      return next(new AppError('Quantity must be at least 1', 400));
    }

    // Check if product has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    if (product.stock < quantity) {
      return next(new AppError('Not enough stock available', 400));
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return next(new AppError('Item not found in cart', 404));
    }

    cart.items[itemIndex].quantity = quantity;
    await cart.save();
    await cart.populate('items.product', 'name price imageUrl');

    const total = await cart.calculateTotal();

    return ApiResponse.success(res, 200, {
      cart,
      total,
    }, 'Cart item updated successfully');
  } catch (error) {
    next(error);
  }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.product', 'name price imageUrl');

    const total = await cart.calculateTotal();

    return ApiResponse.success(res, 200, {
      cart,
      total,
    }, 'Item removed from cart successfully');
  } catch (error) {
    next(error);
  }
};

// Clear cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    cart.items = [];
    await cart.save();

    return ApiResponse.success(res, 200, {
      cart,
      total: 0,
    }, 'Cart cleared successfully');
  } catch (error) {
    next(error);
  }
};