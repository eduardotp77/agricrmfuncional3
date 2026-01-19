
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, Wand2, ShoppingCart, CheckCircle2, 
  ChevronRight, ArrowLeft, Search, Package, 
  AlertTriangle, Clock, CreditCard, Save,
  Minus, Plus, Trash2, Info, Calendar, LayoutGrid, List
} from 'lucide-react';
import { Client, Product, Order, OrderItem, PaymentMethod, SystemConfig } from '../types';
import { calculateB2BPrice } from '../utils/pricing';

interface SalesWizardProps {
  client?: Client; // Opcional si viene por prop
  products: Product[];
  onAddOrder?: (order: Order) => void;
  onClose?: () => void;
}

type WizardStep = 'MAGIC' | 'CATALOG' | 'REVIEW';

const SalesWizard: React.FC<SalesWizardProps> = ({ client: propClient, products, onAddOrder, onClose }) => {
  // 0. Cargar Configuración del Cerebro
  const systemConfig: SystemConfig = useMemo(() => {
    const saved = localStorage.getItem('agri_system_config');
    return saved ? JSON.parse(saved) : { 
      routes: [], noSaleReasons: [], sellers: [], priceListDetails: [], 
      globalConfig: { iva: 19, tax1: 0 } 
    };
  }, []);

  // 1. Inicialización y Contexto
  const [step, setStep] = useState<WizardStep>('MAGIC');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [comments, setComments] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CONTADO');

  // Recuperar cliente por URL si no viene por prop
  const activeClient = useMemo(() => {
    if (propClient) return propClient;
    const params = new URLSearchParams(window.location.search);
    const clientId = params.get('clienteId');
    if (!clientId) return null;
    
    const savedClients = JSON.parse(localStorage.getItem('agri_clients') || '[]');
    return savedClients.find((c: Client) => c.id === clientId) || null;
  }, [propClient]);

  // Alertas de Cartera
  const creditAlert = useMemo(() => {
    if (!activeClient) return null;
    const isOverLimit = activeClient.currentDebt > activeClient.creditLimit;
    const debtRatio = activeClient.creditLimit > 0 ? (activeClient.currentDebt / activeClient.creditLimit) * 100 : 0;
    return { isOverLimit, debtRatio };
  }, [activeClient]);

  // Lógica de Sugeridos (Simulada)
  const suggestedProducts = useMemo(() => {
    return [...products]
      .sort(() => 0.5 - Math.random())
      .slice(0, 4);
  }, [products]);

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Cálculos del Carrito DINÁMICOS basándose en ConfigModule
  const totals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const ivaRate = (systemConfig.globalConfig.iva || 19) / 100;
    const tax1Rate = (systemConfig.globalConfig.tax1 || 0) / 100;
    
    const tax = subtotal * ivaRate;
    const tax1 = subtotal * tax1Rate;
    const total = subtotal + tax + tax1;
    
    return { subtotal, tax, tax1, total, count: cart.reduce((sum, item) => sum + item.quantity, 0) };
  }, [cart, systemConfig]);

  // Handlers
  const updateCart = (product: Product, delta: number) => {
    if (!activeClient) return;
    
    // Obtener precio B2B según matriz
    const pricing = calculateB2BPrice(activeClient, product, systemConfig);

    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        const newQty = Math.max(0, existing.quantity + delta);
        if (newQty === 0) return prev.filter(i => i.productId !== product.id);
        return prev.map(i => i.productId === product.id ? { 
          ...i, 
          quantity: newQty, 
          total: newQty * pricing.price 
        } : i);
      }
      if (delta > 0) {
        return [...prev, {
          productId: product.id,
          productCode: product.code,
          description: product.name,
          quantity: delta,
          unitPrice: pricing.price,
          tax: pricing.price * ((systemConfig.globalConfig.iva || 19) / 100),
          discount: 0,
          total: delta * pricing.price
        }];
      }
      return prev;
    });
  };

  const handleFinalize = () => {
    if (!activeClient) return;
    
    const newOrder: Order = {
      id: `PED-${Date.now()}`,
      date: new Date().toISOString(),
      clientId: activeClient.id,
      clientName: activeClient.name,
      sellerId: 'VEND-01', 
      vendorName: 'Vendedor Actual',
      items: cart,
      status: 'Creado',
      subtotal: totals.subtotal,
      totalTax: totals.tax,
      totalDiscount: 0,
      totalAmount: totals.total,
      total: totals.total,
      deliveryDate,
      paymentMethod,
      syncStatus: 'pending',
      comments
    };

    if (onAddOrder) {
      onAddOrder(newOrder);
    } else {
      const savedOrders = JSON.parse(localStorage.getItem('agri_orders') || '[]');
      localStorage.setItem('agri_orders', JSON.stringify([newOrder, ...savedOrders]));
    }
    
    alert("Pedido registrado exitosamente.");
    if (onClose) onClose(); else window.history.back();
  };

  if (!activeClient) {
    return (
      <div className="p-20 text-center space-y-4">
        <AlertTriangle size={64} className="text-amber-500 mx-auto" />
        <h3 className="text-xl font-black uppercase text-slate-800">Cliente no identificado</h3>
        <button onClick={() => window.history.back()} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px]">Volver a Rutas</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-500 pb-32">
      
      {/* HEADER DE PROGRESO */}
      <div className="bg-[#0f172a] text-white p-6 sticky top-0 z-[60] shadow-2xl">
         <div className="flex justify-between items-center mb-6">
            <button onClick={onClose || (() => window.history.back())} className="p-2 hover:bg-white/10 rounded-xl"><ArrowLeft size={20}/></button>
            <div className="text-center">
               <h2 className="text-xs font-black uppercase tracking-[0.3em] text-blue-400">Terminal de Ventas</h2>
               <p className="text-sm font-bold truncate max-w-[180px] uppercase tracking-tight">{activeClient.name}</p>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xs shadow-lg">
               {step === 'MAGIC' ? '1' : step === 'CATALOG' ? '2' : '3'}/3
            </div>
         </div>

         <div className="flex gap-2">
            {[1, 2, 3].map(i => (
               <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                 (i === 1 && (step === 'MAGIC' || step === 'CATALOG' || step === 'REVIEW')) ||
                 (i === 2 && (step === 'CATALOG' || step === 'REVIEW')) ||
                 (i === 3 && step === 'REVIEW') ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 'bg-white/10'
               }`}></div>
            ))}
         </div>
      </div>

      {/* BANNER DE DEUDA */}
      {creditAlert?.isOverLimit && (
        <div className="bg-red-600 text-white p-4 flex items-center gap-3 animate-pulse shadow-lg relative z-50">
           <AlertTriangle size={24} className="shrink-0" />
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest leading-none">Alerta: Cupo Excedido</p>
              <p className="text-xs font-bold">Deuda: ${activeClient.currentDebt.toLocaleString()} / Cupo: ${activeClient.creditLimit.toLocaleString()}</p>
           </div>
        </div>
      )}

      {/* CONTENIDO DEL STEP */}
      <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
         
         {/* STEP 1: MAGO SUGERIDOS */}
         {step === 'MAGIC' && (
           <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="flex items-center gap-3 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                 <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Wand2 size={24} /></div>
                 <div>
                    <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter">Sugeridos por IA</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basado en historial y temporada</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {suggestedProducts.map(p => {
                    const pricing = calculateB2BPrice(activeClient, p, systemConfig);
                    return (
                      <div key={p.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-blue-200 transition-all">
                         <div>
                            <div className="flex justify-between items-start mb-2">
                               <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black rounded uppercase tracking-widest inline-block">Top Reventa</span>
                               {pricing.isSpecial && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black rounded uppercase tracking-widest inline-block">Precio Especial</span>}
                            </div>
                            <h4 className="font-black text-slate-800 uppercase text-xs mb-1 leading-tight">{p.name}</h4>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mb-4">{p.presentation} | Stock: {p.inventory}</p>
                         </div>
                         <div className="flex items-center justify-between mt-4">
                            <div>
                               {pricing.isSpecial && <p className="text-[8px] text-slate-300 line-through font-bold">${p.basePrice.toLocaleString()}</p>}
                               <p className="text-lg font-black text-slate-900 tracking-tighter">${pricing.price.toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={() => updateCart(p, 1)}
                              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl active-scale"
                            >
                               Añadir
                            </button>
                         </div>
                      </div>
                    );
                 })}
              </div>

              <button 
                onClick={() => setStep('CATALOG')}
                className="w-full py-6 bg-[#0056b2] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3"
              >
                 Explorar Catálogo <ChevronRight size={18} />
              </button>
           </div>
         )}

         {/* STEP 2: CATÁLOGO FULL */}
         {step === 'CATALOG' && (
           <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="sticky top-24 z-50 space-y-3">
                 <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Buscar producto o código..."
                      className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] shadow-xl outline-none focus:ring-4 focus:ring-blue-500/10 font-bold text-sm"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
                 
                 <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button 
                      onClick={() => setSelectedCategory('')}
                      className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${!selectedCategory ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200'}`}
                    >
                       Todos
                    </button>
                    {categories.map(c => (
                       <button 
                         key={c}
                         onClick={() => setSelectedCategory(c)}
                         className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${selectedCategory === c ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200'}`}
                       >
                          {c}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="space-y-3">
                 {filteredProducts.map(p => {
                    const pricing = calculateB2BPrice(activeClient, p, systemConfig);
                    const inCart = cart.find(i => i.productId === p.id);
                    return (
                      <div key={p.id} className={`bg-white p-5 rounded-[2rem] border transition-all flex items-center justify-between group ${inCart ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-100'}`}>
                         <div className="flex-1 min-w-0 mr-4">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.code}</p>
                            <h4 className="font-black text-slate-800 uppercase text-[11px] leading-tight truncate">{p.name}</h4>
                            <div className="flex items-center gap-3 mt-1">
                               <p className="text-sm font-black text-blue-600 tracking-tighter">${pricing.price.toLocaleString()}</p>
                               {pricing.isSpecial && <span className="text-[7px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded uppercase">Especial B2B</span>}
                               {p.inventory < 10 && <span className="text-[8px] font-black text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase">Stock Bajo: {p.inventory}</span>}
                            </div>
                         </div>
                         
                         <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                            <button onClick={() => updateCart(p, -1)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><Minus size={16} /></button>
                            <div className="w-10 text-center font-black text-slate-900">{inCart?.quantity || 0}</div>
                            <button onClick={() => updateCart(p, 1)} className="w-10 h-10 flex items-center justify-center text-slate-900 hover:text-blue-600 transition-colors"><Plus size={16} /></button>
                         </div>
                      </div>
                    );
                 })}
              </div>
           </div>
         )}

         {/* STEP 3: REVISIÓN Y CIERRE */}
         {step === 'REVIEW' && (
           <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                 <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Resumen del Pedido</h3>
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">{cart.length} Items</span>
                 </div>
                 
                 <div className="divide-y divide-slate-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                    {cart.map(item => (
                      <div key={item.productId} className="p-5 flex justify-between items-center">
                         <div className="flex-1">
                            <p className="font-black text-slate-800 uppercase text-[10px]">{item.description}</p>
                            <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{item.quantity} Ud x ${item.unitPrice.toLocaleString()}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-black text-slate-900">${item.total.toLocaleString()}</p>
                            <button onClick={() => updateCart({ id: item.productId } as any, -item.quantity)} className="text-red-400 hover:text-red-600 mt-1"><Trash2 size={12} /></button>
                         </div>
                      </div>
                    ))}
                 </div>

                 <div className="p-8 bg-slate-900 text-white space-y-3">
                    <div className="flex justify-between items-center opacity-60 text-[9px] font-black uppercase tracking-widest">
                       <span>Subtotal</span>
                       <span>${totals.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center opacity-60 text-[9px] font-black uppercase tracking-widest">
                       <span>IVA ({systemConfig.globalConfig.iva || 19}%)</span>
                       <span>${totals.tax.toLocaleString()}</span>
                    </div>
                    {totals.tax1 > 0 && (
                      <div className="flex justify-between items-center opacity-60 text-[9px] font-black uppercase tracking-widest">
                         <span>Impuesto #1 ({systemConfig.globalConfig.tax1}%)</span>
                         <span>${totals.tax1.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-3 border-t border-white/10">
                       <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-400">Total a Pagar</span>
                       <span className="text-3xl font-black text-emerald-400 tracking-tighter">${totals.total.toLocaleString()}</span>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><Calendar size={14}/> Fecha de Entrega</label>
                    <input 
                      type="date" 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-500"
                      value={deliveryDate}
                      onChange={e => setDeliveryDate(e.target.value)}
                    />
                 </div>
                 <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2"><CreditCard size={14}/> Método de Pago</label>
                    <div className="flex gap-2">
                       {['CONTADO', 'CRÉDITO'].map(m => (
                         <button 
                           key={m}
                           onClick={() => setPaymentMethod(m as any)}
                           className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${paymentMethod === m ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                         >
                            {m}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
         )}
      </div>

      {/* BARRA INFERIOR DE ACCIÓN FIJA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
         <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden md:block">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Acumulado</p>
               <p className="text-xl font-black text-slate-900 tracking-tighter">${totals.total.toLocaleString()}</p>
            </div>
            
            <div className="flex-1 flex gap-3">
               {step !== 'MAGIC' && (
                 <button 
                   onClick={() => setStep(step === 'REVIEW' ? 'CATALOG' : 'MAGIC')}
                   className="flex-1 md:flex-none px-6 py-5 bg-slate-100 text-slate-600 rounded-3xl font-black uppercase text-[10px] tracking-widest active-scale"
                 >
                    Atrás
                 </button>
               )}
               
               {step !== 'REVIEW' ? (
                 <button 
                   onClick={() => setStep(step === 'MAGIC' ? 'CATALOG' : 'REVIEW')}
                   disabled={cart.length === 0}
                   className="flex-[2] py-5 bg-[#0056b2] text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-900/20 active-scale disabled:opacity-30 disabled:scale-100 transition-all flex items-center justify-center gap-3"
                 >
                    {step === 'MAGIC' ? 'Catálogo' : 'Revisar Carrito'} <ChevronRight size={18} />
                 </button>
               ) : (
                 <button 
                   onClick={handleFinalize}
                   className="flex-[2] py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-emerald-900/40 active-scale flex items-center justify-center gap-3"
                 >
                    <Save size={18} /> Confirmar Pedido
                 </button>
               )}
            </div>
         </div>
      </div>

    </div>
  );
};

export default SalesWizard;
