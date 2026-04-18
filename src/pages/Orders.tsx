import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Package, Truck, CheckCircle, Clock, Link as LinkIcon, FileText } from 'lucide-react';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock size={16} className="text-amber-600" />;
      case 'Confirmed': return <CheckCircle size={16} className="text-blue-600" />;
      case 'Shipped': return <Truck size={16} className="text-indigo-600" />;
      case 'Delivered': return <Package size={16} className="text-green-600" />;
      default: return <Clock size={16} />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Confirmed': return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'Shipped': return 'bg-indigo-50 text-indigo-900 border-indigo-200';
      case 'Delivered': return 'bg-green-50 text-green-900 border-green-200';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <header className="mb-16">
        <h1 className="text-5xl font-serif mb-4 text-brand-blue">My Orders</h1>
        <p className="font-serif italic text-lg opacity-60 text-brand-blue">Track your custom furniture journey.</p>
      </header>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-40 bg-black/5 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-brand-blue/5">
          <Package size={40} className="mx-auto mb-6 text-brand-blue opacity-10" />
          <p className="font-serif italic text-xl opacity-40 text-brand-blue">No orders found yet.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {orders.map((order) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-brand-blue/5 shadow-sm overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center pb-6 border-b border-brand-blue/10 mb-6 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-1 text-brand-blue">Order ID</div>
                  <div className="font-mono text-sm font-bold tracking-tighter opacity-70 underline decoration-dotted text-brand-blue">{order.id}</div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-1 text-brand-blue">Total</div>
                    <div className="font-sans font-bold text-brand-blue">R {order.totalAmount.toLocaleString()}</div>
                  </div>
                  <div className={`px-4 py-2 rounded-full border text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-2 ${getStatusBg(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                   <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-4 text-brand-blue">Items</div>
                   <div className="space-y-3">
                      {order.items?.map((item: any, i: number) => (
                        <div key={i} className="flex gap-3 items-center">
                          <div className="w-8 h-8 bg-brand-light text-brand-blue rounded-full flex items-center justify-center font-bold text-[10px] shrink-0">
                            {item.quantity}
                          </div>
                          <div className="text-sm font-medium opacity-80 truncate text-brand-blue">{item.name}</div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="flex flex-col justify-end items-start md:items-end">
                  <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-2 text-brand-blue">Order Date</div>
                  <div className="text-xs font-medium opacity-60 mb-6 text-brand-blue">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </div>
                  <a 
                    href={order.popUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-blue-800 hover:underline"
                  >
                    <FileText size={14} /> View Proof of Payment
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
