const User = require('../models/userModel');
const { AppError } = require('../utils/errorHandler');
const ApiResponse = require('../utils/apiResponse');

// Get all users (Admin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '', role = '' } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    // Get total count
    const total = await User.countDocuments(query);

    // Get users
    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    return ApiResponse.success(res, 200, {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    }, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get user by ID (Admin only)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return ApiResponse.success(res, 200, { user }, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!role || !['customer', 'admin'].includes(role)) {
      return next(new AppError('Invalid role. Must be either customer or admin', 400));
    }

    // Prevent admin from changing their own role
    if (req.params.id === req.user._id.toString()) {
      return next(new AppError('You cannot change your own role', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return ApiResponse.success(res, 200, { user }, `User role updated to ${role} successfully`);
  } catch (error) {
    next(error);
  }
};

// Create admin user (Admin only)
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
    });

    // Remove password from output
    user.password = undefined;

    return ApiResponse.created(res, { user }, 'Admin user created successfully');
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return next(new AppError('You cannot delete your own account', 400));
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    return ApiResponse.success(res, 200, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};
