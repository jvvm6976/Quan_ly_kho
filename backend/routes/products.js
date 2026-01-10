const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, adminAuth, staffAuth } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST /api/products
// @desc    Create a new product
// @access  Admin
router.post('/', adminAuth, productController.upload, productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Admin
router.put('/:id', adminAuth, productController.upload, productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Admin
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;
