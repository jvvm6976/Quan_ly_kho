import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Auth Components
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import PrivateRoute from "./components/auth/PrivateRoute";

// Admin Components
import AdminDashboard from "./components/admin/Dashboard";
import AdminProducts from "./components/admin/Products";
import AdminCategories from "./components/admin/Categories";
import AdminInventory from "./components/admin/Inventory";
import AdminOrders from "./components/admin/Orders";
import AdminUsers from "./components/admin/Users";
import AdminReports from "./components/admin/Reports";
import AdminInventoryCheck from "./components/admin/InventoryCheck";

// Staff Components
import StaffDashboard from "./components/staff/Dashboard";
import StaffProducts from "./components/staff/Products";
import StaffInventory from "./components/staff/Inventory";
import StaffInventoryIn from "./components/staff/InventoryIn";
import StaffInventoryOut from "./components/staff/InventoryOut";
import StaffInventoryCheck from "./components/staff/InventoryCheck";
import StaffOrders from "./components/staff/Orders";
import StaffTasks from "./components/staff/Tasks";
import StaffSchedule from "./components/staff/Schedule";
import StaffNotifications from "./components/staff/Notifications";

// Customer Components
import Home from "./components/customer/Home";
import ProductList from "./components/customer/ProductList";
import ProductDetail from "./components/customer/ProductDetail";
import Cart from "./components/customer/Cart";
import Checkout from "./components/customer/Checkout";
import CustomerOrders from "./components/customer/Orders";
import CustomerProfile from "./components/customer/Profile";

// Context
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />

            {/* Customer Routes */}
            <Route
              path="/checkout"
              element={
                <PrivateRoute allowedRoles={["customer", "admin"]}>
                  <Checkout />
                </PrivateRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <PrivateRoute allowedRoles={["customer", "admin"]}>
                  <CustomerOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute allowedRoles={["customer", "staff", "admin"]}>
                  <CustomerProfile />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminProducts />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminCategories />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminInventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminReports />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/inventory-check"
              element={
                <PrivateRoute allowedRoles={["admin"]}>
                  <AdminInventoryCheck />
                </PrivateRoute>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/products"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffProducts />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/inventory"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffInventory />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/inventory-in"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffInventoryIn />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/inventory-out"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffInventoryOut />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/inventory-check"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffInventoryCheck />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/orders"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffOrders />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/tasks"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffTasks />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/schedule"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffSchedule />
                </PrivateRoute>
              }
            />
            <Route
              path="/staff/notifications"
              element={
                <PrivateRoute allowedRoles={["staff", "admin"]}>
                  <StaffNotifications />
                </PrivateRoute>
              }
            />

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
