import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth';

interface WishlistContextType {
  wishlistItems: string[]; // array of productIds
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  toggleWishlist: async () => {},
  isInWishlist: () => false,
});

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<{ id: string, productId: string }[]>([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const q = query(collection(db, 'wishlist'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        productId: doc.data().productId
      }));
      setItems(newItems);
    });

    return () => unsubscribe();
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    if (!user) return;

    const existingItem = items.find(item => item.productId === productId);
    if (existingItem) {
      await deleteDoc(doc(db, 'wishlist', existingItem.id));
    } else {
      await addDoc(collection(db, 'wishlist'), {
        userId: user.uid,
        productId,
        addedAt: serverTimestamp()
      });
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.productId === productId);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems: items.map(i => i.productId), 
      toggleWishlist, 
      isInWishlist 
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
