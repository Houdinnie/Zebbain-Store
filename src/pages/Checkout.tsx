import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useCart } from '../lib/cart';
import { db, storage } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion } from 'motion/react';
import { ShieldCheck, Landmark, Upload, Loader2, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

const Checkout = () => {
  const { user, profile, login } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-40 text-center">
        <h1 className="text-4xl font-serif mb-8 text-brand-blue">Please Sign In</h1>
        <p className="opacity-60 mb-10">You need to be logged in to place an order and track your status.</p>
        <button onClick={login} className="bg-brand-blue text-white px-10 py-4 text-xs uppercase tracking-widest font-bold cursor-pointer hover:bg-brand-blue/90 shadow-lg">
          Sign In with Google
        </button>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 5MB Limit
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File is too large. Proof of Payment must be under 5MB.');
        setFile(null);
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload a PDF or Image (JPG, PNG).');
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setError('');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Proof of Payment is required to place your order.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upload PoP to Storage
      let popUrl = '';
      try {
        const storageRef = ref(storage, `pop/${user.uid}_${Date.now()}_${file.name}`);
        const uploadResult = await uploadBytes(storageRef, file);
        popUrl = await getDownloadURL(uploadResult.ref);
      } catch (storageErr: any) {
        console.error('Storage Error:', storageErr);
        if (storageErr.code === 'storage/unauthorized') {
          throw new Error('You do not have permission to upload files. Please sign in again.');
        } else if (storageErr.code === 'storage/quota-exceeded') {
          throw new Error('Our storage quota has been exceeded. Please contact sales@zebbaingroup.store.');
        } else {
          throw new Error('Failed to upload Proof of Payment. Please check your internet connection.');
        }
      }

      // 2. Create Order in Firestore
      try {
        const orderData = {
          userId: user.uid,
          customerName: profile?.name || user.displayName,
          customerEmail: user.email,
          items: items,
          totalAmount: subtotal,
          status: 'Pending',
          popUrl: popUrl,
          createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'orders'), orderData);
        
        // 3. Success!
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1e3a8a', '#ffffff', '#f0f4f8']
        });

        // 4. WhatsApp Integration
        const message = `Hello Zebbain Group! I've just placed an order. \n\nOrder ID: ${docRef.id}\nCustomer: ${orderData.customerName}\nAmount: R${subtotal.toLocaleString()}\n\nI have uploaded my Proof of Payment to the platform.`;
        const whatsappUrl = `https://wa.me/27786188934?text=${encodeURIComponent(message)}`;
        
        clearCart();
        
        if (window.confirm('Order placed successfully! Would you like to send a confirmation WhatsApp to our team?')) {
          window.open(whatsappUrl, '_blank');
        }
        
        navigate('/orders');
      } catch (firestoreErr: any) {
        console.error('Firestore Error:', firestoreErr);
        throw new Error('Your payment was uploaded, but we failed to create the order record. Please contact us via WhatsApp immediately with your PoP.');
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again or contact support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-5xl font-serif mb-16 text-center text-brand-blue">Complete Your Purchase</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Step 1: Banking Details */}
        <div className="space-y-10">
          <div className="bg-white p-10 rounded-3xl border border-brand-blue/5 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center">
                <Landmark size={20} className="text-brand-blue opacity-50" />
              </div>
              <h2 className="text-sm uppercase tracking-widest font-bold text-brand-blue">1. Payment Details</h2>
            </div>

            <div className="space-y-6">
              <p className="text-sm opacity-60 leading-relaxed font-sans font-light">
                Please make a manual EFT payment to the following account and upload your transaction slip below.
              </p>
              
              <div className="p-6 bg-brand-light rounded-2xl space-y-4 font-mono text-sm leading-relaxed border border-brand-blue/5">
                <div className="border-b border-brand-blue/10 pb-2">
                   <div className="opacity-40 uppercase text-[10px]">Account Name</div>
                   <div className="font-bold text-brand-blue">Zebbain Group</div>
                </div>
                <div className="border-b border-brand-blue/10 pb-2">
                   <div className="opacity-40 uppercase text-[10px]">Bank / Branch</div>
                   <div className="font-bold text-brand-blue">FNB | Woodbridge</div>
                </div>
                <div>
                   <div className="opacity-40 uppercase text-[10px]">Account Number</div>
                   <div className="font-bold tracking-widest text-brand-blue">62366888444</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-brand-light text-brand-blue rounded-xl text-xs font-medium border border-brand-blue/10">
                <ShieldCheck size={16} />
                Your order will be processed once payment is confirmed.
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Upload PoP */}
        <div className="space-y-10">
          <form onSubmit={handlePlaceOrder} className="bg-white p-10 rounded-3xl border border-brand-blue/5 shadow-sm h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-10 h-10 bg-brand-light rounded-full flex items-center justify-center">
                  <Upload size={20} className="text-brand-blue opacity-50" />
                </div>
                <h2 className="text-sm uppercase tracking-widest font-bold text-brand-blue">2. Proof of Payment</h2>
              </div>

              <div className="space-y-8">
                <div className="relative group">
                  <input 
                    type="file" 
                    id="pop-upload" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <label 
                    htmlFor="pop-upload"
                    className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
                      file ? 'bg-green-50 border-green-200' : 'bg-black/5 border-black/10 hover:border-black/30'
                    }`}
                  >
                    {file ? (
                      <div className="text-center p-4">
                        <ShieldCheck size={32} className="mx-auto mb-4 text-green-600" />
                        <div className="text-sm font-bold text-green-800 truncate max-w-[200px]">{file.name}</div>
                        <div className="text-[10px] uppercase opacity-50 mt-1">File Uploaded</div>
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload size={32} className="mx-auto mb-4 opacity-20" />
                        <div className="text-sm font-bold opacity-40">Choose File</div>
                        <div className="text-[10px] uppercase opacity-30 mt-1">PDF, JPG, PNG</div>
                      </div>
                    )}
                  </label>
                </div>

                {error && <div className="text-red-800 text-xs font-bold text-center">{error}</div>}
              </div>
            </div>

            <div className="mt-12 space-y-4">
              <div className="flex justify-between items-end mb-6">
                 <span className="text-[10px] uppercase tracking-widest font-bold opacity-40">Total Amount</span>
                 <span className="text-2xl font-sans font-bold text-brand-blue">R {subtotal.toLocaleString()}</span>
              </div>
              <button 
                type="submit"
                disabled={loading || !file}
                className={`w-full py-6 text-xs uppercase tracking-[0.2em] font-bold flex items-center justify-center gap-4 transition-all shadow-xl rounded-full ${
                  loading || !file ? 'bg-brand-blue/20 cursor-not-allowed text-white' : 'bg-brand-blue text-white hover:bg-brand-blue/90 cursor-pointer'
                }`}
              >
                {loading ? <Loader2 className="animate-spin" /> : <>Place Order <MessageCircle size={16} /></>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
