const {
  Order,
  OrderItem,
  Product,
  User,
  InventoryTransaction
} = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// Generate order number
const generateOrderNumber = async () => {
  const date = new Date();
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  const prefix = `ORD${year}${month}${day}`;

  // Get the count of orders created today
  const count = await Order.count({
    where: {
      orderNumber: {
        [Op.like]: `${prefix}%`
      }
    }
  });

  // Generate order number
  return `${prefix}-${(count + 1).toString().padStart(3, '0')}`;
};

// Create order
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      items,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      notes
    } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItems = [];
    const productUpdates = [];

    // Group items by productId to handle duplicates
    const groupedItems = {};
    for (const item of items) {
      if (!groupedItems[item.productId]) {
        groupedItems[item.productId] = {
          productId: item.productId,
          quantity: 0
        };
      }
      groupedItems[item.productId].quantity += item.quantity;
    }

    // Process grouped items
    for (const productId in groupedItems) {
      const item = groupedItems[productId];

      // Find product
      const product = await Product.findByPk(item.productId, { transaction: t });

      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      // Check if product is active
      if (!product.isActive) {
        await t.rollback();
        return res.status(400).json({ message: `Product ${product.name} is not available` });
      }

      // Check if enough stock
      if (product.quantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({
          message: `Not enough stock for ${product.name}. Available: ${product.quantity}`
        });
      }

      // Calculate subtotal
      const price = parseFloat(product.price);
      const taxRate = product.tax ? parseFloat(product.tax) : 0;
      const baseSubtotal = price * item.quantity;
      const taxAmount = baseSubtotal * (taxRate / 100);
      const subtotal = baseSubtotal + taxAmount;
      totalAmount += subtotal;

      // Add to order items
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        subtotal
      });

      // Add to product updates
      productUpdates.push({
        product,
        newQuantity: product.quantity - item.quantity
      });
    }

    // Create order
    const order = await Order.create({
      orderNumber,
      totalAmount,
      status: 'pending',
      shippingAddress,
      shippingMethod,
      paymentMethod,
      paymentStatus: 'pending',
      notes,
      customerId: req.user.id
    }, { transaction: t });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      }, { transaction: t });
    }

    // If customer order, update product quantities immediately
    if (req.user.role === 'customer') {
      for (const update of productUpdates) {
        // Update product quantity
        await update.product.update({
          quantity: update.newQuantity
        }, { transaction: t });

        // Create inventory transaction
        await InventoryTransaction.create({
          productId: update.product.id,
          type: 'out',
          quantity: update.product.quantity - update.newQuantity,
          previousQuantity: update.product.quantity,
          newQuantity: update.newQuantity,
          reason: 'Order',
          reference: orderNumber,
          status: 'approved',
          createdBy: req.user.id,
          approvedBy: req.user.id
        }, { transaction: t });
      }
    }

    await t.commit();

    res.status(201).json({
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status
      }
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      startDate,
      endDate,
      customerId,
      page = 1,
      limit = 10,
      search
    } = req.query;

    // Build filter conditions
    const whereConditions = {};

    if (status) {
      whereConditions.status = status;
    }

    if (paymentStatus) {
      whereConditions.paymentStatus = paymentStatus;
    }

    if (customerId) {
      whereConditions.customerId = customerId;
    }
    
    // Search functionality: search in orderNumber, customer name, or notes
    if (search) {
      // We'll search in order fields directly in the main WHERE condition
      const searchConditions = [
        { orderNumber: { [Op.like]: `%${search}%` } },
        { notes: { [Op.like]: `%${search}%` } }
      ];
      
      whereConditions[Op.or] = searchConditions;
    }

    // Adjust endDate to include the full day by adding 1 day
    let adjustedEndDate = null;
    if (endDate) {
      adjustedEndDate = new Date(endDate);
      adjustedEndDate.setDate(adjustedEndDate.getDate() + 1);
    }

    if (startDate && endDate) {
      whereConditions.createdAt = {
        [Op.between]: [new Date(startDate), adjustedEndDate]
      };
    } else if (startDate) {
      whereConditions.createdAt = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereConditions.createdAt = {
        [Op.lt]: adjustedEndDate
      };
    }

    // If customer, only show their orders
    if (req.user.role === 'customer') {
      whereConditions.customerId = req.user.id;
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Build include options
    const includeOptions = [
      { 
        model: User, 
        as: 'customer', 
        attributes: ['id', 'username', 'fullName', 'email']
      },
      { model: User, as: 'processor', attributes: ['id', 'username', 'fullName'] }
    ];

    // If we're searching, we need to use a more complex query to search across both
    // order fields and customer fields
    let orders;
    let count;
    
    if (search) {
      // First find all customer IDs that match the search term
      const matchingCustomers = await User.findAll({
        where: {
          [Op.or]: [
            { fullName: { [Op.like]: `%${search}%` } },
            { username: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } }
          ]
        },
        attributes: ['id']
      });
      
      const customerIds = matchingCustomers.map(c => c.id);
      
      // If we found matching customers, add that to our search conditions
      if (customerIds.length > 0) {
        whereConditions[Op.or].push({ customerId: { [Op.in]: customerIds } });
      }
      
      // Now run the main query with our enhanced search conditions
      const result = await Order.findAndCountAll({
        where: whereConditions,
        include: includeOptions,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });
      
      orders = result.rows;
      count = result.count;
    } else {
      // Regular query without search term
      const result = await Order.findAndCountAll({
        where: whereConditions,
        include: includeOptions,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        distinct: true
      });
      
      orders = result.rows;
      count = result.count;
    }

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    res.json({
      orders,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'customer', attributes: ['id', 'username', 'fullName', 'email', 'phone'] },
        { model: User, as: 'processor', attributes: ['id', 'username', 'fullName'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // If customer, check if order belongs to them
    if (req.user.role === 'customer' && order.customerId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { status, paymentStatus } = req.body;
    const orderId = req.params.id;

    // Find order
    const order = await Order.findByPk(orderId, {
      include: [{
        model: OrderItem,
        as: 'items',
        include: [{ model: Product, as: 'product' }]
      }],
      transaction: t
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the user has permission to update the order
    const isCustomer = req.user.role === 'customer';
    const isOrderOwner = order.customerId === req.user.id;
    
    // Customers can only update their own orders and only to cancel them
    if (isCustomer) {
      if (!isOrderOwner) {
        await t.rollback();
        return res.status(403).json({ message: 'Not authorized to update this order' });
      }
      
      if (status !== 'cancelled') {
        await t.rollback();
        return res.status(403).json({ message: 'Customers can only cancel orders' });
      }
      
      if (order.status !== 'pending') {
        await t.rollback();
        return res.status(400).json({ message: 'Only pending orders can be cancelled' });
      }
    }

    // Update order
    const updateData = {};

    if (status) {
      // Validate status
      if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        await t.rollback();
        return res.status(400).json({ message: 'Invalid status' });
      }

      updateData.status = status;
      updateData.processedBy = req.user.id;

      // If cancelling order, return items to inventory
      if (status === 'cancelled' && order.status !== 'cancelled') {
        for (const item of order.items) {
          // Update product quantity
          await item.product.update({
            quantity: item.product.quantity + item.quantity
          }, { transaction: t });

          // Create inventory transaction
          await InventoryTransaction.create({
            productId: item.productId,
            type: 'in',
            quantity: item.quantity,
            previousQuantity: item.product.quantity,
            newQuantity: item.product.quantity + item.quantity,
            reason: 'Order cancelled',
            reference: order.orderNumber,
            status: 'approved',
            createdBy: req.user.id,
            approvedBy: req.user.id
          }, { transaction: t });
        }
      }
    }

    if (paymentStatus) {
      // Customers cannot update payment status
      if (isCustomer) {
        await t.rollback();
        return res.status(403).json({ message: 'Not authorized to update payment status' });
      }
      
      // Validate payment status
      if (!['pending', 'paid', 'failed'].includes(paymentStatus)) {
        await t.rollback();
        return res.status(400).json({ message: 'Invalid payment status' });
      }

      updateData.paymentStatus = paymentStatus;
    }

    await order.update(updateData, { transaction: t });

    await t.commit();

    res.json({
      message: 'Order updated successfully',
      order
    });
  } catch (error) {
    await t.rollback();
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
