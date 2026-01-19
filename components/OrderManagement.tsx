
import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, Plus, Trash2, Send, Search, MapPin, ChevronRight, ArrowLeft, History, 
  X, ChevronDown, Zap, CheckCircle2, Loader2, DollarSign, Package, Users, Minus,
  TrendingUp, Clock, AlertTriangle
} from 'lucide-react';
import { Product, Order, OrderItem, Client, NoVentaReason, NoVentaRecord, RouteType, SyncStatus, PaymentMethod, ClientStatus } from '../types';

interface OrderManagementProps {
  products: Product[];
  clients: Client[];
  orders: Order[];
  onSaveOrder: (order: Order) => void;
  onSaveNoVenta: (record: NoVentaRecord) => void;
}

type OrderStep = 'main' | 'route_select' | 'client_select' | 'shopping' | 'cart_review' | 'submitting' | 'success' | 'noventa';

/**
 * OrderManagement Component - Handles the order creation flow and non-sale records
 */
const OrderManagement: React.FC<OrderManagementProps> = ({ products, clients, orders, onSaveOrder, onSaveNoVenta }) => {
  const [step, setStep] = useState<OrderStep>('main');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [comments, setComments] = useState('');

  // Handle order submission
  const handleCreateOrder = () => {
    if (!selectedClient) return;
    const total = cart.reduce((sum, item) => sum + item.total, 0);
    const newOrder: Order = {
      id: `PED-${Date.now()}`,
      date: new Date().toISOString(),
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      sellerId: 'USR-001',
      vendorName: 'Vendedor Demo',
      items: cart,
      status: 'Creado',
      subtotal: total / 1.19,
      totalAmount: total,
      totalTax: total - (total / 1.19),
      totalDiscount: 0,
      total: total,
      deliveryDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'CONTADO',
      syncStatus: 'pending',
      comments
    };
    onSaveOrder(newOrder);
    setStep('success');
  };

  // Success view
  if (step === 'success') {
    return (
      <div className="p-20 text-center animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
           <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter">¡Pedido Registrado!</h2>
        <p className="text-slate-500 mt-2 font-medium">El pedido ha sido incorporado al sistema de despacho.</p>
        <button onClick={() => { setStep('main'); setCart([]); setSelectedClient(null); }} className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Continuar Gestión</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
       <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Módulo de Ventas</h2>
            <p className="text-slate-500 text-sm font-medium">Terminal de toma de pedidos institucional.</p>
          </div>
          <button onClick={() => setStep('client_select')} className="bg-[#0056b2] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-3">
            <Plus size={18} /> Nuevo Pedido
          </button>
       </div>
       
       {step === 'client_select' && (
         <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Seleccionar Cliente del Maestro</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {clients.map(c => (
                 <button key={c.id} onClick={() => { setSelectedClient(c); setStep('shopping'); }} className="p-6 bg-white border border-slate-100 rounded-[2.5rem] text-left hover:border-blue-500 hover:shadow-xl transition-all group">
                    <p className="font-black text-slate-800 uppercase group-hover:text-blue-600 transition-colors">{c.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">NIT: {c.docNumber}</p>
                 </button>
               ))}
            </div>
         </div>
       )}

       {step === 'shopping' && selectedClient && (
         <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
               <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Atendiendo a:</p>
                  <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">{selectedClient.name}</h3>
               </div>
               <button onClick={() => setStep('cart_review')} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-3">
                  <ShoppingCart size={18} /> Ver Carrito ({cart.length})
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {products.map(p => (
                 <div key={p.code} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all group">
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">{p.code}</p>
                       <h4 className="font-black text-slate-800 uppercase text-xs leading-tight mb-4">{p.name}</h4>
                       <p className="text-lg font-black text-blue-600 tracking-tighter">${p.basePrice.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => {
                        const existing = cart.find(i => i.productId === p.id);
                        if (existing) {
                          setCart(cart.map(i => i.productId === p.id ? {...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice} : i));
                        } else {
                          setCart([...cart, { productId: p.id, productCode: p.code, description: p.name, quantity: 1, unitPrice: p.basePrice, tax: p.basePrice * 0.19, discount: 0, total: p.basePrice }]);
                        }
                      }}
                      className="mt-6 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                    >
                      Añadir
                    </button>
                 </div>
               ))}
            </div>
         </div>
       )}

       {step === 'cart_review' && (
         <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Resumen de la Orden</h3>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
               <div className="divide-y divide-slate-50">
                  {cart.map(item => (
                    <div key={item.productId} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                       <div className="flex-1">
                          <p className="font-black text-slate-800 uppercase text-xs">{item.description}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
                             {item.quantity} x ${item.unitPrice.toLocaleString()}
                          </p>
                       </div>
                       <div className="flex items-center gap-6">
                          <p className="font-black text-slate-900">${item.total.toLocaleString()}</p>
                          <button onClick={() => setCart(cart.filter(i => i.productId !== item.productId))} className="text-red-400 hover:text-red-600 transition-colors">
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>
                  ))}
                  {cart.length === 0 && (
                    <div className="p-12 text-center text-slate-300 font-bold italic">El carrito está vacío</div>
                  )}
               </div>
               
               <div className="p-8 bg-slate-900 text-white space-y-4">
                  <div className="flex justify-between items-center opacity-60">
                     <span className="text-[10px] font-black uppercase tracking-widest">Base Imponible</span>
                     <span className="text-sm font-bold">${(cart.reduce((s, i) => s + i.total, 0) / 1.19).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-black uppercase tracking-[0.2em]">Total Pedido</span>
                     <span className="text-3xl font-black text-emerald-400">${cart.reduce((s, i) => s + i.total, 0).toLocaleString()}</span>
                  </div>
                  <button 
                    disabled={cart.length === 0}
                    onClick={handleCreateOrder} 
                    className="w-full mt-6 py-6 bg-[#0056b2] text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:bg-blue-600 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100"
                  >
                     <Send size={20} /> Finalizar y Sincronizar
                  </button>
               </div>
            </div>
         </div>
       )}

       {step === 'main' && (
         <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Pedidos Recientes en Terminal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {orders.slice(0, 6).map(o => (
                 <div key={o.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center hover:shadow-md transition-all">
                    <div>
                       <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">{o.id}</p>
                       <p className="font-black text-slate-800 uppercase text-xs leading-none mb-2">{o.clientName}</p>
                       <p className="text-[9px] font-bold text-slate-400 uppercase">{o.date.split('T')[0]}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-slate-900 tracking-tighter">${o.total.toLocaleString()}</p>
                       <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">Sincronizado</span>
                    </div>
                 </div>
               ))}
               {orders.length === 0 && (
                 <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem] text-slate-200">
                    <History size={64} className="mx-auto mb-4 opacity-20" />
                    <p className="font-black uppercase tracking-widest text-xs">No hay historial en esta sesión</p>
                 </div>
               )}
            </div>
         </div>
       )}
    </div>
  );
};

export default OrderManagement;
