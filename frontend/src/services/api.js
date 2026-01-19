import axios from 'axios';

// Sử dụng backend chính
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me')
};

// User API
export const userAPI = {
  getAllUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  updatePassword: (id, passwordData) => api.put(`/users/${id}/password`, passwordData),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

// Category API
export const categoryAPI = {
  getAllCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Product API
export const productAPI = {
  getAllProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (formData) => {
    try {
      // Kiểm tra xem formData có phải là FormData không
      if (!(formData instanceof FormData)) {
        console.log('Converting object to FormData in createProduct');
        const newFormData = new FormData();

        // Chuyển đổi dữ liệu thành FormData
        Object.keys(formData).forEach(key => {
          if (formData[key] !== undefined && formData[key] !== null) {
            // Ensure numeric values are properly converted
            if (['price', 'tax', 'costPrice', 'quantity', 'minQuantity', 'categoryId'].includes(key)) {
              const numValue = Number(formData[key]);
              newFormData.append(key, isNaN(numValue) ? 0 : numValue);
            } else {
              newFormData.append(key, formData[key]);
            }
          }
        });

        formData = newFormData;
      }

      // Log FormData entries for debugging
      console.log('FormData being sent to server (createProduct):');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
      }

      return api.post('/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error("Error in createProduct formData preparation:", error);
      throw error;
    }
  },
  updateProduct: (id, formData) => {
    try {
      // Kiểm tra xem formData có phải là FormData không
      if (!(formData instanceof FormData)) {
        console.log('Converting object to FormData in updateProduct');
        const newFormData = new FormData();

        // Chuyển đổi dữ liệu thành FormData
        Object.keys(formData).forEach(key => {
          if (formData[key] !== undefined && formData[key] !== null) {
            // Ensure numeric values are properly converted
            if (['price', 'tax', 'costPrice', 'quantity', 'minQuantity', 'categoryId'].includes(key)) {
              const numValue = Number(formData[key]);
              newFormData.append(key, isNaN(numValue) ? 0 : numValue);
            } else {
              newFormData.append(key, formData[key]);
            }
          }
        });

        formData = newFormData;
      }

      // Log FormData entries for debugging
      console.log(`FormData being sent to server (updateProduct ID: ${id}):`);
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]));
      }

      return api.put(`/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      console.error("Error in updateProduct formData preparation:", error);
      throw error;
    }
  },
  deleteProduct: (id) => api.delete(`/products/${id}`)
};

// Inventory API
export const inventoryAPI = {
  getInventorySummary: () => api.get('/inventory/summary'),
  getLowStockProducts: () => api.get('/inventory/low-stock'),
  getOutOfStockProducts: () => api.get('/inventory/out-of-stock'),
  createTransaction: (transactionData) => api.post('/inventory/transactions', transactionData),
  getAllTransactions: (params) => api.get('/inventory/transactions', { params }),
  updateTransactionStatus: (id, statusData) => api.put(`/inventory/transactions/${id}`, statusData),
  createInventoryCheck: (checkData) => api.post('/inventory/checks', checkData),
  getAllInventoryChecks: (params) => api.get('/inventory/checks', { params }),
  getInventoryCheckById: (id) => api.get(`/inventory/checks/${id}`),
  updateInventoryCheckStatus: (id, statusData) => api.put(`/inventory/checks/${id}`, statusData),
  updateInventoryCheckItem: (checkId, itemId, itemData) => api.put(`/inventory/checks/${checkId}/items/${itemId}`, itemData),
  applyInventoryCheckAdjustments: (id) => api.post(`/inventory/checks/${id}/apply`)
};

// Order API
export const orderAPI = {
  createOrder: (orderData) => api.post('/orders', orderData),
  getAllOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, statusData) => api.put(`/orders/${id}`, statusData)
};

// Report API
export const reportAPI = {
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getTopSellingProducts: (params) => api.get('/reports/top-products', { params }),
  getInventoryValueReport: () => api.get('/reports/inventory-value'),
  getInventoryMovementReport: (params) => api.get('/reports/inventory-movement', { params }),
  getCustomerReport: (params) => api.get('/reports/customers', { params })
};

export default api;
