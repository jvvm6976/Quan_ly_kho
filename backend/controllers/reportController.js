const {
  Order,
  OrderItem,
  Product,
  Category,
  User,
  InventoryTransaction
} = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Get sales report
exports.getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Ngày bắt đầu và kết thúc là bắt buộc' });
    }

    // Validate groupBy
    if (!['day', 'week', 'month'].includes(groupBy)) {
      return res.status(400).json({ message: 'Tham số groupBy không hợp lệ' });
    }

    // Define date format based on groupBy
    let dateFormat;
    if (groupBy === 'day') {
      dateFormat = '%Y-%m-%d';
    } else if (groupBy === 'week') {
      dateFormat = '%Y-%u';
    } else if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    }

    // Adjust endDate to include the full day by adding 1 day
    const adjustedEndDate = new Date(endDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    const adjustedEndDateStr = adjustedEndDate.toISOString().split('T')[0];

    console.log('Date range:', startDate, 'to', endDate, '(adjusted to', adjustedEndDateStr, ')');

    // Get sales data using raw query
    const salesData = await sequelize.query(
      `SELECT
         DATE_FORMAT(createdAt, '${dateFormat}') as date,
         COUNT(id) as orderCount,
         SUM(totalAmount) as totalSales
       FROM Orders
       WHERE createdAt >= ? AND createdAt < ?
         AND status != 'cancelled'
       GROUP BY DATE_FORMAT(createdAt, '${dateFormat}')
       ORDER BY date ASC`,
      {
        replacements: [startDate, adjustedEndDateStr],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Log sales data for debugging
    console.log('salesData:', salesData, 'Type:', typeof salesData, 'IsArray:', Array.isArray(salesData));

    // Ensure salesData is an array
    const dataArray = Array.isArray(salesData) ? salesData : [];

    // Generate dates for the entire range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dateMap = {};

    // Create a map of all dates in the range with zero values
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = {
        date: dateStr,
        orderCount: 0,
        totalSales: 0
      };
    }

    // Fill in actual data where available
    dataArray.forEach(item => {
      if (dateMap[item.date]) {
        dateMap[item.date].orderCount = parseInt(item.orderCount);
        dateMap[item.date].totalSales = parseFloat(item.totalSales) || 0;
      }
    });

    // Convert map to array and sort by date
    const completeData = Object.values(dateMap).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    // Log complete data for debugging
    console.log('Complete data:', completeData);

    res.json(completeData);
  } catch (error) {
    console.error('Lỗi trong getSalesReport:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Get top selling products
exports.getTopSellingProducts = async (req, res) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      dateFilter.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      dateFilter.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Adjust endDate to include the full day by adding 1 day
    let adjustedEndDateStr = null;
    if (endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      adjustedEndDateStr = adjustedEndDate.toISOString().split('T')[0];
    }

    // Get top selling products using raw query
    let dateFilterSql = '';
    let replacements = [];
    if (startDate && endDate) {
      dateFilterSql = `AND o.createdAt >= ? AND o.createdAt < ?`;
      replacements = [startDate, adjustedEndDateStr];
    } else if (startDate) {
      dateFilterSql = `AND o.createdAt >= ?`;
      replacements = [startDate];
    } else if (endDate) {
      dateFilterSql = `AND o.createdAt < ?`;
      replacements = [adjustedEndDateStr];
    }

    const topProducts = await sequelize.query(
      `SELECT
        oi.productId,
        p.id, p.name, p.sku, p.price, p.image,
        SUM(oi.quantity) as totalQuantity,
        SUM(oi.subtotal) as totalSales
      FROM OrderItems oi
      JOIN Products p ON oi.productId = p.id
      JOIN Orders o ON oi.orderId = o.id
      WHERE o.status != 'cancelled' ${dateFilterSql}
      GROUP BY oi.productId, p.id
      ORDER BY totalQuantity DESC
      LIMIT ?`,
      {
        replacements: [...replacements, parseInt(limit)],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json(topProducts);
  } catch (error) {
    console.error('Error in getTopSellingProducts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get inventory value report
exports.getInventoryValueReport = async (req, res) => {
  try {
    // Get inventory value by category using raw query
    const [inventoryByCategory] = await sequelize.query(`
      SELECT
        p.categoryId,
        c.id as 'category.id',
        c.name as 'category.name',
        COUNT(p.id) as productCount,
        SUM(p.quantity) as totalQuantity,
        SUM(p.price * p.quantity) as totalValue
      FROM Products p
      JOIN Categories c ON p.categoryId = c.id
      WHERE p.isActive = true
      GROUP BY p.categoryId, c.id
      ORDER BY totalValue DESC
    `);

    // Get total inventory value using raw query
    const [totalValueResult] = await sequelize.query(`
      SELECT SUM(price * quantity) as total
      FROM Products
      WHERE isActive = true
    `);
    const totalValue = totalValueResult[0].total;

    res.json({
      totalValue: totalValue || 0,
      inventoryByCategory
    });
  } catch (error) {
    console.error('Error in getInventoryValueReport:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get inventory movement report
exports.getInventoryMovementReport = async (req, res) => {
  try {
    const { startDate, endDate, productId } = req.query;

    // Build filter conditions
    const whereConditions = {};

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

    // Adjust endDate to include the full day by adding 1 day
    let adjustedEndDateStr = null;
    if (endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      adjustedEndDateStr = adjustedEndDate.toISOString().split('T')[0];
    }

    // Get inventory transactions using raw query
    let transactionWhereClauseSql = "WHERE it.status = 'approved'";
    let transactionReplacements = [];

    if (productId) {
      transactionWhereClauseSql += ` AND it.productId = ?`;
      transactionReplacements.push(productId);
    }

    if (startDate && endDate) {
      transactionWhereClauseSql += ` AND it.createdAt >= ? AND it.createdAt < ?`;
      transactionReplacements.push(startDate, adjustedEndDateStr);
    } else if (startDate) {
      transactionWhereClauseSql += ` AND it.createdAt >= ?`;
      transactionReplacements.push(startDate);
    } else if (endDate) {
      transactionWhereClauseSql += ` AND it.createdAt < ?`;
      transactionReplacements.push(adjustedEndDateStr);
    }

    const transactions = await sequelize.query(
      `SELECT
        it.*,
        p.id as 'product.id',
        p.name as 'product.name',
        p.sku as 'product.sku',
        p.price as 'product.price',
        p.quantity as 'product.quantity',
        u.id as 'creator.id',
        u.username as 'creator.username',
        u.fullName as 'creator.fullName'
      FROM InventoryTransactions it
      JOIN Products p ON it.productId = p.id
      JOIN Users u ON it.createdBy = u.id
      ${transactionWhereClauseSql}
      ORDER BY it.createdAt ASC`,
      {
        replacements: transactionReplacements,
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Get summary by product using raw query
    let whereClauseSql = "WHERE it.status = 'approved'";
    let summaryReplacements = [];

    if (productId) {
      whereClauseSql += ` AND it.productId = ?`;
      summaryReplacements.push(productId);
    }

    if (startDate && endDate) {
      whereClauseSql += ` AND it.createdAt >= ? AND it.createdAt < ?`;
      summaryReplacements.push(startDate, adjustedEndDateStr);
    } else if (startDate) {
      whereClauseSql += ` AND it.createdAt >= ?`;
      summaryReplacements.push(startDate);
    } else if (endDate) {
      whereClauseSql += ` AND it.createdAt < ?`;
      summaryReplacements.push(adjustedEndDateStr);
    }

    const summary = await sequelize.query(
      `SELECT
        it.productId,
        it.type,
        p.id as 'product.id',
        p.name as 'product.name',
        p.sku as 'product.sku',
        SUM(it.quantity) as totalQuantity
      FROM InventoryTransactions it
      JOIN Products p ON it.productId = p.id
      ${whereClauseSql}
      GROUP BY it.productId, it.type, p.id
      ORDER BY it.productId ASC, it.type ASC`,
      {
        replacements: summaryReplacements,
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.json({
      transactions,
      summary
    });
  } catch (error) {
    console.error('Error in getInventoryMovementReport:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get customer report
exports.getCustomerReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      dateFilter.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      dateFilter.createdAt = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Adjust endDate to include the full day by adding 1 day
    let adjustedEndDateStr = null;
    if (endDate) {
      const adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
      adjustedEndDateStr = adjustedEndDate.toISOString().split('T')[0];
    }

    // Get top customers using raw query
    let dateFilterSql = '';
    let customerReplacements = [];
    if (startDate && endDate) {
      dateFilterSql = `AND o.createdAt >= ? AND o.createdAt < ?`;
      customerReplacements = [startDate, adjustedEndDateStr];
    } else if (startDate) {
      dateFilterSql = `AND o.createdAt >= ?`;
      customerReplacements = [startDate];
    } else if (endDate) {
      dateFilterSql = `AND o.createdAt < ?`;
      customerReplacements = [adjustedEndDateStr];
    }

    const topCustomers = await sequelize.query(
      `SELECT
        o.customerId,
        u.id as 'customer.id',
        u.username as 'customer.username',
        u.fullName as 'customer.fullName',
        u.email as 'customer.email',
        COUNT(o.id) as orderCount,
        SUM(o.totalAmount) as totalSpent
      FROM Orders o
      JOIN Users u ON o.customerId = u.id
      WHERE o.status != 'cancelled' ${dateFilterSql}
      GROUP BY o.customerId, u.id
      ORDER BY totalSpent DESC
      LIMIT 10`,
      {
        replacements: customerReplacements,
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Get new customers count using raw query
    let userDateFilterSql = '';
    let userReplacements = [];
    if (startDate && endDate) {
      userDateFilterSql = `AND createdAt >= ? AND createdAt < ?`;
      userReplacements = [startDate, adjustedEndDateStr];
    } else if (startDate) {
      userDateFilterSql = `AND createdAt >= ?`;
      userReplacements = [startDate];
    } else if (endDate) {
      userDateFilterSql = `AND createdAt < ?`;
      userReplacements = [adjustedEndDateStr];
    }

    const newCustomersResult = await sequelize.query(
      `SELECT COUNT(*) as count
      FROM Users
      WHERE role = 'customer' ${userDateFilterSql}`,
      {
        replacements: userReplacements,
        type: sequelize.QueryTypes.SELECT
      }
    );
    const newCustomersCount = newCustomersResult[0].count;

    res.json({
      topCustomers,
      newCustomersCount
    });
  } catch (error) {
    console.error('Error in getCustomerReport:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
