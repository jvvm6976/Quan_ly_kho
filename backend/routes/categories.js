const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', categoryController.getAllCategories);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', categoryController.getCategoryById);

// @route   POST /api/categories
// @desc    Create a new category
// @access  Admin
router.post('/', adminAuth, categoryController.createCategory);

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Admin
router.put('/:id', adminAuth, categoryController.updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Admin
router.delete('/:id', adminAuth, categoryController.deleteCategory);

module.exports = router;
