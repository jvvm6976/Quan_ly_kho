const bcrypt = require('bcrypt');
const { sequelize } = require('./database');
const {
  User,
  Category,
  Product
} = require('../models');

// Initialize database with sample data
const initDatabase = async () => {
  try {
    // Sync all models with force option to drop tables if they exist
    await sequelize.sync({ force: true });
    console.log('Database synchronized');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      fullName: 'Admin User',
      role: 'admin',
      isActive: true
    });
    console.log('Admin user created');

    // Create staff user
    const staffPassword = await bcrypt.hash('staff123', 10);
    await User.create({
      username: 'staff',
      email: 'staff@example.com',
      password: staffPassword,
      fullName: 'Staff User',
      role: 'staff',
      isActive: true
    });
    console.log('Staff user created');

    // Create customer user
    const customerPassword = await bcrypt.hash('customer123', 10);
    await User.create({
      username: 'customer',
      email: 'customer@example.com',
      password: customerPassword,
      fullName: 'Customer User',
      phone: '1234567890',
      address: '123 Main St, City, Country',
      role: 'customer',
      isActive: true
    });
    console.log('Customer user created');

    // Create categories
    const categories = await Category.bulkCreate([
      { name: 'CPUs', description: 'Central Processing Units' },
      { name: 'Motherboards', description: 'Computer Motherboards' },
      { name: 'Memory', description: 'RAM and Memory Modules' },
      { name: 'Storage', description: 'Hard Drives and SSDs' },
      { name: 'Graphics Cards', description: 'Video and Graphics Cards' },
      { name: 'Power Supplies', description: 'Power Supply Units' },
      { name: 'Cases', description: 'Computer Cases and Chassis' },
      { name: 'Cooling', description: 'Fans and Cooling Solutions' }
    ]);
    console.log('Categories created');

    // Create sample products
    const products = await Product.bulkCreate([
      {
        name: 'Intel Core i7-12700K',
        sku: 'CPU-I7-12700K',
        description: 'Intel Core i7-12700K Desktop Processor 12 Cores (8P+4E) with integrated graphics',
        price: 379.99,
        costPrice: 320.00,
        quantity: 25,
        minQuantity: 5,
        categoryId: 1,
        location: 'Shelf A1',
        isActive: true
      },
      {
        name: 'AMD Ryzen 9 5900X',
        sku: 'CPU-R9-5900X',
        description: 'AMD Ryzen 9 5900X 12-core, 24-Thread Unlocked Desktop Processor',
        price: 399.99,
        costPrice: 340.00,
        quantity: 20,
        minQuantity: 5,
        categoryId: 1,
        location: 'Shelf A2',
        isActive: true
      },
      {
        name: 'ASUS ROG Strix B550-F Gaming',
        sku: 'MB-ASUS-B550F',
        description: 'ASUS ROG Strix B550-F Gaming AMD AM4 Zen 3 Ryzen 5000 & 3rd Gen Ryzen ATX Gaming Motherboard',
        price: 179.99,
        costPrice: 150.00,
        quantity: 15,
        minQuantity: 3,
        categoryId: 2,
        location: 'Shelf B1',
        isActive: true
      },
      {
        name: 'MSI MPG Z690 Gaming Edge',
        sku: 'MB-MSI-Z690',
        description: 'MSI MPG Z690 Gaming Edge WiFi Gaming Motherboard (ATX, 12th Gen Intel Core, LGA 1700 Socket)',
        price: 289.99,
        costPrice: 240.00,
        quantity: 12,
        minQuantity: 3,
        categoryId: 2,
        location: 'Shelf B2',
        isActive: true
      },
      {
        name: 'Corsair Vengeance RGB Pro 32GB',
        sku: 'RAM-CORS-32GB',
        description: 'Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3600MHz C18 LED Desktop Memory',
        price: 129.99,
        costPrice: 100.00,
        quantity: 30,
        minQuantity: 8,
        categoryId: 3,
        location: 'Shelf C1',
        isActive: true
      },
      {
        name: 'G.SKILL Trident Z Neo 16GB',
        sku: 'RAM-GSKILL-16GB',
        description: 'G.SKILL Trident Z Neo Series 16GB (2 x 8GB) 288-Pin SDRAM DDR4 3600MHz',
        price: 89.99,
        costPrice: 70.00,
        quantity: 35,
        minQuantity: 10,
        categoryId: 3,
        location: 'Shelf C2',
        isActive: true
      },
      {
        name: 'Samsung 970 EVO Plus 1TB',
        sku: 'SSD-SAM-1TB',
        description: 'Samsung 970 EVO Plus 1TB PCIe NVMe M.2 Internal Solid State Drive',
        price: 109.99,
        costPrice: 85.00,
        quantity: 40,
        minQuantity: 10,
        categoryId: 4,
        location: 'Shelf D1',
        isActive: true
      },
      {
        name: 'Western Digital 4TB HDD',
        sku: 'HDD-WD-4TB',
        description: 'Western Digital 4TB WD Blue PC Hard Drive - 5400 RPM Class, SATA 6 Gb/s, 64 MB Cache',
        price: 79.99,
        costPrice: 60.00,
        quantity: 25,
        minQuantity: 5,
        categoryId: 4,
        location: 'Shelf D2',
        isActive: true
      },
      {
        name: 'NVIDIA GeForce RTX 3080',
        sku: 'GPU-NV-3080',
        description: 'NVIDIA GeForce RTX 3080 10GB GDDR6X Graphics Card',
        price: 699.99,
        costPrice: 600.00,
        quantity: 8,
        minQuantity: 2,
        categoryId: 5,
        location: 'Shelf E1',
        isActive: true
      },
      {
        name: 'AMD Radeon RX 6800 XT',
        sku: 'GPU-AMD-6800XT',
        description: 'AMD Radeon RX 6800 XT 16GB GDDR6 Graphics Card',
        price: 649.99,
        costPrice: 550.00,
        quantity: 7,
        minQuantity: 2,
        categoryId: 5,
        location: 'Shelf E2',
        isActive: true
      },
      {
        name: 'Corsair RM850x Power Supply',
        sku: 'PSU-CORS-850W',
        description: 'Corsair RM850x 850 Watt 80 PLUS Gold Certified Fully Modular Power Supply',
        price: 129.99,
        costPrice: 100.00,
        quantity: 20,
        minQuantity: 5,
        categoryId: 6,
        location: 'Shelf F1',
        isActive: true
      },
      {
        name: 'NZXT H510 Mid Tower Case',
        sku: 'CASE-NZXT-H510',
        description: 'NZXT H510 - Compact ATX Mid-Tower PC Gaming Case',
        price: 69.99,
        costPrice: 50.00,
        quantity: 15,
        minQuantity: 3,
        categoryId: 7,
        location: 'Shelf G1',
        isActive: true
      }
    ]);
    console.log('Sample products created');

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    process.exit();
  }
};

// Run the initialization
initDatabase();
