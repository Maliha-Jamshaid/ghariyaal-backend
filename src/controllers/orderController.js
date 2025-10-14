const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const Product = require('../models/productModel');
const { AppError } = require('../utils/errorHandler');
const ApiResponse = require('../utils/apiResponse');

// Create new order
exports.createOrder = async (req, res, next) => {
  try {
    const { address } = req.body;

    // Validate address
    if (!address || !address.street || !address.city || !address.state || !address.zipCode || !address.country) {
      return next(new AppError('Please provide complete delivery address', 400));
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return next(new AppError('Your cart is empty', 400));
    }

    // Verify stock availability and prepare order items
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.product;
      
      // Check stock availability
      if (product.stock < item.quantity) {
        return next(new AppError(`Not enough stock for ${product.name}`, 400));
      }

      // Add item to order with current price
      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      // Update product stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity }
      });
    }

    // Calculate total price
    const totalPrice = orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalPrice,
      address,
      status: 'Pending',
    });

    // Clear user's cart
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    // Populate order details
    await order.populate('items.product', 'name imageUrl');

    return ApiResponse.created(res, order, 'Order created successfully');
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl')
      .sort('-createdAt');

    const totalAmount = orders.reduce((total, order) => total + order.totalPrice, 0);

    return ApiResponse.success(res, 200, orders, 'Orders retrieved successfully', {
      count: orders.length,
      totalAmount,
    });
  } catch (error) {
    next(error);
  }
};

// Get user orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name imageUrl price')
      .sort('-createdAt');

    return ApiResponse.success(res, 200, orders, 'Orders retrieved successfully', {
      count: orders.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get single order
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name imageUrl price');

    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // Check if user is admin or order owner
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return next(new AppError('Not authorized to view this order', 403));
    }

    return ApiResponse.success(res, 200, order, 'Order retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Pending', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) {
      return next(new AppError('Invalid order status', 400));
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(new AppError('Order not found', 404));
    }

    // If order is being cancelled, restore product stock
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    order.status = status;
    await order.save();

    return ApiResponse.success(res, 200, order, 'Order status updated successfully');
  } catch (error) {
    next(error);
  }
};