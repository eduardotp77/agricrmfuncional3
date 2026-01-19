
import React, { useState, useMemo } from 'react';
import { 
  Truck, CheckCircle2, XCircle, Navigation, Wallet, 
  Download, Search, Filter, AlertCircle, Phone, 
  MessageCircle, ArrowLeft, ChevronRight, Calculator,
  RotateCcw, Save, Printer, Share2, DollarSign, Package
} from 'lucide-react';
import { Delivery, PaymentMethod } from '../types';

interface DeliveryLogisticsProps {
  deliveries: Delivery[];
  onImportDeliveries: (d: Delivery[]) => void;
  onUpdateDelivery: (id: string, updates: Partial<Delivery>) => void;
}

type LogisticsTab = 'ruta' | 'cuadre';

const DeliveryLogistics: React.FC<DeliveryLogisticsProps> = ({ deliveries, onImportDeliveries, onUpdateDelivery }) => {
  const [activeTab, setActiveTab] = useState<LogisticsTab>('ruta');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('TODAS');
  const [novedadModal, setNovedadModal] = useState<{ isOpen: boolean, delivery: Delivery | null }>({ isOpen: false, delivery: null });
  const [partialAmount, setPartialAmount] = useState<string>('');
  const [novedadReason, setNovedadReason] = useState('SIN_DINERO');

  // Filtros de Ruta Únicos
  const availableRoutes = useMemo(() => {
    const routes = new Set(deliveries.map(d => d.route));
    return ['TODAS', ...Array.from(routes)];
  }, [deliveries]);

  // Filtrado de la Hoja de Trabajo
  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const matchesSearch = d.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || d.orderId.includes(searchTerm);
      const matchesRoute = selectedRoute === 'TODAS' || d.route === selectedRoute;
      return matchesSearch && matchesRoute;
    });
  }, [deliveries, searchTerm, selectedRoute]);

  // Cálculos del Cuadre de Caja
  const recon = useMemo(() => {
    const efectivas = deliveries.filter(d => d.status === 'Efectiva');
    const totalCash = efectivas.filter(d => d.paymentMethod === 'Cash' || d.paymentMethod === 'CONTADO').reduce((s, d) => s + d.totalCollected, 0);
    const totalTrans = efectivas.filter(d => d.paymentMethod === 'Transferencia').reduce((s, d) => s + d.totalCollected, 0);
    const totalCredit = efectivas.filter(d => d.paymentMethod === 'credit').reduce((s, d) => s + d.totalCollected, 0);
    const totalDevuelto = deliveries.filter(d => d.status === 'Devuelta').reduce((s, d) => s + d.totalCharged, 0);
    const totalParcial = deliveries.reduce((s, d) => s + d.totalReturned, 0);

    return { totalCash, totalTrans, totalCredit, totalDevuelto, totalParcial, liquidacion: totalCash + totalTrans };
  }, [deliveries]);

  // Exportar Reporte Institucional CSV
  const handleExportReport = () => {
    const headers = "No entrega;Id pedido;Fecha de entrega;Ruta;Entregador;Estado;Nombre cliente;Total cargado;Total entregado;Total devuelto en ruta;Total recaudo";
    const rows = deliveries.map(d => [
      d.id, d.orderId, new Date().toISOString().split('T')[0], d.route, d.deliveryMan, d.status,
      d.clientName, d.totalCharged, d.totalDelivered, d.totalReturned, d.totalCollected
    ].join(';'));
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `REPORTE_GENERAL_ENTREGAS_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEntregaTotal = (d: Delivery) => {
    onUpdateDelivery(d.id, { 
      status: 'Efectiva', 
      totalDelivered: d.totalCharged, 
      totalCollected: d.totalCharged,
      totalReturned: 0 
    });
  };

  const handleApplyNovedad = () => {
    if (!novedadModal.delivery) return;
    const delivered = parseFloat(partialAmount) || 0;
    const returned = novedadModal.delivery.totalCharged - delivered;
    
    onUpdateDelivery(novedadModal.delivery.id, {
      status: delivered === 0 ? 'Devuelta' : 'Efectiva',
      totalDelivered: delivered,
      totalCollected: delivered,
      totalReturned: returned,
      comments: `${novedadReason}: ${delivered === 0 ? 'Rechazo Total' : 'Entrega Parcial'}`
    });
    
    setNovedadModal({ isOpen: false, delivery: null });
    setPartialAmount('');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32 animate-in fade-in duration-500">
      
      {/* HEADER LOGÍSTICO */}
      <div className="bg-[#0f172a] p-8 -mx-4 md:-mx-10 -mt-10 mb-8 text-white shadow-2xl rounded-b-[3.5rem] relative overflow-hidden border-b border-white/10">
         <div className="absolute right-0 top-0 opacity-10 rotate-12"><Truck size={240} /></div>
         
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-emerald-600 rounded-[1.8rem] shadow-lg shadow-emerald-900/40 border border-white/20">
                  <Truck className="text-white" size={28} />
               </div>
               <div>
                  <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Terminal de Despacho</h2>
                  <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-1">Control de Ruta y Recaudo v3.0</p>
               </div>
            </div>

            <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
               <button 
                 onClick={() => setActiveTab('ruta')}
                 className={`flex items-center gap-2 px-8 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'ruta' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
               >
                 Mi Ruta
               </button>
               <button 
                 onClick={() => setActiveTab('cuadre')}
                 className={`flex items-center gap-2 px-8 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'cuadre' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
               >
                 Cuadre de Caja
               </button>
            </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-0">
        
        {activeTab === 'ruta' && (
          <div className="space-y-6">
            {/* BUSCADOR Y FILTRO */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
               <div className="relative flex-1 group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="text" 
                    placeholder="Cliente o #Pedido..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
               </div>
               <select 
                 className="px-6 py-3 bg-slate-50 border-none rounded-2xl text-[10px] font-black uppercase outline-none"
                 value={selectedRoute}
                 onChange={e => setSelectedRoute(e.target.value)}
               >
                 {availableRoutes.map(r => <option key={r} value={r}>{r}</option>)}
               </select>
            </div>

            {/* LISTA DE ENTREGAS */}
            <div className="space-y-4">
               {filteredDeliveries.map(d => (
                 <div key={d.id} className={`bg-white rounded-[2.5rem] border transition-all overflow-hidden shadow-sm hover:shadow-xl ${
                   d.status === 'Efectiva' ? 'border-emerald-200 bg-emerald-50/10' : 
                   d.status === 'Devuelta' ? 'border-red-200 bg-red-50/10' : 
                   'border-slate-100'
                 }`}>
                    <div className="p-8">
                       <div className="flex justify-between items-start mb-6">
                          <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg uppercase tracking-tighter">#{d.orderId}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">{d.route}</span>
                             </div>
                             <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight leading-none">{d.clientName}</h3>
                             <p className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1"><MapPin size={12}/> {d.address}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Cobro Estimado</p>
                             <p className="text-3xl font-black text-slate-900 tracking-tighter">${d.totalCharged.toLocaleString()}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-3">
                          {d.status === 'Cargado' ? (
                            <>
                               <button 
                                 onClick={() => handleEntregaTotal(d)}
                                 className="col-span-1 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 active-scale flex flex-col items-center justify-center gap-1"
                               >
                                  <CheckCircle2 size={18} /> OK TOTAL
                               </button>
                               <button 
                                 onClick={() => setNovedadModal({ isOpen: true, delivery: d })}
                                 className="col-span-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg active-scale flex flex-col items-center justify-center gap-1"
                               >
                                  <AlertCircle size={18} /> NOVEDAD
                               </button>
                            </>
                          ) : (
                            <div className="col-span-2 flex items-center gap-3">
                               <div className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center border-2 ${d.status === 'Efectiva' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                  {d.status === 'Efectiva' ? 'ENTREGA EXITOSA' : 'PEDIDO RECHAZADO'}
                               </div>
                               <button onClick={() => onUpdateDelivery(d.id, { status: 'Cargado' })} className="p-4 bg-slate-100 text-slate-400 rounded-2xl hover:text-blue-600 transition-colors"><RotateCcw size={18}/></button>
                            </div>
                          )}
                          <button 
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${d.address}`, '_blank')}
                            className="col-span-1 py-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl font-black text-[10px] uppercase tracking-widest active-scale flex flex-col items-center justify-center gap-1"
                          >
                             <Navigation size={18} /> IR MAPS
                          </button>
                       </div>
                    </div>
                    
                    {d.totalReturned > 0 && (
                      <div className="px-8 py-3 bg-amber-50 border-t border-amber-100 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-amber-700">
                         <span>⚠️ Devolución Parcial Aplicada</span>
                         <span>Devuelto: ${d.totalReturned.toLocaleString()}</span>
                      </div>
                    )}
                 </div>
               ))}

               {filteredDeliveries.length === 0 && (
                 <div className="py-24 text-center">
                    <Truck size={64} className="text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-300 uppercase tracking-tighter">Sin entregas para mostrar</h3>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'cuadre' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             
             {/* DASHBOARD FINANCIERO */}
             <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
                <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-black uppercase tracking-tighter">Estado de Caja Diaria</h3>
                      <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Sincronización Logística</p>
                   </div>
                   <div className="p-4 bg-white/10 rounded-2xl"><Wallet size={32} className="text-emerald-400" /></div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center"><DollarSign size={18}/></div>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Efectivo Físico</span>
                         </div>
                         <span className="text-lg font-black text-slate-800">${recon.totalCash.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><RotateCcw size={18}/></div>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Transferencias</span>
                         </div>
                         <span className="text-lg font-black text-slate-800">${recon.totalTrans.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-50 rounded-3xl opacity-60">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><Printer size={18}/></div>
                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Crédito / Firmas</span>
                         </div>
                         <span className="text-lg font-black text-slate-800">${recon.totalCredit.toLocaleString()}</span>
                      </div>
                   </div>

                   <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white shadow-xl shadow-emerald-900/40 relative overflow-hidden flex flex-col justify-center text-center">
                      <div className="absolute -right-10 -bottom-10 opacity-10"><Calculator size={180} /></div>
                      <p className="text-xs font-black uppercase tracking-[0.3em] mb-4 opacity-70">Total Liquidación</p>
                      <p className="text-6xl font-black tracking-tighter leading-none mb-2">${recon.liquidacion.toLocaleString()}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Recurso Total Recibido en Ruta</p>
                   </div>
                </div>

                <div className="px-10 pb-10 grid grid-cols-2 gap-4">
                   <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
                      <p className="text-[9px] font-black text-red-400 uppercase tracking-widest mb-1">Monto Devuelto (Rechazos)</p>
                      <p className="text-xl font-black text-red-600">${recon.totalDevuelto.toLocaleString()}</p>
                   </div>
                   <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                      <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Monto Parcial (Novedades)</p>
                      <p className="text-xl font-black text-amber-600">${recon.totalParcial.toLocaleString()}</p>
                   </div>
                </div>
             </div>

             {/* ACCIONES DE CIERRE */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={handleExportReport}
                  className="py-6 bg-white border-2 border-slate-200 text-slate-700 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                >
                   <Download size={20} /> Descargar Reporte CSV
                </button>
                <button 
                  onClick={() => {
                    if(confirm("¿Confirmas el cierre del día? Esto marcará todos los pedidos como ENTREGADOS.")) {
                      alert("Día cerrado y sincronizado con el backoffice.");
                      deliveries.forEach(d => {
                        if (d.status === 'Cargado') handleEntregaTotal(d);
                      });
                      setActiveTab('ruta');
                    }
                  }}
                  className="py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all active:scale-95"
                >
                   <Save size={20} /> Cerrar Jornada
                </button>
             </div>
          </div>
        )}
      </div>

      {/* MODAL DE NOVEDAD / DEVOLUCIÓN PARCIAL */}
      {novedadModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300 border border-white/20">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Reportar Novedad</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{novedadModal.delivery?.clientName}</p>
                 </div>
                 <button onClick={() => setNovedadModal({ isOpen: false, delivery: null })} className="p-3 bg-slate-50 rounded-full text-slate-400"><XCircle size={24} /></button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo de la Novedad</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['SIN_DINERO', 'CERRADO', 'PEDIDO_ERRADO', 'RECHAZO_PARCIAL'].map(m => (
                          <button 
                            key={m}
                            onClick={() => setNovedadReason(m)}
                            className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${novedadReason === m ? 'bg-orange-500 text-white border-orange-500' : 'bg-slate-50 text-slate-400 border-slate-100'}`}
                          >
                             {m.replace('_', ' ')}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor Final Entregado ($)</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         className="w-full p-5 bg-slate-50 border-none rounded-2xl text-2xl font-black text-emerald-600 outline-none focus:ring-4 focus:ring-blue-500/10"
                         placeholder="0"
                         value={partialAmount}
                         onChange={e => setPartialAmount(e.target.value)}
                       />
                       <p className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-300 uppercase tracking-widest">Cargado: ${novedadModal.delivery?.totalCharged.toLocaleString()}</p>
                    </div>
                 </div>

                 <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 flex items-start gap-4">
                    <AlertCircle className="text-blue-500 mt-1 shrink-0" size={24} />
                    <p className="text-[9px] font-bold text-blue-900 leading-relaxed italic uppercase">
                       Al registrar un valor menor, el sistema marcará la diferencia como "Devolución en Ruta" para el cuadre contable.
                    </p>
                 </div>

                 <button 
                  onClick={handleApplyNovedad}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2.2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active-scale"
                 >
                    <CheckCircle2 size={20} /> Aplicar Novedad
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* BARRA INFERIOR DE TOTALES RUTA (LISTA) */}
      {activeTab === 'ruta' && (
        <div className="fixed bottom-24 left-4 right-4 md:left-10 md:right-10 z-[40]">
           <div className="bg-[#0f172a] p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center justify-between gap-6 text-white overflow-hidden">
              <div className="flex items-center gap-6 relative z-10">
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Entregas Pendientes</p>
                    <p className="text-xl font-black tracking-tighter">{deliveries.filter(d => d.status === 'Cargado').length}</p>
                 </div>
                 <div className="h-10 w-px bg-white/10"></div>
                 <div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Recaudado</p>
                    <p className="text-xl font-black text-emerald-400 tracking-tighter">${recon.liquidacion.toLocaleString()}</p>
                 </div>
              </div>
              <button 
                onClick={() => setActiveTab('cuadre')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active-scale"
              >
                 <Wallet size={16} /> Ver Mi Cuadre
              </button>
           </div>
        </div>
      )}

    </div>
  );
};

const MapPin = ({size, className}: {size: number, className?: string}) => <span className={className}>📍</span>;

export default DeliveryLogistics;
