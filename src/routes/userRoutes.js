const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  updateUserRole, 
  createAdmin,
  deleteUser 
} = require('../controllers/userController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { idParamValidation, paginationValidation } = require('../middleware/validationMiddleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: errors.array()[0].msg 
    });
  }
  next();
};

// All routes are admin-only
router.use(protect, restrictTo('admin'));

// Get all users
router.get('/', paginationValidation, getAllUsers);

// Create admin user
router.post('/create-admin', 
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  validate,
  createAdmin
);

// Get user by ID
router.get('/:id', idParamValidation, getUserById);

// Update user role
router.put('/:id/role', 
  ...idParamValidation.slice(0, -1), // Remove the validate middleware
  body('role').isIn(['customer', 'admin']).withMessage('Role must be customer or admin'),
  validate,
  updateUserRole
);

// Delete user
router.delete('/:id', idParamValidation, deleteUser);

module.exports = router;
