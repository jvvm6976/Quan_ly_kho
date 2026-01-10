const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users
// @access  Admin
router.get('/', adminAuth, userController.getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Admin or Own User
router.get('/:id', auth, (req, res, next) => {
  // Allow users to access their own data
  if (req.user.id.toString() === req.params.id || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized to access this user' });
  }
}, userController.getUserById);

// @route   POST /api/users
// @desc    Create a new user
// @access  Admin
router.post('/', adminAuth, userController.createUser);

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Admin or Own User
router.put('/:id', auth, (req, res, next) => {
  // Allow users to update their own data
  if (req.user.id.toString() === req.params.id || req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized to update this user' });
  }
}, userController.updateUser);

// @route   PUT /api/users/:id/password
// @desc    Update user password
// @access  Admin or Own User
router.put('/:id/password', auth, userController.updatePassword);

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/:id', adminAuth, userController.deleteUser);

module.exports = router;
