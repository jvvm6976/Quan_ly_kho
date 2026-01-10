import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as jwt_decode from "jwt-decode";
import { authAPI, userAPI } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Token is handled by API interceptors in api.js
  useEffect(() => {
    // No need to set axios headers here as it's handled in api.js
  }, [token]);

  // Check if token is valid on initial load
  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        try {
          // Check if token is expired
          const decoded = jwt_decode.jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Token valid, get user data
            const res = await authAPI.getCurrentUser();
            setUser(res.data);
          }
        } catch (error) {
          console.error("Error validating token:", error);
          logout();
        }
      }
      setLoading(false);
    };

    checkToken();
  }, [token]);

  // Login user
  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);

        // Redirect based on user role
        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else if (res.data.user.role === "staff") {
          navigate("/staff");
        } else {
          navigate("/");
        }

        return { success: true };
      }

      // If we get here without a token, something went wrong
      return {
        success: false,
        message: "Login failed. Please try again.",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      const res = await authAPI.register(userData);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        navigate("/");
        return { success: true };
      }

      // If we get here without a token, something went wrong
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Registration failed. Please try again.",
      };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      if (!user || !user.id) {
        return {
          success: false,
          message: "User not authenticated",
        };
      }

      const res = await userAPI.updateUser(user.id, userData);

      if (res.data.user) {
        setUser({ ...user, ...res.data.user });
        return { success: true };
      }

      return {
        success: false,
        message: "Update failed. Please try again.",
      };
    } catch (error) {
      console.error("Update profile error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Update failed. Please try again.",
      };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!user || !user.id) {
        return {
          success: false,
          message: "User not authenticated",
        };
      }

      const res = await userAPI.updatePassword(user.id, {
        currentPassword,
        newPassword,
      });

      return { success: true, message: res.data.message };
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Password change failed. Please try again.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
