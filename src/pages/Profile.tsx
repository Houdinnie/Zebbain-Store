import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { useWishlist } from '../lib/wishlist';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Package, ChevronRight, User as UserIcon, Mail, Calendar, Clock, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, profile } = useAuth();
  const { wishlistItems } = useWishlist();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  useEffect(() => {
    const fetchWishlistDetails = async () => {
      if (wishlistItems.length === 0) {
        setWishlistProducts([]);
        return;
      }

      setLoadingWishlist(true);
      try {
        const productPromises = wishlistItems.map(async (productId) => {
          const productDoc = await getDoc(doc(db, 'products', productId));
          if (productDoc.exists()) {
            return { id: productDoc.id, ...productDoc.data() };
          }
          return null;
        });

        const products = await Promise.all(productPromises);
        setWishlistProducts(products.filter(p => p !== null));
      } catch (err) {
        console.error("Error fetching wishlist products:", err);
      } finally {
        setLoadingWishlist(false);
      }
    };

    fetchWishlistDetails();
  }, [wishlistItems]);

  useEffect(() => {
    const fetchRecentOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        setRecentOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentOrders();
  }, [user]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-900 border-amber-200/50';
      case 'Confirmed': return 'bg-blue-50 text-blue-900 border-blue-200/50';
      case 'Shipped': return 'bg-indigo-50 text-indigo-900 border-indigo-200/50';
      case 'Delivered': return 'bg-green-50 text-green-900 border-green-200/50';
      default: return 'bg-brand-light text-brand-blue border-brand-blue/10';
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center md:text-left"
      >
        <h1 className="text-5xl font-serif mb-4 text-brand-blue capitalize">Welcome, {profile?.name || 'Valued Client'}</h1>
        <p className="font-serif italic text-lg opacity-60 text-brand-blue">Your bespoke cabinetry & luxury collection portal.</p>
      </motion.header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* User Info Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 space-y-8"
        >
          <div className="bg-white rounded-[40px] p-8 border border-brand-blue/5 shadow-sm">
            <div className="w-16 h-16 bg-brand-light rounded-2xl flex items-center justify-center mb-6 text-brand-blue">
              <UserIcon size={32} />
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue mb-1">Account Holder</div>
                <div className="font-medium text-brand-blue">{profile?.name}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue mb-1">Email Address</div>
                <div className="font-medium text-brand-blue flex items-center gap-2 truncate whitespace-nowrap overflow-hidden">
                  <Mail size={12} className="opacity-40" /> {user.email}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue mb-1">Bespoke Member Since</div>
                <div className="font-medium text-brand-blue flex items-center gap-2">
                  <Calendar size={12} className="opacity-40" /> {new Date(profile?.createdAt || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 lg:col-span-2 space-y-12"
        >
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <h2 className="text-sm uppercase tracking-[0.3em] font-bold opacity-40 text-brand-blue">Recent Commissions</h2>
              <Link to="/orders" className="text-[10px] uppercase tracking-widest font-bold text-brand-blue hover:opacity-50 transition-opacity flex items-center gap-1">
                View History <ChevronRight size={12} />
              </Link>
            </div>

            <div className="space-y-4">
              {loading ? (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="h-32 bg-brand-light animate-pulse rounded-[32px]" />
                ))
              ) : recentOrders.length === 0 ? (
                <div className="bg-white rounded-[32px] p-12 border border-brand-blue/5 text-center">
                  <Package size={32} className="mx-auto mb-4 opacity-10 text-brand-blue" />
                  <p className="font-serif italic text-brand-blue opacity-40">No orders placed yet.</p>
                  <Link to="/products" className="inline-block mt-4 text-[10px] uppercase tracking-widest font-bold text-brand-blue underline underline-offset-4 hover:opacity-100 transition-opacity">
                    Browse the catalog
                  </Link>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <Link 
                    key={order.id} 
                    to="/orders" 
                    className="block bg-white rounded-[32px] p-6 border border-brand-blue/5 hover:border-brand-blue/20 transition-all group shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue mb-1">
                          Order #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-sm font-medium text-brand-blue opacity-70">
                          {order.items?.length || 0} Piece{order.items?.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue mb-1">Total Value</div>
                        <div className="font-sans font-bold text-brand-blue">R {order.totalAmount?.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-brand-blue/5">
                      <div className="flex items-center gap-2">
                         <Clock size={14} className="opacity-40 text-brand-blue" />
                         <span className="text-[10px] uppercase tracking-widest font-bold opacity-40 text-brand-blue">
                           {new Date(order.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                      <div className={`px-4 py-1.5 border text-[8px] uppercase tracking-[0.2em] font-bold rounded-full ${getStatusStyles(order.status)}`}>
                        {order.status}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm uppercase tracking-[0.3em] font-bold opacity-40 text-brand-blue">Your Wishlist</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {loadingWishlist ? (
                [...Array(2)].map((_, i) => (
                  <div key={i} className="h-44 bg-brand-light animate-pulse rounded-[32px]" />
                ))
              ) : wishlistProducts.length === 0 ? (
                <div className="col-span-1 sm:col-span-2 bg-white rounded-[32px] p-12 border border-brand-blue/5 text-center">
                  <Heart size={32} className="mx-auto mb-4 opacity-10 text-brand-blue" />
                  <p className="font-serif italic text-brand-blue opacity-40">Your wishlist is empty.</p>
                </div>
              ) : (
                wishlistProducts.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.id}`}
                    className="flex gap-4 p-4 bg-white rounded-[24px] border border-brand-blue/5 hover:border-brand-blue/10 transition-all shadow-sm group"
                  >
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={product.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="font-serif text-brand-blue">{product.name}</div>
                      <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue mb-1">{product.category}</div>
                      <div className="text-xs font-bold text-brand-blue">R {product.price?.toLocaleString()}</div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
