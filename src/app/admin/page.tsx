'use client';

import { useState, useEffect } from 'react';
import { Order, OrderStatus } from '@/types';
import { Clock, Check, Package, XCircle, RefreshCcw, User, Phone, DollarSign, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      
      const mappedOrders = data.map((o: any) => ({
        id: o.id,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        total: parseFloat(o.total),
        status: o.status,
        createdAt: o.createdAt,
        items: o.items.map((i: any) => ({
          name: i.name,
          price: parseFloat(i.price),
          quantity: i.quantity
        }))
      }));
      
      setOrders(mappedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      loadOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const statusStyles = {
    pending: 'bg-brand-100 text-brand-700 border-brand-200',
    preparing: 'bg-blue-50 text-blue-700 border-blue-100',
    ready: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
    completed: 'bg-gray-50 text-gray-500 border-gray-100',
    cancelled: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <div className="bg-white min-h-screen py-20 px-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8 border-b border-brand-100 pb-12">
          <div className="space-y-4">
            <span className="text-[10px] uppercase tracking-[0.5em] text-brand-gold font-bold">Management</span>
            <h2 className="text-5xl font-serif text-brand-900 italic">Concierge Dashboard</h2>
            <p className="text-brand-400 font-light tracking-wide">Orchestrating the perfect guest experience.</p>
          </div>
          <button 
            onClick={loadOrders}
            className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-900 flex items-center gap-4 group"
          >
            <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-700" />
            Sync Feed
          </button>
        </header>

        <div className="grid grid-cols-1 gap-12">
          <AnimatePresence mode='popLayout'>
            {orders.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-40 text-center border border-dashed border-brand-100"
              >
                <p className="text-[10px] uppercase tracking-[0.4em] text-brand-200 font-bold italic">No active selections</p>
              </motion.div>
            ) : (
              orders.map(order => (
                <motion.div 
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="bg-white border-b border-brand-100 pb-12 group"
                >
                  <div className="flex flex-col lg:flex-row gap-16">
                    <div className="flex-1 space-y-8">
                      <div className="flex items-center gap-6">
                        <span className={`text-[10px] uppercase tracking-[0.3em] font-black px-4 py-1 border rounded-full ${statusStyles[order.status]}`}>
                          {order.status}
                        </span>
                        <div className="h-[1px] flex-1 bg-brand-50" />
                        <span className="text-[10px] uppercase tracking-[0.3em] text-brand-300 font-bold">
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <h3 className="text-3xl font-serif text-brand-900">{order.customerName}</h3>
                          <div className="flex items-center gap-3 text-brand-400 text-sm font-light">
                            <Phone size={14} />
                            <span>{order.customerPhone}</span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold">The Selection</div>
                          <div className="space-y-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm font-light text-brand-700">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="opacity-40">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:w-72 space-y-8">
                      <div className="p-8 bg-brand-50 space-y-2">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-brand-400 font-bold">Total Investment</p>
                        <p className="text-3xl font-serif text-brand-900">${order.total.toFixed(2)}</p>
                      </div>

                      <div className="space-y-3">
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'preparing')}
                            className="w-full bg-brand-900 text-white py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-gold transition-all"
                          >
                            Commence Preparation
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'ready')}
                            className="w-full bg-brand-gold text-brand-900 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-900 hover:text-white transition-all"
                          >
                            Mark as Curated
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'completed')}
                            className="w-full border border-brand-900 text-brand-900 py-5 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-brand-900 hover:text-white transition-all"
                          >
                            Finalize Handover
                          </button>
                        )}
                        {order.status !== 'completed' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'cancelled')}
                            className="w-full text-[10px] uppercase tracking-[0.3em] font-bold text-red-300 hover:text-red-600 transition-all py-2"
                          >
                            Void Selection
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
