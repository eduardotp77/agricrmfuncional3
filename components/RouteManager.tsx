
import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, Phone, ShoppingCart, Calendar, CheckCircle2, 
  Clock, Navigation, Search, Filter, Plus, ChevronRight,
  TrendingUp, Route, CalendarClock, ChevronLeft, CalendarCheck, 
  Zap, X, Map as MapIcon, List, AlertTriangle, MessageSquare,
  Ban, ExternalLink, MoreVertical, CheckCircle
} from 'lucide-react';
import { Client, RouteType, VisitFrequency, RouteAssignment, NoVentaReason, NoVentaRecord } from '../types';

interface RouteManagerProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  onSaveNoVenta?: (record: NoVentaRecord) => void;
}

const DAYS_OF_WEEK = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const RouteManager: React.FC<RouteManagerProps> = ({ clients, onSelectClient, onSaveNoVenta }) => {
  // Persistencia de contexto
  const [selectedRoute, setSelectedRoute] = useState(() => localStorage.getItem('agri_last_route') || '');
  const [selectedDay, setSelectedDay] = useState(() => localStorage.getItem('agri_last_day') || 'Lunes');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para No Venta
  const [noVentaModal, setNoVentaModal] = useState<{ isOpen: boolean, client: Client | null }>({ isOpen: false, client: null });
  const [noVentaReason, setNoVentaReason] = useState<NoVentaReason>('CERRADO');
  const [noVentaObs, setNoVentaObs] = useState('');

  // Persistir selección
  useEffect(() => {
    localStorage.setItem('agri_last_route', selectedRoute);
    localStorage.setItem('agri_last_day', selectedDay);
  }, [selectedRoute, selectedDay]);

  // Extraer rutas únicas de la base de datos local
  const availableRoutes = useMemo(() => {
    const routes = new Set<string>();
    clients.forEach(c => {
      if (Array.isArray(c.routes)) {
        c.routes.forEach(r => routes.add(r));
      } else if (c.routeId) {
        routes.add(c.routeId);
      }
    });
    return Array.from(routes).sort();
  }, [clients]);

  // Filtrado Maestro de Ruta
  const routeClients = useMemo(() => {
    return clients.filter(c => {
      const matchesRoute = selectedRoute ? (c.routes?.includes(selectedRoute) || c.routeId === selectedRoute) : true;
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
      // Nota: En un sistema real filtraríamos también por el día asignado en el planificador
      return matchesRoute && matchesSearch;
    }).sort((a, b) => (a.visitOrder || 0) - (b.visitOrder || 0));
  }, [clients, selectedRoute, searchTerm]);

  // Estadísticas de cumplimiento
  const stats = useMemo(() => {
    const total = routeClients.length;
    const visited = routeClients.filter(c => c.lastVisitDate).length; // Simulación de visita
    const percent = total > 0 ? Math.round((visited / total) * 100) : 0;
    return { total, visited, percent };
  }, [routeClients]);

  const handleNoVenta = () => {
    if (!noVentaModal.client || !onSaveNoVenta) return;
    
    const record: NoVentaRecord = {
      id: `NV-${Date.now()}`,
      clientId: noVentaModal.client.id,
      clientName: noVentaModal.client.name,
      vendorName: 'Vendedor Autenticado',
      date: new Date().toISOString(),
      reason: noVentaReason,
      observations: noVentaObs
    };
    
    onSaveNoVenta(record);
    setNoVentaModal({ isOpen: false, client: null });
    setNoVentaObs('');
    alert(`No Venta registrada para ${noVentaModal.client.name}`);
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-32 animate-in fade-in duration-500">
      
      {/* CABECERA TÁCTICA: SELECTORES DE RUTA */}
      <div className="bg-[#0f172a] p-8 -mx-4 md:-mx-10 -mt-10 mb-8 text-white shadow-2xl rounded-b-[3.5rem] relative overflow-hidden border-b border-white/10">
        <div className="absolute right-0 top-0 opacity-10 rotate-12"><Route size={240} /></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-600 rounded-[1.8rem] shadow-lg shadow-blue-900/40 border border-white/20">
                 <Navigation className="text-white" size={28} />
              </div>
              <div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Hoja de Ruta</h2>
                 <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">Terminal de Despacho e Inteligencia</p>
              </div>
           </div>

           <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/10 backdrop-blur-xl">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
              >
                <List size={16} /> Lista
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400'}`}
              >
                <MapIcon size={16} /> Mapa
              </button>
           </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
           <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Zona / Ruta Maestra</label>
              <select 
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/10 rounded-2xl text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                 <option value="" className="bg-slate-900">Todas las Rutas</option>
                 {availableRoutes.map(r => <option key={r} value={r} className="bg-slate-900">{r}</option>)}
              </select>
           </div>
           <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Frecuencia / Día</label>
              <select 
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/10 rounded-2xl text-sm font-black text-white outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                 {DAYS_OF_WEEK.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
              </select>
           </div>
           <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Buscador en Ruta</label>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                 <input 
                   type="text" 
                   placeholder="Nombre, ID o NIT..."
                   className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-blue-500"
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>
        </div>
      </div>

      {/* VISTA DE MAPA (Simulación con pines dinámicos) */}
      {viewMode === 'map' && (
        <div className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-xl h-[500px] relative overflow-hidden animate-in zoom-in duration-300">
           <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
              <div className="text-center space-y-4">
                 <MapIcon size={64} className="text-slate-300 mx-auto animate-pulse" />
                 <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Motor de Mapas Institucional</p>
                 <div className="flex gap-2 justify-center">
                    {routeClients.slice(0, 5).map(c => (
                       <div key={c.id} className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-black text-white ${c.currentDebt > 0 ? 'bg-red-500' : 'bg-blue-600'}`}>
                          {c.visitOrder}
                       </div>
                    ))}
                 </div>
              </div>
           </div>
           <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Leyenda:</p>
              <div className="flex gap-4 mt-2">
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-600"></div><span className="text-[9px] font-bold text-slate-700">NORMAL</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-[9px] font-bold text-slate-700">CON MORA</span></div>
                 <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div><span className="text-[9px] font-bold text-slate-700">VISITADO</span></div>
              </div>
           </div>
        </div>
      )}

      {/* LISTADO DE CLIENTES (TRABAJO DEL DÍA) */}
      {viewMode === 'list' && (
        <div className="space-y-4">
           {routeClients.map((client, idx) => (
             <div 
               key={client.id}
               className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group overflow-hidden"
             >
                <div className="p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
                   <div className="flex items-center gap-5 flex-1 min-w-0">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center font-black text-slate-300 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-inner">
                         {client.visitOrder || idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-black text-slate-800 uppercase text-base tracking-tight truncate">{client.name}</h3>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[8px] font-black rounded uppercase">{client.id}</span>
                         </div>
                         <div className="flex flex-wrap gap-3 items-center">
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><MapPin size={12} className="text-blue-500" /> {client.address}</p>
                            <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><MessageSquare size={12} className="text-emerald-500" /> {client.contactName}</p>
                         </div>
                         
                         {client.currentDebt > 0 && (
                            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-xl border border-red-100 animate-pulse">
                               <AlertTriangle size={12} />
                               <span className="text-[10px] font-black uppercase tracking-widest">En Mora: ${client.currentDebt.toLocaleString()}</span>
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="grid grid-cols-3 md:flex gap-3 w-full md:w-auto">
                      <button 
                         onClick={() => onSelectClient(client)}
                         className="flex-1 md:w-28 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-900/20 active-scale flex flex-col items-center justify-center gap-1"
                      >
                         <ShoppingCart size={18} /> PEDIDO
                      </button>
                      <button 
                         onClick={() => setNoVentaModal({ isOpen: true, client })}
                         className="flex-1 md:w-28 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active-scale flex flex-col items-center justify-center gap-1"
                      >
                         <Ban size={18} /> NO VENTA
                      </button>
                      <button 
                         onClick={() => openInMaps(client.location.lat, client.location.lng)}
                         className="flex-1 md:w-28 py-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl font-black uppercase text-[10px] tracking-widest active-scale flex flex-col items-center justify-center gap-1"
                      >
                         <Navigation size={18} /> IR
                      </button>
                   </div>
                </div>
             </div>
           ))}

           {routeClients.length === 0 && (
             <div className="py-20 text-center space-y-4">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border-2 border-dashed border-slate-200">
                   <Route size={48} />
                </div>
                <h3 className="text-xl font-black text-slate-400 uppercase tracking-tighter">Sin clientes en esta selección</h3>
                <p className="text-xs text-slate-300 italic font-medium">Asegúrate de haber sincronizado el maestro de clientes correctamente.</p>
             </div>
           )}
        </div>
      )}

      {/* BARRA DE ESTADÍSTICAS PERSISTENTE (STICKY BOTTOM) */}
      <div className="fixed bottom-24 left-4 right-4 md:left-10 md:right-10 z-[40]">
         <div className="bg-[#0f172a] p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 text-white overflow-hidden">
            <div className="absolute -left-4 -bottom-4 opacity-5 rotate-12"><TrendingUp size={100} /></div>
            
            <div className="flex items-center gap-8 relative z-10">
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Clientes Ruta</p>
                  <p className="text-xl font-black tracking-tighter">{stats.total}</p>
               </div>
               <div className="h-10 w-px bg-white/10"></div>
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Efectividad</p>
                  <p className="text-xl font-black text-emerald-400 tracking-tighter">{stats.percent}%</p>
               </div>
            </div>

            <div className="flex-1 w-full max-w-md space-y-2 relative z-10 px-4">
               <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-blue-400">Progreso de Visita</span>
                  <span>{stats.visited} / {stats.total} Atendidos</span>
               </div>
               <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-1000" style={{width: `${stats.percent}%`}}></div>
               </div>
            </div>

            <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-emerald-500 text-slate-900 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active-scale relative z-10">
               <CheckCircle size={16} /> Finalizar Jornada
            </button>
         </div>
      </div>

      {/* MODAL DE NO VENTA */}
      {noVentaModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in duration-300 border border-white/20">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Reportar No Venta</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{noVentaModal.client?.name}</p>
                 </div>
                 <button onClick={() => setNoVentaModal({ isOpen: false, client: null })} className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-all"><X /></button>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo Principal</label>
                    <div className="grid grid-cols-2 gap-2">
                       {['CERRADO', 'STOCK_LLENO', 'SIN_DINERO', 'DUENO_AUSENTE'].map(m => (
                          <button 
                            key={m}
                            onClick={() => setNoVentaReason(m as any)}
                            className={`py-3 rounded-xl font-black text-[9px] uppercase tracking-widest border transition-all ${noVentaReason === m ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-orange-200'}`}
                          >
                             {m.replace('_', ' ')}
                          </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Observaciones Técnicas</label>
                    <textarea 
                      className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 h-28"
                      placeholder="Describa el motivo detallado o próximos compromisos..."
                      value={noVentaObs}
                      onChange={e => setNoVentaObs(e.target.value)}
                    ></textarea>
                 </div>

                 <button 
                  onClick={handleNoVenta}
                  className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active-scale"
                 >
                    <Ban size={20} /> Consolidar Registro
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default RouteManager;
