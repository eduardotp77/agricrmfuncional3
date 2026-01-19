
import React, { useState, useRef } from 'react';
import { 
  Download, Upload, FileSpreadsheet, CheckCircle2, Database, 
  Package, ShoppingCart, Info, FileText, Loader2, 
  AlertCircle, X, Save, Users, Wallet, Share2, 
  ArrowRight, FileCheck, RefreshCw, BarChart3, ArrowRightLeft,
  Search, Trash2, Table, Settings, ListTree
} from 'lucide-react';
import { 
  Client, Product, Order, SyncStatus, ClientStatus, ProductUnit, 
  SystemConfig, RouteConfig, NoSaleReasonConfig, SellerConfig, PriceListDetail 
} from '../types';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const HEADERS_MAP = {
  CLIENTS: {
    ID: 'CÓDIGO (Obligatorio)',
    NIT: 'NÚMERO DOCUMENTO (Obligatorio)',
    BUSINESS_NAME: 'NOMBRE DEL NEGOCIO (Obligatorio)',
    FIRST_NAME: 'PRIMER NOMBRE (Obligatorio)',
    LAST_NAME: 'PRIMER APELLIDO',
    ADDRESS: 'DIRECCIÓN (Obligatorio)',
    PHONE: 'CELULAR (Obligatorio)',
    ROUTE: 'RUTA',
    LAT: 'LATITUD',
    LNG: 'LONGITUD'
  },
  PRODUCTS: {
    ID: 'CÓDIGO (Obligatorio)',
    NAME: 'NOMBRE (Obligatorio)',
    PRICE: 'PRECIO BASE (Obligatorio)',
    STOCK: 'CANTIDAD EN INVENTARIO',
    ACTIVE: 'ACTIVO (1 = SI, 0 = NO)'
  },
  CONFIG: {
    ROUTES: { ID: 'CÓDIGO', NAME: 'NOMBRE' },
    NO_SALE: { ID: 'ID', NAME: 'Nombre' },
    SELLERS: { ID: 'USUARIO (NUMÉRICO)', NAME: 'NOMBRE' },
    PRICES: { LIST: 'LISTA DE PRECIOS', PROD: 'PRODUCTO', PRICE: 'PRECIO BASE', MIN: 'CANTIDAD MINIMA' }
  }
};

interface SyncModuleProps {
  onImportOrders: (data: Order[]) => void;
  onImportClients: (data: Client[]) => void;
  onImportProducts: (data: Product[]) => void;
  onImportCartera: (data: any[]) => void;
  orders: Order[];
  clients: Client[];
  products: Product[];
}

type SyncTab = 'clients' | 'products' | 'portfolio' | 'aux_masters' | 'export';
type ConfigSubTab = 'routes' | 'no_sale' | 'sellers' | 'prices';

const SyncModule: React.FC<SyncModuleProps> = ({ 
  onImportClients, onImportProducts, onImportCartera, clients, products, orders 
}) => {
  const [activeTab, setActiveTab] = useState<SyncTab>('clients');
  const [configSubTab, setConfigSubTab] = useState<ConfigSubTab>('routes');
  const [importStatus, setImportStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [log, setLog] = useState<{ msg: string, type: 'info' | 'success' | 'error' }[]>([]);
  const [results, setResults] = useState<{ created: number, updated: number, errors: number } | null>(null);
  
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('agri_system_config');
    return saved ? JSON.parse(saved) : { routes: [], noSaleReasons: [], sellers: [], priceListDetails: [], globalConfig: {} };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLog(prev => [{ msg, type }, ...prev].slice(0, 50));
  };

  const readDataFromFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      if (isExcel) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
            resolve(json);
          } catch (err) { reject(new Error("Fallo al decodificar binario Excel.")); }
        };
        reader.readAsBinaryString(file);
      } else {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => resolve(results.data),
          error: (err) => reject(new Error(`Error en CSV: ${err.message}`))
        });
      }
    });
  };

  const processData = (rawData: any[]) => {
    let created = 0;
    let updated = 0;
    let errors = 0;
    const newConfig = { ...systemConfig };

    try {
      if (activeTab === 'clients') {
        const HM = HEADERS_MAP.CLIENTS;
        const newClients: Client[] = rawData.map((row) => {
          const id = row[HM.ID]?.toString().trim();
          if (!id) { errors++; return null; }
          const name = row[HM.BUSINESS_NAME] || row[HM.FIRST_NAME] || 'Sin Nombre';
          return {
            id, name: name.toString(), businessName: (row[HM.BUSINESS_NAME] || name).toString(),
            nit: (row[HM.NIT] || '0').toString(), docNumber: (row[HM.NIT] || '0').toString(),
            contactName: `${row[HM.FIRST_NAME] || ''} ${row[HM.LAST_NAME] || ''}`.trim(),
            address: (row[HM.ADDRESS] || 'No registrada').toString(),
            phone: (row[HM.PHONE] || '').toString(), mobile: (row[HM.PHONE] || '').toString(),
            priceListId: row['LISTA DE PRECIOS']?.toString() || 'PR001',
            routeId: row[HM.ROUTE]?.toString() || 'GENERAL',
            location: { lat: parseFloat(row[HM.LAT]) || 7.1193, lng: parseFloat(row[HM.LNG]) || -73.1198 },
            status: ClientStatus.ACTIVO, type: 'institucional', creditLimit: parseFloat(row['LÍMITE DE CRÉDITO']) || 0,
            currentDebt: 0, isActive: true, visitOrder: 1, city: row['CIUDAD'] || 'Bucaramanga',
            routes: [row[HM.ROUTE]?.toString() || 'GENERAL']
          } as Client;
        }).filter(c => c !== null) as Client[];
        onImportClients(newClients);
      } 
      
      else if (activeTab === 'aux_masters') {
        if (configSubTab === 'routes') {
          const HM = HEADERS_MAP.CONFIG.ROUTES;
          newConfig.routes = rawData.map(r => ({ id: r[HM.ID]?.toString(), name: r[HM.NAME]?.toString() })).filter(r => r.id);
          addLog(`Rutas actualizadas: ${newConfig.routes.length} registros.`, 'success');
        } 
        else if (configSubTab === 'no_sale') {
          const HM = HEADERS_MAP.CONFIG.NO_SALE;
          newConfig.noSaleReasons = rawData.map(r => ({ id: r[HM.ID]?.toString(), name: r[HM.NAME]?.toString() })).filter(r => r.id);
          addLog(`Motivos No Venta actualizados: ${newConfig.noSaleReasons.length} registros.`, 'success');
        }
        else if (configSubTab === 'sellers') {
          const HM = HEADERS_MAP.CONFIG.SELLERS;
          newConfig.sellers = rawData.map(r => ({ id: r[HM.ID]?.toString(), name: r[HM.NAME]?.toString(), active: true })).filter(r => r.id);
          addLog(`Fuerza de Ventas actualizada: ${newConfig.sellers.length} registros.`, 'success');
        }
        else if (configSubTab === 'prices') {
          const HM = HEADERS_MAP.CONFIG.PRICES;
          newConfig.priceListDetails = rawData.map(r => ({ 
            listId: r[HM.LIST]?.toString(), 
            productId: r[HM.PROD]?.toString(), 
            price: parseFloat(r[HM.PRICE]) || 0,
            minQty: parseInt(r[HM.MIN]) || 1
          })).filter(r => r.listId && r.productId);
          addLog(`Matriz de Precios B2B actualizada: ${newConfig.priceListDetails.length} registros.`, 'success');
        }
        setSystemConfig(newConfig);
        localStorage.setItem('agri_system_config', JSON.stringify(newConfig));
      }

      setResults({ created, updated, errors });
      setImportStatus('SUCCESS');
    } catch (e) {
      addLog(`Error fatal: ${e instanceof Error ? e.message : 'Estructura inválida'}`, 'error');
      setImportStatus('ERROR');
    }
  };

  const handleExportData = () => {
    let data: any[] = [];
    let filename = "";
    
    if (activeTab === 'aux_masters') {
      if (configSubTab === 'routes') {
        filename = "TOMAPEDIDOS_RUTAS.xlsx";
        data = systemConfig.routes.map(r => ({ [HEADERS_MAP.CONFIG.ROUTES.ID]: r.id, [HEADERS_MAP.CONFIG.ROUTES.NAME]: r.name }));
      } else if (configSubTab === 'prices') {
        filename = "TOMAPEDIDOS_DETALLE_LISTA_PRECIOS.xlsx";
        data = systemConfig.priceListDetails.map(p => ({
          [HEADERS_MAP.CONFIG.PRICES.LIST]: p.listId,
          [HEADERS_MAP.CONFIG.PRICES.PROD]: p.productId,
          [HEADERS_MAP.CONFIG.PRICES.PRICE]: p.price,
          [HEADERS_MAP.CONFIG.PRICES.MIN]: p.minQty
        }));
      }
    } else if (activeTab === 'clients') {
      filename = "MAESTRO_CLIENTES_MIRROR.xlsx";
      data = clients.map(c => ({ [HEADERS_MAP.CLIENTS.ID]: c.id, [HEADERS_MAP.CLIENTS.NIT]: c.nit, [HEADERS_MAP.CLIENTS.BUSINESS_NAME]: c.businessName }));
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Espejo_Legado");
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Corporativo */}
      <div className="bg-[#0f172a] p-10 rounded-[3rem] text-white flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden border border-white/5 shadow-2xl">
         <div className="absolute top-0 right-0 opacity-10"><Database size={300} /></div>
         <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
               <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
                  <ArrowRightLeft size={24} />
               </div>
               <h2 className="text-4xl font-black uppercase tracking-tighter">Pasarela de Datos Espejo</h2>
            </div>
            <p className="text-blue-400 text-sm font-medium italic">Protocolo Institucional compatible con Tomapedidos v3.0.</p>
         </div>
      </div>

      {/* Navegación Modular */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white p-3 rounded-[2.5rem] shadow-xl border border-slate-100">
         {[
           { id: 'clients', label: 'Clientes', icon: Users, color: 'text-indigo-500' },
           { id: 'products', label: 'Productos', icon: Package, color: 'text-blue-500' },
           { id: 'portfolio', label: 'Cartera', icon: Wallet, color: 'text-emerald-500' },
           { id: 'aux_masters', label: 'Maestros / Config', icon: ListTree, color: 'text-purple-500' },
           { id: 'export', label: 'Centro Export', icon: Share2, color: 'text-orange-500' },
         ].map(tab => (
            <button
               key={tab.id}
               onClick={() => { setActiveTab(tab.id as SyncTab); setImportStatus('IDLE'); }}
               className={`py-4 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 transition-all duration-300 font-black uppercase text-[10px] tracking-[0.15em]
                  ${activeTab === tab.id ? 'bg-[#0f172a] text-white shadow-2xl scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
            >
               <tab.icon size={20} className={activeTab === tab.id ? tab.color : ''} />
               {tab.label}
            </button>
         ))}
      </div>

      <div className="max-w-4xl mx-auto">
        {activeTab === 'aux_masters' && (
          <div className="mb-6 flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit mx-auto">
             {[
               { id: 'routes', label: 'Rutas' },
               { id: 'no_sale', label: 'No Venta' },
               { id: 'sellers', label: 'Vendedores' },
               { id: 'prices', label: 'Matriz Precios' }
             ].map(st => (
               <button 
                 key={st.id} 
                 onClick={() => setConfigSubTab(st.id as ConfigSubTab)}
                 className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${configSubTab === st.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {st.label}
               </button>
             ))}
          </div>
        )}

        {activeTab === 'export' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-indigo-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform"><Users size={120} /></div>
                <h4 className="text-lg font-black uppercase mb-4">Mirror Clientes</h4>
                <button onClick={() => { setActiveTab('clients'); setTimeout(handleExportData, 100); }} className="w-full py-4 bg-white text-indigo-900 rounded-2xl font-black uppercase text-[10px] tracking-widest">Descargar Excel Maestro</button>
             </div>
             <div className="bg-purple-600 p-8 rounded-[3rem] text-white shadow-xl relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform"><Settings size={120} /></div>
                <h4 className="text-lg font-black uppercase mb-4">Mirror Maestros Aux</h4>
                <button onClick={() => { setActiveTab('aux_masters'); setTimeout(handleExportData, 100); }} className="w-full py-4 bg-white text-purple-900 rounded-2xl font-black uppercase text-[10px] tracking-widest">Descargar Configuración</button>
             </div>
          </div>
        ) : (
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            {importStatus === 'IDLE' && (
               <div onClick={() => fileInputRef.current?.click()} className="border-4 border-dashed border-slate-100 rounded-[2.5rem] py-20 flex flex-col items-center justify-center bg-slate-50 hover:bg-blue-50/50 hover:border-blue-200 transition-all cursor-pointer group">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <FileSpreadsheet size={40} className="text-emerald-500" />
                  </div>
                  <p className="text-lg font-black text-slate-700 uppercase tracking-tight">Cargar {configSubTab || activeTab}</p>
                  <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xlsx,.xls" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImportStatus('PROCESSING');
                    try {
                      const rawData = await readDataFromFile(file);
                      processData(rawData);
                    } catch (err) { setImportStatus('ERROR'); }
                  }} />
               </div>
            )}
            {importStatus === 'PROCESSING' && (
               <div className="py-20 flex flex-col items-center gap-6">
                  <Loader2 size={80} className="text-blue-600 animate-spin" />
                  <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Sincronizando Maestro...</h4>
               </div>
            )}
            {importStatus === 'SUCCESS' && (
               <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto"><CheckCircle2 size={40} /></div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase">Sincronización Exitosa</h4>
                  <button onClick={() => setImportStatus('IDLE')} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Nueva Carga</button>
               </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncModule;
