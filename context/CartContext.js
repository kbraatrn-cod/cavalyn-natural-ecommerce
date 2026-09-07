'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { addToast } = useToast();

  // LocalStorage'dan sepeti yükle
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Sepet yüklenemedi:', e);
    }
    setIsLoaded(true);
  }, []);

  // Sepet değişince localStorage'a kaydet
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = useCallback((product, quantity = 1, variant = null) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.productId === product._id &&
          ((!item.variant && !variant) ||
           (item.variant?.name === variant?.name))
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }

      return [...prev, {
        productId: product._id,
        name: product.name,
        price: variant ? product.price + (variant.priceModifier || 0) : product.price,
        discountPrice: product.discountPrice
          ? product.discountPrice + (variant?.priceModifier || 0)
          : null,
        image: product.images?.[0] || null,
        quantity,
        variant,
        stock: variant?.stock ?? product.stock,
      }];
    });
    addToast('Ürün sepete eklendi', 'success');
  }, [addToast]);

  const removeItem = useCallback((productId, variantName = null) => {
    setItems(prev => prev.filter(
      item => !(item.productId === productId &&
        ((!item.variant && !variantName) || item.variant?.name === variantName))
    ));
    addToast('Ürün sepetten kaldırıldı', 'info');
  }, [addToast]);

  const updateQuantity = useCallback((productId, quantity, variantName = null) => {
    if (quantity < 1) return;
    setItems(prev => prev.map(item => {
      if (item.productId === productId &&
          ((!item.variant && !variantName) || item.variant?.name === variantName)) {
        return { ...item, quantity };
      }
      return item;
    }));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      isLoaded,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
