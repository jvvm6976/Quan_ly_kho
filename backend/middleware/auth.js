const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT token
const auth = (req, res, next) => {
  // Get token from header
  let token = req.header('x-auth-token');
  
  // If token not found in x-auth-token, check Authorization header
  if (!token) {
    const authHeader = req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7); // Remove 'Bearer ' from the header value
    }
  }

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'Không đủ thẩm quyền.' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token hết hạn' });
  }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Không đủ thẩm quyền.' });
    }
  });
};

// Middleware to check if user is staff
const staffAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role === 'staff' || req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Không đủ thẩm quyền.' });
    }
  });
};

module.exports = { auth, adminAuth, staffAuth };
