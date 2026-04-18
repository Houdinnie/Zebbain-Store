import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../lib/cart';
import { useWishlist } from '../lib/wishlist';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, SlidersHorizontal, Search, PlusCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const categories = ['All', 'Couches', 'Sectionals', 'Armchairs', 'Dining Chairs', 'Bespoke'];

  const filteredProducts = products
    .filter(p => filterCategory === 'All' || p.category === filterCategory)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0; // newest is default from firestore query
    });

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <header className="mb-20 text-center">
        <h1 className="text-5xl font-serif mb-4 text-brand-blue">Our Catalog</h1>
        <p className="font-serif italic text-lg opacity-60 text-brand-blue">Curated pieces for a lifestyle of elegance.</p>
      </header>

      {/* Filters & Controls */}
      <div className="flex flex-col md:flex-row gap-8 justify-between items-center mb-16 pb-8 border-b border-brand-blue/10">
        <div className="flex gap-4 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-6 py-2 text-[10px] uppercase tracking-[0.2em] font-bold rounded-full border transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === cat ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'border-brand-blue/10 text-brand-blue hover:border-brand-blue'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-blue opacity-30" />
            <input 
              type="text" 
              placeholder="Search pieces..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-brand-blue/10 rounded-full text-xs font-medium w-full md:w-64 focus:outline-none focus:border-brand-blue/30 text-brand-blue placeholder:text-brand-blue/30"
            />
          </div>
          
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent border-none text-[10px] uppercase tracking-widest font-bold focus:outline-none cursor-pointer text-brand-blue"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low-High</option>
            <option value="price-high">Price: High-Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/5] bg-black/5 rounded-2xl mb-4" />
              <div className="h-4 bg-black/5 rounded w-3/4 mb-2" />
              <div className="h-4 bg-black/5 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative"
              >
                <Link to={`/product/${product.id}`} className="block mb-6 overflow-hidden rounded-2xl aspect-[4/5] bg-white border border-brand-blue/5">
                  <img 
                    src={product.images?.[0] || 'https://picsum.photos/seed/couch/800/1000'} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-brand-blue/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                     <span className="text-[10px] uppercase tracking-widest font-bold text-white bg-brand-blue/70 backdrop-blur-md px-6 py-3 rounded-full">View Details</span>
                  </div>
                </Link>
                
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product.id); }}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/70 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all cursor-pointer"
                >
                  <Heart size={16} className={`${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-brand-blue'}`} />
                </button>
                
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-lg font-serif mb-1 group-hover:italic transition-all text-brand-blue">{product.name}</h4>
                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue">{product.category}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="p-2 hover:bg-brand-blue/5 rounded-full transition-colors cursor-pointer"
                    title="Add to Cart"
                  >
                    <PlusCircle size={20} className="text-brand-blue opacity-40 hover:opacity-100" />
                  </button>
                </div>
                <div className="mt-2 text-sm font-sans font-medium tracking-tight text-brand-blue">
                  R {product.price?.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="py-20 text-center opacity-40 font-serif italic text-xl">
          No pieces found in this collection.
        </div>
      )}
    </div>
  );
};

export default Products;
