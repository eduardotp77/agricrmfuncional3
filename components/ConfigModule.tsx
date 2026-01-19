
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Settings, Save, Trash2, Plus, Download, RefreshCw, 
  Users, Map, Ban, DollarSign, Database, ShieldCheck, 
  AlertCircle, CheckCircle2, Search, Building2, Mail, Percent,
  ArrowRightLeft, FileSpreadsheet
} from 'lucide-react';
// Added Config to types import to satisfy props from App.tsx
import { SystemConfig, RouteConfig, NoSaleReasonConfig, SellerConfig, User, UserRole, Product, PriceListDetail, Config } from '../types';
import * as XLSX from 'xlsx';

// Added interface for component props to resolve TS error in App.tsx
interface ConfigModuleProps {
  config: Config;
  onUpdateConfig: (config: Config) => void;
}

// Updated component to accept config and onUpdateConfig props
const ConfigModule: React.FC<ConfigModuleProps> = ({ config: appConfig, onUpdateConfig }) => {
  const [activeTab, setActiveTab] = useState<'global' | 'routes' | 'reasons' | 'sellers' | 'prices'>('global');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Cargar configuración desde LocalStorage
  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('agri_system_config');
    const defaultConfig: SystemConfig = {
      routes: [],
      noSaleReasons: [],
      sellers: [],
      priceListDetails: [],
      globalConfig: {
        businessName: 'AGRONATUREX COLOMBIA',
        nit: '900.123.456-1',
        iva: 19,
        tax1: 0,
        adminEmails: 'admin@agronaturex.com'
      }
    };
    return saved ? JSON.parse(saved) : defaultConfig;
  });

  // Guardar cambios en LocalStorage
  const persistConfig = (updatedConfig: SystemConfig) => {
    setConfig(updatedConfig);
    localStorage.setItem('agri_system_config', JSON.stringify(updatedConfig));
    
    // Fixed: Sync system routes back to appConfig for UI consistency in other modules
    if (updatedConfig.routes) {
        onUpdateConfig({
            ...appConfig,
            routes: updatedConfig.routes.map(r => r.id)
        });
    }
  };

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    persistConfig({
      ...config,
      globalConfig: {
        ...config.globalConfig,
        [name]: name === 'iva' || name === 'tax1' ? parseFloat(value) : value
      }
    });
  };

  // CRUD Rutas
  const addRoute = () => {
    const newRoute = { id: `RUTA-${Date.now()}`, name: 'Nueva Ruta' };
    persistConfig({ ...config, routes: [...config.routes, newRoute] });
  };

  const updateRoute = (id: string, name: string) => {
    persistConfig({
      ...config,
      routes: config.routes.map(r => r.id === id ? { ...r, name } : r)
    });
  };

  // Sincronización Mágica de Usuarios
  const handleSyncUsers = () => {
    const currentUsers: User[] = JSON.parse(localStorage.getItem('agri_users') || '[]');
    let updatedCount = 0;
    let createdCount = 0;

    const syncedUsers = [...currentUsers];

    config.sellers.forEach(seller => {
      const existingIdx = syncedUsers.findIndex(u => u.id === seller.id || u.email === `vendedor_${seller.id}@agronaturex.com`);
      
      if (existingIdx > -1) {
        syncedUsers[existingIdx] = {
          ...syncedUsers[existingIdx],
          name: seller.name,
          status: seller.active ? 'active' : 'inactive'
        };
        updatedCount++;
      } else {
        syncedUsers.push({
          id: seller.id,
          name: seller.name,
          email: `vendedor_${seller.id}@agronaturex.com`,
          role: 'kam_junior',
          status: 'active',
          lastLogin: 'Pendiente Sync'
        });
        createdCount++;
      }
    });

    localStorage.setItem('agri_users', JSON.stringify(syncedUsers));
    alert(`Sincronización Completada:\n- Creados: ${createdCount}\n- Actualizados: ${updatedCount}`);
  };

  // Exportadores Espejo
  const exportMaestro = (type: 'routes' | 'reasons' | 'sellers') => {
    let data: any[] = [];
    let filename = "";

    if (type === 'routes') {
      data = config.routes.map(r => ({ "CÓDIGO": r.id, "NOMBRE": r.name }));
      filename = "TOMAPEDIDOS_RUTAS.xlsx";
    } else if (type === 'reasons') {
      data = config.noSaleReasons.map(r => ({ "ID": r.id, "Nombre": r.name }));
      filename = "tipos de no venta.xlsx";
    } else if (type === 'sellers') {
      data = config.sellers.map(s => ({ "USUARIO (NUMÉRICO)": s.id, "NOMBRE": s.name }));
      filename = "TOMAPEDIDOS_VENDEDORES.xlsx";
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Maestro_Espejo");
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      
      {/* HEADER CORPORATIVO */}
      <div className="bg-[#0f172a] p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden border border-white/5 shadow-2xl">
         <div className="absolute top-0 right-0 opacity-10"><Database size={300} /></div>
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
                  <Settings size={24} />
               </div>
               <h2 className="text-4xl font-black uppercase tracking-tighter">Cerebro Institucional</h2>
            </div>
            <p className="text-blue-400 text-sm font-medium italic">Gestión de parámetros globales y maestros auxiliares Tomapedidos.</p>
         </div>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-white p-2 rounded-[2.5rem] shadow-xl border border-slate-100 overflow-x-auto">
         {[
           { id: 'global', label: 'Global', icon: Building2 },
           { id: 'routes', label: 'Rutas', icon: Map },
           { id: 'reasons', label: 'No Venta', icon: Ban },
           { id: 'sellers', label: 'Fuerza Ventas', icon: Users },
           { id: 'prices', label: 'Matrices', icon: DollarSign },
         ].map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`py-4 px-2 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 font-black uppercase text-[9px] tracking-widest
                  ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
            >
               <tab.icon size={18} /> {tab.label}
            </button>
         ))}
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* PESTAÑA 1: CONFIGURACIÓN GLOBAL */}
        {activeTab === 'global' && (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-10 animate-in slide-in-from-bottom-4">
             <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Building2 size={24}/></div>
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Identidad & Fiscal</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial de la Empresa</label>
                      <input name="businessName" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black" value={config.globalConfig.businessName} onChange={handleGlobalChange} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NIT / Documento Identidad</label>
                      <input name="nit" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black" value={config.globalConfig.nit} onChange={handleGlobalChange} />
                   </div>
                </div>

                <div className="bg-blue-50 p-8 rounded-[2.5rem] border border-blue-100 space-y-6">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2"><Percent size={14}/> Parámetros Impositivos</p>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-blue-400 uppercase">IVA General (%)</label>
                         <input type="number" name="iva" className="w-full p-4 bg-white border-none rounded-xl text-xl font-black text-blue-600" value={config.globalConfig.iva} onChange={handleGlobalChange} />
                      </div>
                      <div className="space-y-1">
                         <label className="text-[9px] font-black text-blue-400 uppercase">Impuesto Adic. (%)</label>
                         <input type="number" name="tax1" className="w-full p-4 bg-white border-none rounded-xl text-xl font-black text-blue-600" value={config.globalConfig.tax1} onChange={handleGlobalChange} />
                      </div>
                   </div>
                   <p className="text-[9px] text-blue-400 italic font-medium leading-relaxed">Estos valores afectarán los cálculos del Mago de Ventas y el reporte de cuadre logístico.</p>
                </div>
             </div>
          </div>
        )}

        {/* PESTAÑA 2: GESTIÓN DE RUTAS */}
        {activeTab === 'routes' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Maestro de Rutas</h3>
                   <div className="flex gap-2">
                      <button onClick={addRoute} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"><Plus size={16}/> Nueva</button>
                      <button onClick={() => exportMaestro('routes')} className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"><FileSpreadsheet size={16}/> Exportar Espejo</button>
                   </div>
                </div>
                
                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                            <th className="p-4">CÓDIGO (ID)</th>
                            <th className="p-4">NOMBRE DE RUTA</th>
                            <th className="p-4 text-right">ACCIONES</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                         {config.routes.map(route => (
                            <tr key={route.id} className="hover:bg-slate-50 transition-colors group">
                               <td className="p-4 font-mono font-black text-blue-600 text-xs">{route.id}</td>
                               <td className="p-4">
                                  <input 
                                    className="w-full bg-transparent border-none font-black text-slate-700 uppercase outline-none focus:text-blue-600" 
                                    value={route.name} 
                                    onChange={(e) => updateRoute(route.id, e.target.value)}
                                  />
                               </td>
                               <td className="p-4 text-right">
                                  <button onClick={() => persistConfig({ ...config, routes: config.routes.filter(r => r.id !== route.id) })} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {/* PESTAÑA 4: EQUIPO DE VENTAS */}
        {activeTab === 'sellers' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4">
             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl">
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">Fuerza de Ventas</h3>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2 italic">Sincronización de credenciales maestras.</p>
                   </div>
                   <div className="flex gap-3">
                      <button 
                        onClick={handleSyncUsers}
                        className="px-8 py-4 bg-emerald-600 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-900/20 flex items-center gap-2 hover:bg-emerald-700 active-scale transition-all"
                      >
                         <RefreshCw size={18} /> Sincronizar con Usuarios
                      </button>
                      <button onClick={() => exportMaestro('sellers')} className="px-8 py-4 bg-slate-900 text-white rounded-3xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2"><Download size={18}/> Exportar</button>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {config.sellers.map(seller => (
                      <div key={seller.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:border-blue-100 hover:shadow-xl transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#0056b2] text-white rounded-2xl flex items-center justify-center font-black text-sm shadow-lg">
                               {seller.id.slice(-2)}
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ID: {seller.id}</p>
                               <h4 className="font-black text-slate-800 uppercase text-xs">{seller.name}</h4>
                            </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <div className="text-right">
                               <p className="text-[8px] font-black text-emerald-500 uppercase">Activo</p>
                               <span className="text-[10px] font-bold text-slate-400">kam_junior</span>
                            </div>
                            <button className="p-3 bg-white text-slate-300 rounded-xl hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* PESTAÑA 5: MATRICES DE PRECIOS */}
        {activeTab === 'prices' && (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl animate-in slide-in-from-bottom-4">
             <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Visor de Precios B2B</h3>
                <div className="relative w-72">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                   <input 
                     placeholder="Buscar por lista o PLU..." 
                     className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase outline-none"
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                   />
                </div>
             </div>

             <div className="overflow-x-auto max-h-[500px] custom-scrollbar border rounded-2xl border-slate-100">
                <table className="w-full text-left text-[9px] border-collapse">
                   <thead>
                      <tr className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest">
                         <th className="p-4">LISTA</th>
                         <th className="p-4">PRODUCTO (PLU)</th>
                         <th className="p-4">PRECIO ACORDADO</th>
                         <th className="p-4 text-center">MÍNIMA</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {config.priceListDetails
                        .filter(p => p.listId.includes(searchTerm) || p.productId.includes(searchTerm))
                        .slice(0, 100) // Limitar por performance en visor
                        .map((price, idx) => (
                         <tr key={idx} className="hover:bg-blue-50 transition-colors">
                            <td className="p-4 font-black text-blue-600">{price.listId}</td>
                            <td className="p-4 font-black text-slate-800">{price.productId}</td>
                            <td className="p-4 font-black text-slate-900 text-sm">${price.price.toLocaleString()}</td>
                            <td className="p-4 text-center font-bold text-slate-400">{price.minQty} UND</td>
                         </tr>
                      ))}
                      {config.priceListDetails.length === 0 && (
                        <tr><td colSpan={4} className="p-20 text-center text-slate-300 italic font-bold">Sin matriz de precios cargada. Use la Pasarela de Datos para importar el archivo de Tomapedidos.</td></tr>
                      )}
                   </tbody>
                </table>
             </div>
             <p className="mt-4 text-[9px] text-slate-400 italic">Se muestran los primeros 100 registros. Use el buscador para filtrar la matriz.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ConfigModule;
