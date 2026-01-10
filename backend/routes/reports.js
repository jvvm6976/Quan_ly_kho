const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { adminAuth, staffAuth } = require('../middleware/auth');

// @route   GET /api/reports/sales
// @desc    Get sales report
// @access  Admin
router.get('/sales', adminAuth, reportController.getSalesReport);

// @route   GET /api/reports/top-products
// @desc    Get top selling products
// @access  Staff
router.get('/top-products', staffAuth, reportController.getTopSellingProducts);

// @route   GET /api/reports/inventory-value
// @desc    Get inventory value report
// @access  Staff
router.get('/inventory-value', staffAuth, reportController.getInventoryValueReport);

// @route   GET /api/reports/inventory-movement
// @desc    Get inventory movement report
// @access  Staff
router.get('/inventory-movement', staffAuth, reportController.getInventoryMovementReport);

// @route   GET /api/reports/customers
// @desc    Get customer report
// @access  Admin
router.get('/customers', adminAuth, reportController.getCustomerReport);

module.exports = router;
