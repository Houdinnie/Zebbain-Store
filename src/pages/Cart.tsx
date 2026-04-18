import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../lib/cart';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Cart = () => {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-40 text-center">
        <ShoppingBag size={48} className="mx-auto mb-8 opacity-10" />
        <h1 className="text-4xl font-serif mb-6">Your collection is empty.</h1>
        <p className="font-sans font-light opacity-60 mb-10">Start curating your space with our premium pieces.</p>
        <Link to="/products" className="inline-block bg-black text-white px-10 py-5 text-xs uppercase tracking-[0.2em] font-bold">
          Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-serif mb-16">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-10">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col sm:flex-row gap-8 pb-10 border-b border-black/5 last:border-0"
              >
                <Link to={`/product/${item.id}`} className="w-full sm:w-40 aspect-square rounded-2xl overflow-hidden bg-white shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </Link>

                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link to={`/product/${item.id}`} className="text-2xl font-serif hover:italic transition-all">
                        {item.name}
                      </Link>
                      <div className="text-sm font-sans font-medium opacity-50 mt-1">R {item.price.toLocaleString()}</div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 hover:bg-black/5 rounded-full text-red-800 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-8">
                    <div className="flex items-center gap-4 bg-white border border-black/5 rounded-full px-4 py-2">
                       <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:opacity-50"><Minus size={14} /></button>
                       <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                       <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:opacity-50"><Plus size={14} /></button>
                    </div>
                    <div className="text-xl font-sans font-medium">
                      R {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-32 h-fit space-y-8">
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-brand-blue/5">
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-10 text-brand-blue">Order Summary</h3>
            
            <div className="space-y-6 mb-10 pb-10 border-b border-brand-blue/10">
              <div className="flex justify-between text-sm">
                <span className="opacity-50">Subtotal</span>
                <span>R {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-50">Estimated Shipping</span>
                <span className="italic font-serif">Calculated at next step</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-10">
              <span className="text-xs uppercase tracking-widest font-bold">Total</span>
              <span className="text-3xl font-sans font-semibold text-brand-blue">R {subtotal.toLocaleString()}</span>
            </div>

            <Link 
              to="/checkout" 
              className="w-full bg-brand-blue text-white py-6 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-4 hover:bg-brand-blue/90 transition-all rounded-full shadow-lg"
            >
              Secure Checkout <ArrowRight size={16} />
            </Link>
          </div>

          <div className="p-8 border border-dashed border-brand-blue/20 rounded-3xl bg-brand-light">
            <p className="text-[10px] uppercase tracking-[0.1em] font-medium opacity-40 text-center leading-relaxed text-brand-blue">
              Manual EFT payment required after order placement. WhatsApp confirmation will be generated.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
