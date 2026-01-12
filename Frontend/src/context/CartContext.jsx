import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Load initial cart from localStorage for now (should migrate to Redux backend)
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      return parsed.map(item => ({ ...item, quantity: Number(item.quantity) || 1 }));
    }
    return [];
  });

  // Load initial wishlist from localStorage (will be replaced by Redux backend call)
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      return new Set(JSON.parse(saved));
    }
    return new Set();
  });

  // TODO: Replace these with Redux thunk calls to backend once Redux is fully integrated
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify([...wishlist]));
  }, [wishlist]);

  const getOrderSummary = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.1;
    const discount = subtotal > 200 ? subtotal * 0.05 : 0;
    const total = subtotal + shipping + tax - discount;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      freeShippingThreshold: 100,
      discountThreshold: 200,
      discountRate: 5,
      taxRate: 10
    };
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        item.selectedColor === product.selectedColor && 
        item.selectedModel === product.selectedModel
      );
      
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id &&
          item.selectedColor === product.selectedColor &&
          item.selectedModel === product.selectedModel
            ? {...item, quantity: item.quantity + product.quantity}
            : item
        );
      }
      return [...prevCart, product];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? {...item, quantity: newQuantity} : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    // TODO: Call Redux async thunk to clear cart on backend
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  const addToWishlist = (productId) => {
    setWishlist(prev => new Set([...prev, productId]));
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      newWishlist.delete(productId);
      return newWishlist;
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.has(productId);
  };

  return (
    <CartContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getOrderSummary,
      toggleWishlist,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);