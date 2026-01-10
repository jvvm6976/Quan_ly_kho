const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Sử dụng đường dẫn tuyệt đối
    const uploadPath = path.join(__dirname, '..', 'uploads');

    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `product-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
}).single('image');

// Middleware wrapper để thêm logging
exports.upload = (req, res, next) => {
  console.log('Starting file upload process...');
  console.log('Content-Type:', req.headers['content-type']);
  
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Multer error (file size, etc)
      console.error('Multer error in file upload:', err);
      return res.status(400).json({ 
        message: 'File upload failed', 
        error: err.message,
        code: err.code
      });
    } else if (err) {
      // Unknown error
      console.error('Unknown error in file upload:', err);
      return res.status(500).json({ message: 'File upload failed', error: err.message });
    }

    console.log('Request body keys:', Object.keys(req.body));
    console.log('Request body values:', req.body);
    
    if (req.file) {
      console.log('Uploaded file:', {
        filename: req.file.filename,
        originalname: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } else {
      console.log('No file uploaded in this request');
    }

    next();
  });
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      lowStock,
      sortBy = 'name',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    console.log('Received filter params:', req.query);

    // Build filter conditions
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { sku: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category) {
      whereConditions.categoryId = category;
    }

    // Handle price range filters
    if (minPrice || maxPrice) {
      whereConditions.price = {};
      
      if (minPrice) {
        whereConditions.price[Op.gte] = parseFloat(minPrice);
      }
      
      if (maxPrice) {
        whereConditions.price[Op.lte] = parseFloat(maxPrice);
      }
    }

    if (inStock === 'true') {
      whereConditions.quantity = { [Op.gt]: 0 };
    }

    if (lowStock === 'true') {
      whereConditions.quantity = { [Op.lte]: sequelize.col('minQuantity') };
    }

    // Calculate pagination
    const offset = (page - 1) * limit;

    // Determine sort order
    const order = [[sortBy || 'name', sortOrder || 'asc']];

    console.log('Using where conditions:', JSON.stringify(whereConditions));
    console.log('Using sort order:', order);

    // Get products
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      include: [{ model: Category, as: 'category' }],
      order,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate total pages
    const totalPages = Math.ceil(count / limit);

    res.json({
      products,
      pagination: {
        totalItems: count,
        totalPages,
        currentPage: parseInt(page),
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error in getProductById:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    console.log('createProduct req.body:', req.body);
    
    const {
      name,
      sku,
      description,
      price,
      costPrice,
      quantity,
      minQuantity,
      categoryId,
      location,
      isActive
    } = req.body;

    console.log('Extracted values:', {
      name, sku, price, costPrice, quantity, minQuantity, categoryId
    });

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }
    if (!sku) {
      return res.status(400).json({ message: 'SKU is required' });
    }

    // Check if SKU already exists
    const existingProduct = await Product.findOne({ where: { sku } });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this SKU already exists' });
    }

    // Check if category exists
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Create product
    let imagePath = null;
    if (req.file) {
      // Lưu đường dẫn tương đối để dễ truy cập từ frontend
      imagePath = 'uploads/' + path.basename(req.file.path);
      console.log('Image path:', imagePath);
    }

    // Ensure numeric values
    const numPrice = price ? parseFloat(price) : 0;
    const numCostPrice = costPrice ? parseFloat(costPrice) : 0;
    const numQuantity = quantity !== undefined ? parseInt(quantity, 10) : 0;
    const numMinQuantity = minQuantity !== undefined ? parseInt(minQuantity, 10) : 10;
    const numCategoryId = categoryId ? parseInt(categoryId, 10) : null;

    console.log('Parsed numeric values:', {
      price: numPrice,
      costPrice: numCostPrice,
      quantity: numQuantity,
      minQuantity: numMinQuantity,
      categoryId: numCategoryId
    });

    const product = await Product.create({
      name,
      sku,
      description,
      price: numPrice,
      costPrice: numCostPrice,
      quantity: numQuantity,
      minQuantity: numMinQuantity,
      categoryId: numCategoryId,
      location,
      image: imagePath,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    console.log('Product created successfully:', product.id);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Error in createProduct:', error);
    
    // Provide more specific error information
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    if (error.name === 'SequelizeDatabaseError') {
      return res.status(400).json({ 
        message: 'Database error', 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : error.stack
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      price,
      costPrice,
      quantity,
      minQuantity,
      categoryId,
      location,
      isActive
    } = req.body;

    const productId = req.params.id;

    // Find product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if SKU is changed and already exists
    if (sku && sku !== product.sku) {
      const existingSku = await Product.findOne({ where: { sku } });
      if (existingSku) {
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
    }

    // Check if category exists
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Category not found' });
      }
    }

    // Handle image update
    let imagePath = product.image;
    if (req.file) {
      // Delete old image if exists
      if (product.image) {
        const oldImagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      // Lưu đường dẫn tương đối để dễ truy cập từ frontend
      imagePath = 'uploads/' + path.basename(req.file.path);
    }

    // Update product
    await product.update({
      name: name !== undefined ? name : product.name,
      sku: sku !== undefined ? sku : product.sku,
      description: description !== undefined ? description : product.description,
      price: price !== undefined ? price : product.price,
      costPrice: costPrice !== undefined ? costPrice : product.costPrice,
      quantity: quantity !== undefined ? quantity : product.quantity,
      minQuantity: minQuantity !== undefined ? minQuantity : product.minQuantity,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      location: location !== undefined ? location : product.location,
      image: imagePath,
      isActive: isActive !== undefined ? isActive : product.isActive
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image if exists
    if (product.image) {
      const imagePath = path.join(__dirname, '..', product.image);
      console.log('Deleting image at path:', imagePath);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
        console.log('Image deleted successfully');
      } else {
        console.log('Image file not found');
      }
    }

    // Delete product
    await product.destroy();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
