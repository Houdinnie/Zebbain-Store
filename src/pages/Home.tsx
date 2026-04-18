import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ChevronRight, Star, Phone, MessageCircle } from 'lucide-react';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/luxury-sofa-main/1920/1080" 
            alt="Artisan Leather Sofa" 
            className="w-full h-full object-cover brightness-[0.7]"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-light leading-tight mb-8">
              Art of <span className="italic">Custom</span> Comfort
            </h1>
            <p className="text-lg md:text-xl font-sans font-light tracking-wide opacity-80 mb-10 leading-relaxed">
              Zebbain Group brings you bespoke cabinetry and premium custom couches tailored to your unique lifestyle.
            </p>
            <div className="flex gap-4">
              <Link to="/products" className="bg-brand-blue text-white px-8 py-4 text-xs uppercase tracking-[0.2em] font-bold hover:bg-brand-blue/90 transition-colors flex items-center gap-3 group">
                Explore Catalog <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-10 right-10 hidden md:block">
          <div className="vertical-text text-white opacity-50">Est. 2023 • Johannesburg</div>
        </div>
      </section>

      {/* About Us Summary */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="relative"
          >
            <img 
              src="https://picsum.photos/seed/sofa-workshop/800/1000" 
              alt="Artisan Sofa Craftsmanship" 
              className="w-full h-auto aspect-[4/5] object-cover rounded-[40px]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-10 -right-10 bg-brand-light p-12 rounded-[40px] hidden md:block border border-brand-blue/5 shadow-2xl">
              <div className="text-4xl font-serif mb-2 text-brand-blue">100%</div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-40">Hand-Crafted in SA</div>
            </div>
          </motion.div>

          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] font-bold opacity-40 mb-6">Our Philosophy</h2>
            <h3 className="text-4xl md:text-5xl font-serif leading-tight mb-8">
              Every curve, every stitch, <span className="italic">defined</span> by you.
            </h3>
            <p className="text-lg font-sans font-light leading-relaxed opacity-70 mb-10">
              At Zebbain Group, we don't just sell furniture; we curate experiences. Our Kempton Park artisans transform your vision into tangible luxury, ensuring that every piece that leaves our studio is a masterpiece of comfort and design.
            </p>
            <Link to="/products" className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold border-b border-black pb-2 hover:opacity-50 transition-opacity">
              Learn more about our process <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Mini Grid */}
      <section className="py-24 px-6 bg-brand-light">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-sm uppercase tracking-[0.3em] font-bold opacity-40 mb-4 text-brand-blue">The Collection</h2>
              <h3 className="text-4xl font-serif italic text-brand-blue">Highlighted Designs</h3>
            </div>
            <Link to="/products" className="hidden md:block text-xs uppercase tracking-widest font-bold opacity-50 hover:opacity-100 transition-opacity">View All Products</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: "The Velvet Cloud", price: "R 18,500", img: "https://picsum.photos/seed/velvet-sofa/800/600" },
              { name: "Modernist Sectional", price: "R 24,900", img: "https://picsum.photos/seed/modern-couch/800/600" },
              { name: "Artisan Leather Wing", price: "R 15,400", img: "https://picsum.photos/seed/leather-armchair/800/600" },
            ].map((product, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/5] mb-6 overflow-hidden rounded-2xl">
                  <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full">New Arrival</div>
                </div>
                <h4 className="text-xl font-serif mb-1 group-hover:italic transition-all">{product.name}</h4>
                <div className="flex justify-between items-center opacity-70">
                  <span className="text-sm font-sans uppercase tracking-widest">{product.price}</span>
                  <div className="flex gap-1">
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                    <Star size={10} fill="currentColor" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Map & Contact Section */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20 items-stretch">
          <div>
            <h2 className="text-sm uppercase tracking-[0.3em] font-bold opacity-40 mb-6 text-brand-blue text-center md:text-left">Experience Zebbain</h2>
            <h3 className="text-4xl md:text-5xl font-serif mb-8 leading-tight text-brand-blue">Visit our Bredell Studio</h3>
            <p className="text-lg font-sans font-light opacity-60 leading-relaxed mb-10">
              Touch the fabrics, test the springs, and consult with our master designers in person. We are located at 121 High Road, Bredell, Kempton Park.
            </p>
          </div>
          
          <div className="w-full md:w-1/2 space-y-12 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
               <a href="tel:+27786188934" className="block p-8 bg-brand-light rounded-3xl hover:-translate-y-1 transition-transform border border-brand-blue/5">
                  <Phone size={24} className="mb-4 text-brand-blue opacity-40" />
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-30 mb-1">Call Us</div>
                  <div className="font-bold text-brand-blue">+27 78 618 8934</div>
               </a>
               <a href="https://wa.me/27786188934" className="block p-8 bg-brand-light rounded-3xl hover:-translate-y-1 transition-transform border border-brand-blue/5">
                  <MessageCircle size={24} className="mb-4 text-green-700" />
                  <div className="text-[10px] uppercase font-bold tracking-widest opacity-30 mb-1">WhatsApp</div>
                  <div className="font-bold">Chat Live</div>
               </a>
            </div>

            <div className="h-[400px] rounded-[40px] overflow-hidden shadow-2xl relative grayscale hover:grayscale-0 transition-all duration-1000 border border-brand-blue/5">
               <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3586.223405763523!2d28.2818!3d-26.0712!2m3!1f0!2f0!3f0!3m2!1i1024!2i744!4f13.1!3m3!1m2!1s0x1e95146c98188151%3A0x7d06680a6b720448!2s121%20High%20Rd%2C%20Bredell%20AH%2C%20Kempton%20Park!5e0!3m2!1sen!2sza!4v1713476400000!5m2!1sen!2sza" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Office Location"
               />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
