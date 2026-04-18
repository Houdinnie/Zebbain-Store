import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCart } from '../lib/cart';
import { useWishlist } from '../lib/wishlist';
import { motion } from 'motion/react';
import { ChevronLeft, ShoppingCart, Shield, Truck, Eraser, Heart, Facebook, Twitter, MessageCircle, Link2, Check } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [copied, setCopied] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
  };

  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(product.name)}`, '_blank');
  };

  const shareOnWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(product.name + ' ' + window.location.href)}`, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      } else {
        navigate('/products');
      }
      setLoading(false);
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-serif italic text-2xl animate-pulse">
      Curating piece...
    </div>
  );

  if (!product) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <Link to="/products" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold opacity-40 hover:opacity-100 transition-opacity mb-12">
        <ChevronLeft size={14} /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24">
        {/* Gallery */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm"
          >
            <img 
              src={product.images?.[activeImage] || 'https://picsum.photos/seed/couch/1000/1000'} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          {product.images?.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative flex-shrink-0 w-24 aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-brand-blue' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="mb-8">
            <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-40 mb-4 text-brand-blue">{product.category}</h2>
            <h1 className="text-4xl md:text-5xl font-serif mb-6 leading-tight capitalize text-brand-blue">{product.name}</h1>
            <div className="text-3xl font-sans font-light text-brand-blue">R {product.price?.toLocaleString()}</div>
          </div>

          <p className="text-lg font-sans font-light leading-relaxed opacity-70 mb-12">
            {product.description || "A masterfully crafted piece designed for both elegance and extreme comfort. Each of our custom couches is built to last a lifetime using premium South African materials."}
          </p>

          <div className="grid grid-cols-2 gap-8 mb-12 border-y border-black/5 py-8">
            <div className="flex items-center gap-3">
              <Shield size={20} className="opacity-30" />
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold">Guarantee</div>
                <div className="text-xs opacity-50">5 Year Framework</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck size={20} className="opacity-30" />
              <div>
                <div className="text-[10px] uppercase tracking-widest font-bold">Delivery</div>
                <div className="text-xs opacity-50">Local Kempton Park</div>
              </div>
            </div>
          </div>

          <div className="space-y-6 sticky bottom-6 lg:relative lg:bottom-0">
             <div className="flex gap-4">
               <button 
                  onClick={() => addToCart(product)}
                  className="flex-grow bg-brand-blue text-white py-6 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-4 hover:bg-brand-blue/90 transition-all shadow-xl rounded-full cursor-pointer"
               >
                 <ShoppingCart size={18} /> Add to Collection
               </button>
               <button 
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-6 border border-brand-blue/10 rounded-full shadow-sm hover:border-brand-blue transition-all cursor-pointer ${isInWishlist(product.id) ? 'bg-red-50' : 'bg-white'}`}
                  title="Save to Wishlist"
               >
                 <Heart size={20} className={`${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-brand-blue'}`} />
               </button>
             </div>
             <div className="text-[10px] text-center uppercase tracking-widest opacity-40 font-bold text-brand-blue">
               Bespoke options available on request
             </div>

             <div className="flex items-center justify-center gap-6 pt-6 border-t border-brand-blue/5">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 text-brand-blue">Share Piece</span>
                <div className="flex gap-4">
                  <button onClick={shareOnFacebook} className="p-2 hover:bg-brand-blue/5 rounded-full transition-colors cursor-pointer text-brand-blue/40 hover:text-brand-blue" title="Share on Facebook">
                    <Facebook size={16} />
                  </button>
                  <button onClick={shareOnTwitter} className="p-2 hover:bg-brand-blue/5 rounded-full transition-colors cursor-pointer text-brand-blue/40 hover:text-brand-blue" title="Share on Twitter">
                    <Twitter size={16} />
                  </button>
                  <button onClick={shareOnWhatsApp} className="p-2 hover:bg-brand-blue/5 rounded-full transition-colors cursor-pointer text-brand-blue/40 hover:text-brand-blue" title="Share on WhatsApp">
                    <MessageCircle size={16} />
                  </button>
                  <button onClick={copyToClipboard} className="p-2 hover:bg-brand-blue/5 rounded-full transition-colors cursor-pointer text-brand-blue/40 hover:text-brand-blue" title="Copy Link">
                    {copied ? <Check size={16} className="text-green-600" /> : <Link2 size={16} />}
                  </button>
                </div>
             </div>
          </div>

          {product.specs && (
            <div className="mt-16">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold mb-6">Technical Specifications</h4>
              <div className="font-sans text-sm font-light leading-loose opacity-60 whitespace-pre-wrap">
                {product.specs}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
