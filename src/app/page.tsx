'use client';

import { useState, useEffect } from 'react';
import { MENU_ITEMS } from '@/lib/data';
import { MenuItem, OrderItem } from '@/types';
import { ShoppingCart, Plus, Minus, CheckCircle, Search, Utensils, ArrowRight, Star, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PayPalButton from '@/components/PayPalButton';

export default function Home() {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(MENU_ITEMS.map(item => item.category)))];

  const filteredItems = MENU_ITEMS.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing && existing.quantity > 1) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async (e?: React.FormEvent, paypalDetails?: any) => {
    if (e) e.preventDefault();
    console.log('DEBUG: handleCheckout started');
    
    // Check name and phone FIRST
    if (!customerName || !customerPhone) {
      console.log('DEBUG: Missing name or phone, aborting');
      alert('Please provide your name and contact information BEFORE paying.');
      return;
    }

    if (cart.length === 0) {
      console.log('DEBUG: Cart is empty, aborting');
      return;
    }

    try {
      console.log('DEBUG: Sending fetch request to /api/orders...');
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          items: cart,
          total,
          orderID: paypalDetails?.id, // PayPal order ID for verification
        }),
      });

      console.log('DEBUG: Response received, status:', response.status);
      const data = await response.json();
      console.log('DEBUG: Response data:', data);

      if (!response.ok) throw new Error(data.error || 'Failed to place order');

      console.log('DEBUG: Order successful!');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setIsOrdered(true);
    } catch (error: any) {
      console.error('DEBUG: Checkout error caught:', error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="pb-32">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden bg-brand-800">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute inset-0 bg-gradient-to-b from-brand-900 via-brand-800/20 to-brand-900 z-10" />
          {/* Using an existing image as fallback for the hero */}
          <div className="w-full h-full bg-[url('/images/chessBurger.jpeg')] bg-cover bg-center" />
        </div>
        
        <div className="relative z-20 text-center px-8 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <span className="text-[10px] uppercase tracking-[0.5em] text-brand-300 font-bold mb-4 block">Est. 2026</span>
            <h1 className="text-6xl md:text-8xl font-serif text-white mb-8 leading-tight">
              The Art of <br /> <span className="italic text-brand-400">Fine Dining</span>
            </h1>
            <p className="text-brand-100 font-light text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-12">
              A curated selection of seasonal flavors, meticulously prepared for those who appreciate the finer things in life.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8">
              <button className="bg-brand-500 text-white px-16 py-6 uppercase tracking-widest text-xs font-bold hover:bg-brand-600 transition-all shadow-xl">Explore Menu</button>
              <button className="text-white text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-4 group">
                Our Story <div className="w-12 h-[1px] bg-brand-400 group-hover:w-20 transition-all" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-8 -mt-20 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-24">
            {/* Search & Filters */}
            <div className="bg-white p-12 shadow-2xl border-t-4 border-brand-500">
              <div className="flex flex-col md:flex-row items-end gap-12">
                <div className="flex-1 w-full">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-brand-600 font-bold mb-4 block">Search</span>
                  <input 
                    type="text"
                    placeholder="Search the collection..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-luxury text-2xl text-brand-900"
                  />
                </div>
                <div className="flex gap-8 overflow-x-auto no-scrollbar pb-1">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-[10px] uppercase tracking-[0.3em] font-bold py-2 transition-all border-b-4 ${
                        selectedCategory === cat 
                        ? 'border-brand-500 text-brand-800' 
                        : 'border-transparent text-brand-300 hover:text-brand-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Menu Grid */}
            <motion.div layout className="space-y-16">
              <AnimatePresence mode='popLayout'>
                {filteredItems.map(item => (
                  <motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="group flex flex-col md:flex-row gap-12 items-center bg-white p-6 shadow-lg border-r-4 border-brand-100 hover:border-brand-500 transition-all"
                  >
                    <div className="w-full md:w-1/3 aspect-[4/5] bg-brand-100 overflow-hidden relative">
                      <div className="absolute inset-0 bg-brand-900/10 group-hover:bg-transparent transition-colors duration-700" />
                      <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-1000" style={{ backgroundImage: `url('${item.image}')` }} />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="flex justify-between items-baseline border-b-2 border-brand-50 pb-4">
                        <h3 className="text-3xl font-serif text-brand-800">{item.name}</h3>
                        <span className="text-2xl font-bold text-brand-600">${item.price.toFixed(2)}</span>
                      </div>
                      <p className="text-brand-700 font-light leading-relaxed text-lg">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-8 pt-4">
                        <button
                          onClick={() => addToCart(item)}
                          className="bg-brand-600 text-white px-6 py-3 text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-3 hover:bg-brand-700 transition-colors shadow-md"
                        >
                          <Plus size={16} /> Add to Collection
                        </button>
                        <span className="text-[10px] uppercase tracking-[0.3em] text-brand-400 font-bold">{item.category}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Cart Sidebar */}
          <aside className="lg:col-span-4">
            <div className="bg-brand-900 text-white p-12 sticky top-32 shadow-2xl border-t-8 border-brand-500">
              <h2 className="text-3xl font-serif mb-12 flex items-center justify-between">
                <span>The Selection</span>
                {cart.length > 0 && (
                  <span className="text-xs font-sans font-bold uppercase tracking-widest bg-brand-500 text-white px-3 py-1 rounded-full">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </h2>
              
              <AnimatePresence>
                {isOrdered && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-green-500/20 border-2 border-green-500 p-8 mb-12 text-center"
                  >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <p className="text-xl font-serif text-white mb-2">Order Confirmed!</p>
                    <p className="text-sm font-light text-brand-200">Your order has been placed successfully. We'll have it ready for pickup soon.</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {cart.length === 0 && !isOrdered ? (
                <div className="py-20 text-center space-y-6">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-brand-500 font-bold">Empty Selection</p>
                </div>
              ) : cart.length === 0 ? null : (
                <>
                  <div className="space-y-8 mb-12 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar">
                    {cart.map(item => (
                      <motion.div 
                        key={item.id}
                        layout
                        className="flex justify-between items-start group border-b border-white/5 pb-4"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-bold tracking-wide text-white">{item.name}</p>
                          <p className="text-xs text-brand-400 font-bold uppercase tracking-widest">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <button onClick={() => removeFromCart(item.id)} className="text-brand-400 hover:text-white transition-colors"><Minus size={14} /></button>
                          <span className="text-sm font-bold text-brand-200">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="text-brand-400 hover:text-white transition-colors"><Plus size={14} /></button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  <div className="border-t-2 border-brand-800 pt-8 mb-12">
                    <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.3em] font-bold text-brand-400 mb-4">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-4xl font-serif">
                      <span>Total</span>
                      <span className="text-brand-400">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-400">Guest Name</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full bg-brand-800 border-none py-4 px-4 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium text-white"
                        placeholder="Name for the reservation"
                      />
                    </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-400">Contact</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      className="w-full bg-brand-800 border-none py-4 px-4 focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm font-medium text-white"
                      placeholder="Phone number"
                    />
                  </div>
                  
                  <div className="pt-4">
                    {!customerName || !customerPhone ? (
                      <div className="bg-brand-800 p-4 text-center border border-brand-500/30 rounded-xl">
                        <p className="text-[10px] uppercase tracking-widest text-brand-400 font-bold">
                          Please enter your name and phone above to enable payment
                        </p>
                      </div>
                    ) : (
                      <PayPalButton 
                        amount={total.toFixed(2)}
                        onSuccess={(details) => {
                          console.log('DEBUG: PayPal Success, details:', details);
                          handleCheckout(undefined, details);
                        }}
                        onError={(err) => {
                          console.error('DEBUG: PayPal Error:', err);
                          alert("There was an error with the PayPal payment. Please try again.");
                        }}
                      />
                    )}
                  </div>
                </form>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
