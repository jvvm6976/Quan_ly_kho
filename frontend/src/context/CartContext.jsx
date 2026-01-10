import { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  // Load cart from localStorage on initial render or when user changes
  useEffect(() => {
    if (user) {
      // Nếu đăng nhập, lấy giỏ hàng của user từ localStorage
      const userCart = localStorage.getItem(`cart_${user.id}`);
      if (userCart) {
        setCartItems(JSON.parse(userCart));
      }
    } else {
      // Nếu không đăng nhập, lấy giỏ hàng khách
      const guestCart = localStorage.getItem('cart_guest');
      if (guestCart) {
        setCartItems(JSON.parse(guestCart));
      } else {
        setCartItems([]);
      }
    }
    setLoading(false);
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      if (user) {
        // Lưu giỏ hàng theo ID của user
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(cartItems));
      } else {
        // Lưu giỏ hàng cho khách không đăng nhập
        localStorage.setItem('cart_guest', JSON.stringify(cartItems));
      }
    }
  }, [cartItems, loading, user]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Item exists, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        // Item doesn't exist, add new item
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    if (user) {
      localStorage.removeItem(`cart_${user.id}`);
    } else {
      localStorage.removeItem('cart_guest');
    }
  };

  // Calculate cart totals
  const getCartTotals = () => {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 500000 ? 0 : 30000; // Free shipping for orders over 500.000đ
    const total = subtotal + shipping;
    
    return {
      itemCount,
      subtotal,
      shipping,
      total
    };
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getCartTotals
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
