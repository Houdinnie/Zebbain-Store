import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/auth';
import { db, storage } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Users, ShoppingBag, Plus, Edit2, Trash2, X, Upload, Loader2, Check, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'users'>('inventory');
  
  // States
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderSortBy, setOrderSortBy] = useState<'date' | 'status'>('date');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [orderDateStart, setOrderDateStart] = useState('');
  const [orderDateEnd, setOrderDateEnd] = useState('');
  
  // Modal for Product Edit/Add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', price: 0, category: 'Couches', description: '', specs: '', images: [] as string[] });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedUserForHistory, setSelectedUserForHistory] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== 'admin')) {
      navigate('/');
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (profile?.role !== 'admin') return;

    const unsubProducts = onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    setLoading(false);

    return () => {
      unsubProducts();
      unsubOrders();
      unsubUsers();
    };
  }, [profile]);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let finalImages = [...formData.images];

      // Handle file uploads if any
      if (selectedFiles && selectedFiles.length > 0) {
        const uploadPromises = Array.from(selectedFiles).map(async (file: File) => {
          const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          const uploadResult = await uploadBytes(storageRef, file);
          return await getDownloadURL(uploadResult.ref);
        });
        const newImageUrls = await Promise.all(uploadPromises);
        finalImages = [...finalImages, ...newImageUrls];
      }

      // Filter out empty URLs
      finalImages = finalImages.filter(url => url.trim() !== '');

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), { ...formData, images: finalImages });
      } else {
        await addDoc(collection(db, 'products'), { ...formData, images: finalImages, createdAt: new Date().toISOString() });
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      setFormData({ name: '', price: 0, category: 'Couches', description: '', specs: '', images: [] });
      setSelectedFiles(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, orderData?: any) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      
      // If status is changed to Confirmed, trigger email
      if (newStatus === 'Confirmed' && orderData) {
        try {
          await fetch('/api/confirm-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId,
              customerEmail: orderData.customerEmail,
              customerName: orderData.customerName,
              totalAmount: orderData.totalAmount,
              items: orderData.items
            })
          });
        } catch (emailErr) {
          console.error("Failed to trigger email confirmation:", emailErr);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) return <div className="h-screen flex items-center justify-center font-serif italic text-2xl animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
        <div>
          <h1 className="text-4xl font-serif mb-2 text-brand-blue">Admin Dashboard</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 text-brand-blue">Manage your luxury empire</p>
          {products.length === 0 && (
            <button 
              onClick={async () => {
                const sampleProducts = [
                  { name: "The Velvet Cloud", price: 18500, category: "Couches", description: "Deep-seated luxury in emerald velvet.", images: ["https://picsum.photos/seed/sofa1/800/800"], createdAt: new Date().toISOString() },
                  { name: "Modernist Sectional", price: 24900, category: "Sectionals", description: "Minimalist lines meets supreme comfort.", images: ["https://picsum.photos/seed/sofa2/800/800"], createdAt: new Date().toISOString() },
                  { name: "Artisan Leather Wing", price: 15400, category: "Armchairs", description: "Distressed Italian leather, locally finished.", images: ["https://picsum.photos/seed/sofa3/800/800"], createdAt: new Date().toISOString() },
                  { name: "Nordic Dining Set", price: 12200, category: "Dining Chairs", description: "Oak and linen elegance for your table.", images: ["https://picsum.photos/seed/chair1/800/800"], createdAt: new Date().toISOString() }
                ];
                for (const p of sampleProducts) {
                  await addDoc(collection(db, 'products'), p);
                }
              }}
              className="text-[10px] font-bold text-blue-600 mt-2 hover:underline cursor-pointer"
            >
              Seed Sample Data
            </button>
          )}
        </div>
        
        <div className="flex bg-white rounded-full p-1 border border-brand-blue/10 overflow-x-auto scrollbar-hide shrink-0">
           {[
             { id: 'inventory', icon: Package, label: 'Inventory' },
             { id: 'orders', icon: ShoppingBag, label: 'Orders' },
             { id: 'users', icon: Users, label: 'Customers' }
           ].map((tab) => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-all cursor-pointer whitespace-nowrap ${
                 activeTab === tab.id ? 'bg-brand-blue text-white shadow-lg' : 'hover:bg-brand-blue/5 opacity-50 text-brand-blue'
               }`}
             >
               <tab.icon size={14} /> {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white rounded-[40px] p-8 md:p-12 border border-brand-blue/5 shadow-sm min-h-[60vh]">
        {activeTab === 'inventory' && (
          <div className="space-y-12">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-serif text-brand-blue">Product Catalog</h2>
               <button 
                  onClick={() => { setEditingProduct(null); setFormData({ name: '', price: 0, category: 'Couches', description: '', specs: '', images: [] }); setIsModalOpen(true); }}
                  className="flex items-center gap-2 bg-brand-blue text-white px-4 md:px-6 py-3 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-brand-blue/90 transition-all cursor-pointer shadow-md"
               >
                 <Plus size={16} /> <span className="hidden sm:inline">New Product</span><span className="sm:hidden">New</span>
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <div key={product.id} className="group relative bg-brand-light rounded-2xl p-4 overflow-hidden border border-brand-blue/5">
                   <img src={product.images?.[0] || 'https://picsum.photos/seed/couch/400/400'} className="w-full aspect-square object-cover rounded-xl mb-4 group-hover:scale-105 transition-transform duration-700" alt="" />
                   <div className="font-serif text-lg mb-1 text-brand-blue">{product.name}</div>
                   <div className="font-sans font-bold text-xs opacity-50 mb-4">R {product.price?.toLocaleString()}</div>
                   
                   <div className="flex gap-2">
                     <button 
                        onClick={() => { setEditingProduct(product); setFormData(product); setIsModalOpen(true); }}
                        className="p-2 bg-white rounded-full hover:bg-brand-blue hover:text-white transition-colors cursor-pointer text-brand-blue"
                     >
                        <Edit2 size={14} />
                     </button>
                     <button 
                        onClick={async () => { if(confirm('Delete product?')) await deleteDoc(doc(db, 'products', product.id)); }}
                        className="p-2 bg-white rounded-full hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                     >
                        <Trash2 size={14} />
                     </button>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

            {activeTab === 'orders' && (
          <div className="space-y-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <h2 className="text-2xl font-serif text-brand-blue">Order Management</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue">Status:</span>
                  <select 
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-brand-light border-none px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold cursor-pointer text-brand-blue focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue text-nowrap">From:</span>
                  <input 
                    type="date"
                    value={orderDateStart}
                    onChange={(e) => setOrderDateStart(e.target.value)}
                    className="bg-brand-light border-none px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold cursor-pointer text-brand-blue focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue text-nowrap">To:</span>
                  <input 
                    type="date"
                    value={orderDateEnd}
                    onChange={(e) => setOrderDateEnd(e.target.value)}
                    className="bg-brand-light border-none px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold cursor-pointer text-brand-blue focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue px-2">Sort:</span>
                  <select 
                    value={orderSortBy}
                    onChange={(e) => setOrderSortBy(e.target.value as 'date' | 'status')}
                    className="bg-brand-light border-none px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold cursor-pointer text-brand-blue focus:outline-none"
                  >
                    <option value="date">Order Date</option>
                    <option value="status">Order Status</option>
                  </select>
                </div>
                
                {(orderStatusFilter !== 'All' || orderDateStart || orderDateEnd) && (
                  <button 
                    onClick={() => {
                      setOrderStatusFilter('All');
                      setOrderDateStart('');
                      setOrderDateEnd('');
                    }}
                    className="text-[8px] uppercase tracking-widest font-bold text-red-600 hover:underline px-2"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-x-auto -mx-8 px-8 md:mx-0 md:px-0 scrollbar-hide">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="border-b border-brand-blue/10 text-[10px] uppercase tracking-widest font-bold opacity-40 text-brand-blue">
                    <th className="pb-6 px-4">Order ID / Date</th>
                    <th className="pb-6 px-4">Customer</th>
                    <th className="pb-6 px-4">Amount</th>
                    <th className="pb-6 px-4">PoP</th>
                    <th className="pb-6 px-4">Internal Notes</th>
                    <th className="pb-6 px-4 hover:underline cursor-pointer" onClick={() => setOrderSortBy('status')}>Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {orders
                    .filter(order => {
                      if (orderStatusFilter !== 'All' && order.status !== orderStatusFilter) return false;
                      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                      if (orderDateStart && orderDate < orderDateStart) return false;
                      if (orderDateEnd && orderDate > orderDateEnd) return false;
                      return true;
                    })
                    .sort((a, b) => {
                      if (orderSortBy === 'status') {
                        const statusWeight: Record<string, number> = {
                          'Pending': 0,
                          'Confirmed': 1,
                          'Shipped': 2,
                          'Delivered': 3
                        };
                        return (statusWeight[a.status] ?? 0) - (statusWeight[b.status] ?? 0);
                      }
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((order) => (
                    <tr key={order.id} className="border-b border-brand-blue/5 group hover:bg-brand-blue/5 transition-colors">
                      <td className="py-8 px-4">
                        <div className="font-mono text-xs opacity-40 truncate w-32 mb-1 text-brand-blue">{order.id}</div>
                        <div className="opacity-60">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-8 px-4">
                        <div className="font-bold text-brand-blue">{order.customerName}</div>
                        <div className="text-[10px] opacity-40">{order.customerEmail}</div>
                      </td>
                      <td className="py-8 px-4 text-brand-blue font-bold">R {order.totalAmount?.toLocaleString()}</td>
                      <td className="py-8 px-4">
                        <a href={order.popUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-blue-800 hover:underline">
                          <ExternalLink size={12} /> View Slip
                        </a>
                      </td>
                      <td className="py-8 px-4">
                        <textarea 
                          defaultValue={order.adminNotes || ''} 
                          onBlur={async (e) => {
                            if (e.target.value !== (order.adminNotes || '')) {
                              await updateDoc(doc(db, 'orders', order.id), { adminNotes: e.target.value });
                            }
                          }}
                          placeholder="Add private notes..."
                          className="bg-brand-light border-none p-4 rounded-xl text-xs font-light w-48 h-20 focus:outline-none focus:ring-1 focus:ring-brand-blue/20 resize-none text-brand-blue"
                        />
                      </td>
                      <td className="py-8 px-4">
                        <select 
                          value={order.status} 
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value, order)}
                          className="bg-brand-light border-none px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold cursor-pointer text-brand-blue"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
           <div className="space-y-12">
             <h2 className="text-2xl font-serif text-brand-blue">Registered Customers</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {users.map((u) => (
                 <div 
                   key={u.id} 
                   onClick={() => setSelectedUserForHistory(u)}
                   className="bg-brand-light p-8 rounded-[32px] border border-brand-blue/5 hover:border-brand-blue/20 hover:shadow-lg transition-all cursor-pointer group"
                 >
                   <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-serif text-xl font-bold italic group-hover:bg-brand-blue group-hover:text-white transition-colors border border-brand-blue/5">
                        {u.name?.[0]}
                      </div>
                      <div>
                        <div className="font-bold text-brand-blue">{u.name}</div>
                        <div className="text-xs opacity-50 italic font-serif">{u.role}</div>
                      </div>
                   </div>
                   <div className="text-xs opacity-60 mb-1 text-brand-blue">{u.email}</div>
                   <div className="flex justify-between items-center">
                     <div className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue">
                       Member since {new Date(u.createdAt).toLocaleDateString()}
                     </div>
                     <div className="text-[10px] uppercase tracking-widest font-bold bg-white text-brand-blue px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-brand-blue/5 shadow-sm">
                       View History
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           </div>
        )}
      </div>

      {/* User History Modal */}
      <AnimatePresence>
        {selectedUserForHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[40px] p-8 md:p-12 relative shadow-2xl my-auto"
            >
              <button 
                onClick={() => setSelectedUserForHistory(null)}
                className="absolute top-8 right-8 p-2 hover:bg-black/5 rounded-full"
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-6 mb-12">
                <div className="w-16 h-16 bg-brand-light rounded-full flex items-center justify-center font-serif text-3xl italic font-bold text-brand-blue border border-brand-blue/5">
                  {selectedUserForHistory.name?.[0]}
                </div>
                <div>
                  <h3 className="text-4xl font-serif text-brand-blue">{selectedUserForHistory.name}</h3>
                  <p className="opacity-40 text-sm text-brand-blue">{selectedUserForHistory.email}</p>
                </div>
              </div>

              <div className="space-y-8">
                <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-30 text-brand-blue">Transaction History</h4>
                
                <div className="overflow-x-auto -mx-8 px-8 md:mx-0 md:px-0 scrollbar-hide">
                  <table className="w-full text-left min-w-[600px]">
                    <thead>
                      <tr className="border-b border-brand-blue/10 text-[10px] uppercase tracking-widest font-bold opacity-40 text-brand-blue">
                        <th className="pb-4">Order ID</th>
                        <th className="pb-4">Date</th>
                        <th className="pb-4">Items</th>
                        <th className="pb-4">Amount</th>
                        <th className="pb-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {orders.filter(o => o.userId === selectedUserForHistory.id).length > 0 ? (
                        orders.filter(o => o.userId === selectedUserForHistory.id).map(o => (
                          <tr key={o.id} className="border-b border-brand-blue/5">
                            <td className="py-4 font-mono text-[10px] opacity-40 text-brand-blue">{o.id}</td>
                            <td className="py-4 text-brand-blue">{new Date(o.createdAt).toLocaleDateString()}</td>
                            <td className="py-4">
                              <div className="text-[10px] max-w-xs truncate text-brand-blue opacity-70">
                                {o.items.map((it: any) => it.name).join(', ')}
                              </div>
                            </td>
                            <td className="py-4 font-bold text-brand-blue">R {o.totalAmount?.toLocaleString()}</td>
                            <td className="py-4">
                              <span className="bg-brand-light text-brand-blue px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border border-brand-blue/5">
                                {o.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center opacity-30 italic">No orders found for this customer.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[40px] p-8 md:p-12 relative shadow-2xl my-auto"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-2 hover:bg-black/5 rounded-full"
              >
                <X size={24} />
              </button>
              
              <h3 className="text-4xl font-serif mb-12">
                {editingProduct ? 'Edit Piece' : 'New Piece'}
              </h3>

              <form onSubmit={handleProductSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block px-4 text-brand-blue">Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required
                      className="w-full bg-brand-light border-none px-6 py-4 rounded-2xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue/20 text-brand-blue placeholder:text-brand-blue/30"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block px-4 text-brand-blue">Price (R)</label>
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
                      required
                      className="w-full bg-brand-light border-none px-6 py-4 rounded-2xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue/20 text-brand-blue placeholder:text-brand-blue/30"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block px-4 text-brand-blue">Category</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-brand-light border-none px-6 py-4 rounded-2xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue/20 cursor-pointer text-brand-blue"
                  >
                    <option>Couches</option>
                    <option>Sectionals</option>
                    <option>Armchairs</option>
                    <option>Dining Chairs</option>
                    <option>Bespoke</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block px-4 text-brand-blue">Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    rows={4}
                    className="w-full bg-brand-light border-none px-6 py-4 rounded-2xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue/20 text-brand-blue"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block px-4 text-brand-blue">Technical Specifications</label>
                  <textarea 
                    value={formData.specs} 
                    onChange={(e) => setFormData({...formData, specs: e.target.value})} 
                    rows={4}
                    placeholder="E.g. Dimensions, Material details, etc."
                    className="w-full bg-brand-light border-none px-6 py-4 rounded-2xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue/20 text-brand-blue"
                  />
                </div>

                <div className="space-y-4 text-brand-blue">
                  <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 block px-4">Upload New Images</label>
                  <label className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-brand-blue/10 rounded-2xl cursor-pointer hover:bg-brand-blue/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload size={24} className="opacity-20 mb-2" />
                      <p className="text-xs opacity-50 uppercase tracking-widest font-bold">
                        {selectedFiles ? `${selectedFiles.length} files selected` : 'Select Product Images'}
                      </p>
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      multiple 
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                    />
                  </label>
                  
                  {selectedFiles && selectedFiles.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                       {Array.from(selectedFiles).map((file: File, i) => (
                         <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-brand-blue/10">
                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                         </div>
                       ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4 text-brand-blue">
                  <label className="text-[10px] uppercase tracking-widest font-bold px-4 flex items-center justify-between">
                    <span className="opacity-40">Existing Image URLs</span>
                    <button 
                      type="button" 
                      onClick={() => setFormData({...formData, images: [...formData.images, '']})}
                      className="text-brand-blue hover:opacity-50 transition-opacity"
                    >
                      <Plus size={14} />
                    </button>
                  </label>
                  {formData.images.map((img, i) => (
                    <div key={i} className="flex gap-2">
                       <input 
                        type="text" 
                        value={img} 
                        onChange={(e) => {
                          const newImgs = [...formData.images];
                          newImgs[i] = e.target.value;
                          setFormData({...formData, images: newImgs});
                        }} 
                        className="flex-grow bg-brand-light border-none px-6 py-4 rounded-2xl text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-blue/20"
                        placeholder="Image URL"
                      />
                      <button onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})} className="p-2 hover:text-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <div className="text-[8px] opacity-40 px-4">Hint: Use https://picsum.photos/seed/[something]/800/800 for placeholders</div>
                </div>

                <button 
                  type="submit" 
                  disabled={uploading}
                  className="w-full bg-brand-blue text-white py-6 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-4 hover:bg-brand-blue/90 transition-all rounded-full cursor-pointer shadow-lg"
                >
                  {uploading ? <Loader2 className="animate-spin" /> : editingProduct ? 'Update Piece' : 'Add to Collection'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
