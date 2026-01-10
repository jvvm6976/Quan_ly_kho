const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, adminAuth, staffAuth } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post('/', auth, orderController.createOrder);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Staff (all orders) or Customer (own orders)
router.get('/', auth, orderController.getAllOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Staff or Order Owner
router.get('/:id', auth, orderController.getOrderById);

// @route   PUT /api/orders/:id
// @desc    Update order status
// @access  Staff or Order Owner (for cancellation only)
router.put('/:id', auth, orderController.updateOrderStatus);

module.exports = router;
