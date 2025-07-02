import React, { createContext, useContext, useState, useEffect } from 'react';
import { Media, Session } from '../types';

interface CartItem {
  id: number;
  media: Media;
  session: Session;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (media: Media, session: Session) => void;
  removeItem: (mediaId: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  isInCart: (mediaId: number) => boolean;
  getCurrentPhotographer: () => { id: number; name: string } | null;
  showPhotographerConflictModal: boolean;
  setShowPhotographerConflictModal: (show: boolean) => void;
  pendingItem: { media: Media; session: Session } | null;
  setPendingItem: (item: { media: Media; session: Session } | null) => void;
  replaceCartWithPendingItem: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [showPhotographerConflictModal, setShowPhotographerConflictModal] = useState(false);
  const [pendingItem, setPendingItem] = useState<{ media: Media; session: Session } | null>(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('waawave_cart');
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('waawave_cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items]);

  const getCurrentPhotographer = () => {
    if (items.length === 0) return null;
    const firstItem = items[0];
    return {
      id: firstItem.session.photographer.id,
      name: `${firstItem.session.photographer.first_name} ${firstItem.session.photographer.last_name}`
    };
  };

  const addItem = (media: Media, session: Session) => {
    const price = media.type === 'video' ? session.video_price : session.photo_price;
    
    // Check if item already exists
    if (items.some(item => item.id === media.id)) {
      return; // Don't add duplicates
    }

    // Check if cart has items from a different photographer
    const currentPhotographer = getCurrentPhotographer();
    if (currentPhotographer && currentPhotographer.id !== session.photographer.id) {
      // Store the pending item and show conflict modal
      setPendingItem({ media, session });
      setShowPhotographerConflictModal(true);
      return;
    }

    // Add item normally if no conflict
    const newItem: CartItem = {
      id: media.id,
      media,
      session,
      price
    };

    setItems(prevItems => [...prevItems, newItem]);
  };

  const replaceCartWithPendingItem = () => {
    if (!pendingItem) return;

    const price = pendingItem.media.type === 'video' 
      ? pendingItem.session.video_price 
      : pendingItem.session.photo_price;

    const newItem: CartItem = {
      id: pendingItem.media.id,
      media: pendingItem.media,
      session: pendingItem.session,
      price
    };

    // Clear cart and add the new item
    setItems([newItem]);
    
    // Clean up
    setPendingItem(null);
    setShowPhotographerConflictModal(false);
  };

  const removeItem = (mediaId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== mediaId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const getItemCount = () => {
    return items.length;
  };

  const isInCart = (mediaId: number) => {
    return items.some(item => item.id === mediaId);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      clearCart,
      getTotalPrice,
      getItemCount,
      isInCart,
      getCurrentPhotographer,
      showPhotographerConflictModal,
      setShowPhotographerConflictModal,
      pendingItem,
      setPendingItem,
      replaceCartWithPendingItem
    }}>
      {children}
    </CartContext.Provider>
  );
};