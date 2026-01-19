const {
  Product,
  InventoryTransaction,
  InventoryCheck,
  InventoryCheckItem,
  User
} = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Get inventory summary
exports.getInventorySummary = async (req, res) => {
  try {
    // Tổng số sản phẩm
    const totalProducts = await Product.count();

    // Sản phẩm còn hàng (số lượng > 0)
    const inStockProducts = await Product.count({
      where: {
        quantity: {
          [Op.gt]: 0
        }
      }
    });

    // Sản phẩm hết hàng (số lượng = 0)
    const outOfStockProducts = await Product.count({
      where: {
        quantity: 0
      }
    });

    // Sản phẩm gần hết (số lượng <= minQuantity và > 0)
    // Sử dụng raw query để tránh lỗi
    const [lowStockResult] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM Products
      WHERE quantity > 0 AND quantity <= minQuantity
    `);
    const lowStockProducts = lowStockResult[0].count;

    // Tổng giá trị kho = tổng (price * quantity)
    // Sử dụng raw query để tránh lỗi
    const [inventoryValueResult] = await sequelize.query(`
      SELECT SUM(price * quantity) as total
      FROM Products
    `);
    const inventoryValue = inventoryValueResult[0].total;

    // Trả về JSON thống kê
    res.json({
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      lowStockProducts,
      inventoryValue: inventoryValue || 0
    });

  } catch (error) {
    console.error('Error in getInventorySummary:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    // Sử dụng raw query để tránh lỗi
    const [products] = await sequelize.query(`
      SELECT * FROM Products
      WHERE quantity > 0 AND quantity <= minQuantity
      ORDER BY (quantity / minQuantity) ASC
    `);

    res.json(products);
  } catch (error) {
    console.error('Error in getLowStockProducts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get out of stock products
exports.getOutOfStockProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { quantity: 0 }
    });

    res.json(products);
  } catch (error) {
    console.error('Error in getOutOfStockProducts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create inventory transaction (stock in/out)
exports.createTransaction = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      productId,
      type,
      quantity,
      reason,
      reference,
      notes
    } = req.body;

    // Validate transaction type
    if (!['in', 'out', 'adjustment'].includes(type)) {
      return res.status(400).json({ message: 'Invalid transaction type' });
    }

    // Find product
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate new quantity
    let newQuantity;
    if (type === 'in') {
      newQuantity = product.quantity + parseInt(quantity);
    } else if (type === 'out') {
      // Check if enough stock
      if (product.quantity < parseInt(quantity)) {
        await t.rollback();
        return res.status(400).json({ message: 'Not enough stock' });
      }
      newQuantity = product.quantity - parseInt(quantity);
    } else if (type === 'adjustment') {
      newQuantity = parseInt(quantity);
    }

    // Create transaction
    const transaction = await InventoryTransaction.create({
      productId,
      type,
      quantity: parseInt(quantity),
      previousQuantity: product.quantity,
      newQuantity,
      reason,
      reference,
      notes,
      createdBy: req.user.id,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    }, { transaction: t });

    // If admin or transaction is approved, update product quantity
    if (req.user.role === 'admin' || transaction.status === 'approved') {
      await product.update({ quantity: newQuantity }, { transaction: t });

      // If admin, set approvedBy
      if (req.user.role === 'admin') {
        await transaction.update({ approvedBy: req.user.id }, { transaction: t });
      }
    }

    await t.commit();

    res.status(201).json({
      message: 'Inventory transaction created successfully',
      transaction,
      status: transaction.status
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in createTransaction:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const {
      type,
      status,
      startDate,
      endDate,
      productId,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter conditions
    const whereConditions = {};

    if (type) {
      whereConditions.type = type;
    }

    if (status) {
      whereConditions.status = status;
    }

    if (productId) {
      whereConditions.productId = productId;
    }

    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereConditions.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Include for product and user relationships
    const includeOptions = [
      { 
        model: Product, 
        as: 'product',
        // No WHERE clause here, we'll use a separate query if needed
      },
      { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
      { model: User, as: 'approver', attributes: ['id', 'username', 'fullName'] }
    ];

    // Search handling
    let transactionWhereOptions = { ...whereConditions };
    
    if (search) {
      // First try to find products that match the search term
      const matchingProducts = await Product.findAll({
        where: {
          name: {
            [Op.like]: `%${search}%`
          }
        },
        attributes: ['id']
      });
      
      const matchingProductIds = matchingProducts.map(p => p.id);
      
      // Now build the query with both product IDs and transaction fields
      transactionWhereOptions = {
        ...whereConditions,
        [Op.or]: [
          // Search in transaction reason
          { reason: { [Op.like]: `%${search}%` } },
          // Search in transaction reference
          { reference: { [Op.like]: `%${search}%` } },
          // Search by product ID if we found matching products
          ...(matchingProductIds.length > 0 ? [{ productId: { [Op.in]: matchingProductIds } }] : []),
        ]
      };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Get transactions
    const { count, rows: transactions } = await InventoryTransaction.findAndCountAll({
      where: transactionWhereOptions,
      include: includeOptions,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      distinct: true // Important for correct count with includes
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    res.json({
      transactions,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllTransactions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Approve or reject transaction
exports.updateTransactionStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { status } = req.body;
    const transactionId = req.params.id;

    // Validate status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find transaction
    const transaction = await InventoryTransaction.findByPk(transactionId, { transaction: t });
    if (!transaction) {
      await t.rollback();
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if transaction is already processed
    if (transaction.status !== 'pending') {
      await t.rollback();
      return res.status(400).json({ message: 'Transaction already processed' });
    }

    // Load product with current quantity
    const product = await Product.findByPk(transaction.productId, { transaction: t });

    if (!product) {
      await t.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate delta based on stored transaction quantities to reapply on current stock
    const delta = Number(transaction.newQuantity) - Number(transaction.previousQuantity);
    const currentQuantity = Number(product.quantity);
    const appliedNewQuantity = currentQuantity + delta;

    if (status === 'approved' && appliedNewQuantity < 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Not enough stock to approve this transaction with current inventory' });
    }

    // Update transaction status (and sync quantities for traceability)
    await transaction.update({
      status,
      approvedBy: req.user.id,
      previousQuantity: currentQuantity,
      newQuantity: status === 'approved' ? appliedNewQuantity : transaction.newQuantity
    }, { transaction: t });

    // If approved, update product quantity using recalculated value
    if (status === 'approved') {
      await product.update({ quantity: appliedNewQuantity }, { transaction: t });
    }

    await t.commit();

    res.json({
      message: `Transaction ${status}`,
      transaction
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in updateTransactionStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
