import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { CartProvider, useCart } from './lib/cart';
import { WishlistProvider, useWishlist } from './lib/wishlist';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Instagram, Facebook, Phone, Mail, MapPin, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Orders = lazy(() => import('./pages/Orders'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const LoginModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { login, loginWithEmail, registerWithEmail } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLogin, setIsLogin] = React.useState(true);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await login();
      onClose();
    } catch (err: any) {
      setError('Google login failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-brand-blue/20 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white w-full max-w-md p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden my-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-brand-blue/5 rounded-full text-brand-blue">
          <X size={20} />
        </button>

        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif mb-2 text-brand-blue">
            {isLogin ? 'Client Access' : 'Create Account'}
          </h2>
          <p className="text-[10px] uppercase tracking-widest font-bold opacity-40 text-brand-blue">
            {isLogin ? 'Enter your bespoke portal' : 'Join our luxury collective'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 px-4 text-brand-blue">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sales@zebbaingroup.store"
              className="w-full bg-brand-light border-none px-6 py-3 sm:py-4 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue/20 text-brand-blue placeholder:text-brand-blue/20"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold opacity-40 px-4 text-brand-blue">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-brand-light border-none px-6 py-3 sm:py-4 rounded-2xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-blue/20 text-brand-blue placeholder:text-brand-blue/20"
              required
            />
          </div>

          {error && <p className="text-red-700 text-[10px] uppercase font-bold text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-brand-blue text-white py-3 sm:py-4 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold shadow-lg hover:bg-brand-blue/90 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isLogin ? 'Sign In' : 'Register')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] uppercase tracking-widest font-bold text-brand-blue opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>

        <div className="relative my-6 sm:my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-blue/10"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-brand-blue/30 bg-white px-4">Or continue with</div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          type="button" 
          disabled={loading}
          className="w-full border border-brand-blue/10 py-3 sm:py-4 rounded-full text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-brand-blue/5 transition-all cursor-pointer flex items-center justify-center gap-2 text-brand-blue"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="" className="w-4 h-4" />
          Google
        </button>
      </motion.div>
    </div>
  );
};

const Header = () => {
  const { user, profile, logout } = useAuth();
  const { items } = useCart();
  const { wishlistItems } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-brand-blue/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-2xl font-serif tracking-widest uppercase flex flex-col items-center text-brand-blue">
          <span className="font-bold">Zebbain</span>
          <span className="text-[10px] tracking-[0.4em] -mt-1 opacity-60">Group</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-12 text-xs uppercase tracking-widest font-medium text-brand-blue">
          <Link to="/products" className="hover:opacity-50 transition-opacity">Catalog</Link>
          <Link to="/" className="hover:opacity-50 transition-opacity">About</Link>
          <button className="hover:opacity-50 transition-opacity cursor-pointer">Contact</button>
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-brand-blue">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="text-xs uppercase tracking-widest hover:opacity-50 font-medium">Account</Link>
                {profile?.role === 'admin' && (
                  <Link to="/admin" className="text-xs uppercase tracking-widest font-bold">Admin</Link>
                )}
                <button onClick={logout} className="p-2 hover:bg-brand-blue/5 rounded-full cursor-pointer"><LogOut size={18} /></button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoginOpen(true)} 
                className="flex items-center gap-2 text-xs uppercase tracking-widest border border-brand-blue/20 px-4 py-2 hover:bg-brand-blue hover:text-white transition-all cursor-pointer"
              >
                <UserIcon size={14} /> Login
              </button>
            )}
          </div>

          <Link to="/profile" className="relative p-2 hover:bg-brand-blue/5 rounded-full text-brand-blue" title="Wishlist">
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative p-2 hover:bg-brand-blue/5 rounded-full text-brand-blue">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-blue text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <button className="md:hidden p-2 text-brand-blue" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-brand-blue/10 p-6 flex flex-col gap-6"
          >
            <Link to="/products" className="text-lg font-serif" onClick={() => setIsMenuOpen(false)}>Catalog</Link>
            <Link to="/profile" className="text-lg font-serif" onClick={() => setIsMenuOpen(false)}>My Account</Link>
            {user ? (
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="text-left text-lg font-serif">Logout</button>
            ) : (
              <button onClick={() => { setIsLoginOpen(true); setIsMenuOpen(false); }} className="text-left text-lg font-serif">Login</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-brand-blue text-white py-20 px-6 mt-20">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="text-2xl font-serif tracking-widest uppercase mb-6">
          <span className="font-bold">Zebbain</span>
          <span className="text-[10px] tracking-[0.4em] block opacity-60">Group</span>
        </div>
        <p className="font-serif italic text-lg opacity-70 max-w-sm mb-8">
          Crafting premium custom furniture for the modern home. High-end design, artisanal quality.
        </p>
        <div className="flex gap-4">
          <Facebook size={20} className="opacity-50 hover:opacity-100 cursor-pointer" />
          <Instagram size={20} className="opacity-50 hover:opacity-100 cursor-pointer" />
        </div>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 opacity-40">Contact</h4>
        <ul className="flex flex-col gap-4 text-sm font-medium">
          <li className="flex items-center gap-3"><Phone size={16} className="opacity-50" /> +27 78 618 8934</li>
          <li className="flex items-center gap-3"><Mail size={16} className="opacity-50" /> sales@zebbaingroup.store</li>
          <li className="flex items-start gap-3">
            <MapPin size={16} className="opacity-50 mt-1" />
            <span>121 High Road, Bredell,<br />Kempton Park, GP, SA</span>
          </li>
        </ul>
      </div>

      <div>
        <h4 className="text-xs uppercase tracking-[0.2em] font-bold mb-6 opacity-40">Links</h4>
        <ul className="flex flex-col gap-4 text-sm font-medium opacity-70">
          <li><Link to="/products">Catalog</Link></li>
          <li><Link to="/profile">My Wishlist</Link></li>
          <li><Link to="/orders">Order Tracking</Link></li>
          <li><Link to="/">Terms of Service</Link></li>
          <li><Link to="/">Refund Policy</Link></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/10 text-[10px] uppercase tracking-widest opacity-30 text-center">
      © {new Date().getFullYear()} Zebbain Group. All rights reserved.
    </div>
  </footer>
);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                <Suspense fallback={
                  <div className="h-screen flex items-center justify-center font-serif italic text-2xl animate-pulse">
                    Zebbain...
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
