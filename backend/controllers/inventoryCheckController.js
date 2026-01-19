const { 
  InventoryCheck, 
  InventoryCheckItem, 
  Product, 
  InventoryTransaction,
  User 
} = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Generate check number
const generateCheckNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  const prefix = `IC${year}${month}${day}`;
  
  // Get the count of checks created today
  const count = await InventoryCheck.count({
    where: {
      checkNumber: {
        [Op.like]: `${prefix}%`
      }
    }
  });
  
  // Generate check number
  return `${prefix}-${(count + 1).toString().padStart(3, '0')}`;
};

// Create inventory check
exports.createInventoryCheck = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { notes, productIds } = req.body;

    // Generate check number
    const checkNumber = await generateCheckNumber();

    // Create inventory check
    const inventoryCheck = await InventoryCheck.create({
      checkNumber,
      status: 'pending',
      notes,
      createdBy: req.user.id
    }, { transaction: t });

    // If product IDs provided, add them to check
    if (productIds && productIds.length > 0) {
      // Get products
      const products = await Product.findAll({
        where: { id: productIds }
      }, { transaction: t });

      // Create check items
      const checkItems = [];
      for (const product of products) {
        checkItems.push({
          checkId: inventoryCheck.id,
          productId: product.id,
          systemQuantity: product.quantity,
          status: 'pending'
        });
      }

      await InventoryCheckItem.bulkCreate(checkItems, { transaction: t });
    } else {
      // Add all active products to check
      const products = await Product.findAll({
        where: { isActive: true }
      }, { transaction: t });

      // Create check items
      const checkItems = [];
      for (const product of products) {
        checkItems.push({
          checkId: inventoryCheck.id,
          productId: product.id,
          systemQuantity: product.quantity,
          status: 'pending'
        });
      }

      await InventoryCheckItem.bulkCreate(checkItems, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: 'Inventory check created successfully',
      inventoryCheck
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in createInventoryCheck:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all inventory checks
exports.getAllInventoryChecks = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate,
      page = 1, 
      limit = 10 
    } = req.query;

    // Build filter conditions
    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
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

    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get inventory checks
    const { count, rows: inventoryChecks } = await InventoryCheck.findAndCountAll({
      where: whereConditions,
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'completer', attributes: ['id', 'username', 'fullName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    res.json({
      inventoryChecks,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllInventoryChecks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get inventory check by ID
exports.getInventoryCheckById = async (req, res) => {
  try {
    const inventoryCheck = await InventoryCheck.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'username', 'fullName'] },
        { model: User, as: 'completer', attributes: ['id', 'username', 'fullName'] },
        { 
          model: InventoryCheckItem, 
          as: 'items',
          include: [
            { model: Product, as: 'product' },
            { model: User, as: 'checker', attributes: ['id', 'username', 'fullName'] }
          ]
        }
      ]
    });
    
    if (!inventoryCheck) {
      return res.status(404).json({ message: 'Inventory check not found' });
    }
    
    res.json(inventoryCheck);
  } catch (error) {
    console.error('Error in getInventoryCheckById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update inventory check status
exports.updateInventoryCheckStatus = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { status } = req.body;
    const checkId = req.params.id;

    // Validate status
    if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Find inventory check
    const inventoryCheck = await InventoryCheck.findByPk(checkId, { transaction: t });
    if (!inventoryCheck) {
      await t.rollback();
      return res.status(404).json({ message: 'Inventory check not found' });
    }

    // Additional validation: cannot complete if any items not checked
    if (status === 'completed') {
      const uncheckedCount = await InventoryCheckItem.count({
        where: {
          checkId,
          status: { [Op.ne]: 'checked' }
        },
        transaction: t
      });

      if (uncheckedCount > 0) {
        await t.rollback();
        return res.status(400).json({ message: 'All items must be checked before completing the inventory check' });
      }
    }

    // Update status
    const updateData = { status };
    
    if (status === 'in_progress') {
      updateData.startDate = new Date();
    } else if (status === 'completed') {
      updateData.endDate = new Date();
      updateData.completedBy = req.user.id;
    }

    await inventoryCheck.update(updateData, { transaction: t });

    await t.commit();

    res.json({
      message: `Inventory check ${status}`,
      inventoryCheck
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in updateInventoryCheckStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update inventory check item
exports.updateInventoryCheckItem = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const { actualQuantity, notes } = req.body;
    const itemId = req.params.itemId;

    // Find check item
    const checkItem = await InventoryCheckItem.findByPk(itemId, {
      include: [{ model: InventoryCheck, as: 'check' }],
      transaction: t
    });
    
    if (!checkItem) {
      await t.rollback();
      return res.status(404).json({ message: 'Check item not found' });
    }

    // Check if inventory check is in progress
    if (checkItem.check.status !== 'in_progress') {
      await t.rollback();
      return res.status(400).json({ message: 'Inventory check is not in progress' });
    }

    // Validate quantity
    const parsedActual = Number(actualQuantity);
    if (!Number.isFinite(parsedActual) || parsedActual < 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Invalid quantity' });
    }

    // Calculate difference
    const difference = parsedActual - checkItem.systemQuantity;

    // Update check item
    await checkItem.update({
      actualQuantity: parsedActual,
      difference,
      notes,
      status: 'checked',
      checkedBy: req.user.id
    }, { transaction: t });

    await t.commit();

    res.json({
      message: 'Check item updated successfully',
      checkItem
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in updateInventoryCheckItem:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Apply inventory check adjustments
exports.applyInventoryCheckAdjustments = async (req, res) => {
  const t = await sequelize.transaction();
  
  try {
    const checkId = req.params.id;

    // Find inventory check
    const inventoryCheck = await InventoryCheck.findByPk(checkId, {
      include: [{ 
        model: InventoryCheckItem, 
        as: 'items',
        where: { 
          status: 'checked',
          difference: { [Op.ne]: 0 }
        },
        include: [{ model: Product, as: 'product' }]
      }],
      transaction: t
    });
    
    if (!inventoryCheck) {
      await t.rollback();
      return res.status(404).json({ message: 'Inventory check not found or no adjustments needed' });
    }

    // Check if inventory check is completed
    if (inventoryCheck.status !== 'completed') {
      await t.rollback();
      return res.status(400).json({ message: 'Inventory check must be completed before applying adjustments' });
    }

    // Apply adjustments
    for (const item of inventoryCheck.items) {
      // Update product quantity
      await item.product.update({
        quantity: item.actualQuantity
      }, { transaction: t });

      // Create inventory transaction
      await InventoryTransaction.create({
        productId: item.productId,
        type: 'adjustment',
        quantity: item.actualQuantity,
        previousQuantity: item.systemQuantity,
        newQuantity: item.actualQuantity,
        reason: 'Inventory check adjustment',
        reference: inventoryCheck.checkNumber,
        notes: `Adjustment from inventory check ${inventoryCheck.checkNumber}`,
        createdBy: req.user.id,
        approvedBy: req.user.id,
        status: 'approved'
      }, { transaction: t });

      // Update check item status
      await item.update({ status: 'adjusted' }, { transaction: t });
    }

    await t.commit();

    res.json({
      message: 'Inventory check adjustments applied successfully',
      count: inventoryCheck.items.length
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in applyInventoryCheckAdjustments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
