const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const inventoryCheckController = require('../controllers/inventoryCheckController');
const { auth, adminAuth, staffAuth } = require('../middleware/auth');

// Inventory Summary Routes
// @route   GET /api/inventory/summary
// @desc    Get inventory summary
// @access  Staff
router.get('/summary', staffAuth, inventoryController.getInventorySummary);

// @route   GET /api/inventory/low-stock
// @desc    Get low stock products
// @access  Staff
router.get('/low-stock', staffAuth, inventoryController.getLowStockProducts);

// @route   GET /api/inventory/out-of-stock
// @desc    Get out of stock products
// @access  Staff
router.get('/out-of-stock', staffAuth, inventoryController.getOutOfStockProducts);

// Inventory Transaction Routes
// @route   POST /api/inventory/transactions
// @desc    Create inventory transaction
// @access  Staff
router.post('/transactions', staffAuth, inventoryController.createTransaction);

// @route   GET /api/inventory/transactions
// @desc    Get all transactions
// @access  Staff
router.get('/transactions', staffAuth, inventoryController.getAllTransactions);

// @route   PUT /api/inventory/transactions/:id
// @desc    Approve or reject transaction
// @access  Admin
router.put('/transactions/:id', adminAuth, inventoryController.updateTransactionStatus);

// Inventory Check Routes
// @route   POST /api/inventory/checks
// @desc    Create inventory check
// @access  Admin
router.post('/checks', adminAuth, inventoryCheckController.createInventoryCheck);

// @route   GET /api/inventory/checks
// @desc    Get all inventory checks
// @access  Staff
router.get('/checks', staffAuth, inventoryCheckController.getAllInventoryChecks);

// @route   GET /api/inventory/checks/:id
// @desc    Get inventory check by ID
// @access  Staff
router.get('/checks/:id', staffAuth, inventoryCheckController.getInventoryCheckById);

// @route   PUT /api/inventory/checks/:id
// @desc    Update inventory check status
// @access  Admin
router.put('/checks/:id', adminAuth, inventoryCheckController.updateInventoryCheckStatus);

// @route   PUT /api/inventory/checks/:id/items/:itemId
// @desc    Update inventory check item
// @access  Staff
router.put('/checks/:id/items/:itemId', staffAuth, inventoryCheckController.updateInventoryCheckItem);

// @route   POST /api/inventory/checks/:id/apply
// @desc    Apply inventory check adjustments
// @access  Admin
router.post('/checks/:id/apply', adminAuth, inventoryCheckController.applyInventoryCheckAdjustments);

module.exports = router;
