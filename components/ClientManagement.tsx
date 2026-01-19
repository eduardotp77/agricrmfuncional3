
import React, { useState, useMemo, useRef } from 'react';
import { 
  Plus, Search, MapPin, Phone, Trash2, Edit2, X, Save, Database, 
  Globe, Map, CreditCard, UserCheck, Briefcase, Info, ChevronRight,
  Download, FileSpreadsheet, AlertCircle, Filter, RotateCcw, ChevronDown, ChevronUp,
  Upload, RefreshCw, Loader2, CheckCircle2, FileText
} from 'lucide-react';
import { Client, ClientStatus, Config, Prospect, RouteType, VisitFrequency, ClientType } from '../types';
import * as XLSX from 'xlsx';

interface ClientManagementProps {
  clients: Client[];
  config: Config;
  prospects: Prospect[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onFusionProspect: (prospect: Prospect) => void;
  onBulkAddClients: (clients: Client[]) => void;
}

const ClientManagement: React.FC<ClientManagementProps> = ({ 
  clients, config, onAddClient, onUpdateClient, onDeleteClient, onBulkAddClients 
}) => {
  // Estados de Búsqueda y Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Filtros persistentes
  const [filters, setFilters] = useState({
    routeId: '',
    status: '',
    city: '',
    decisionMaker: '',
    hasCredit: 'all' as 'all' | 'yes' | 'no'
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Client>>({});

  // Estados para importación
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'IDLE' | 'READING' | 'VALIDATING' | 'READY' | 'ERROR'>('IDLE');
  const [pendingClients, setPendingClients] = useState<Client[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const handleOpenModal = (client?: Client) => {
    if (client) {
      setFormData({ ...client });
      setIsEditing(true);
    } else {
      setFormData({
        id: `CL-${Date.now()}`,
        status: ClientStatus.ACTIVO,
        routeType: RouteType.TRADICIONAL,
        frequency: VisitFrequency.SEMANAL,
        priceList: 'PR001',
        creditLimit: 0,
        isActive: true,
        takeOrderWithDebt: false,
        visitOrder: (clients.length + 1),
        country: 'Colombia',
        city: 'Bucaramanga'
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilters({
      routeId: '',
      status: '',
      city: '',
      decisionMaker: '',
      hasCredit: 'all'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.docNumber || !formData.id) {
      alert("Código, Nombre y Documento son campos obligatorios de integridad.");
      return;
    }
    
    if (isEditing) {
      onUpdateClient(formData as Client);
    } else {
      onAddClient(formData as Client);
    }
    setIsModalOpen(false);
  };

  // Lógica de Importación de Archivos
  const processFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('READING');
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length < 2) throw new Error("El archivo no tiene suficientes filas.");

        setImportStatus('VALIDATING');
        
        setTimeout(() => {
          // Fix: Mapping missing Client properties: nit, contactName, zone, routes, location, mobile, isActive, takeOrderWithDebt, visitOrder, currentDebt, discountRate
          const mapped: Client[] = data.slice(1).map((row, idx) => {
            const id = row[0]?.toString() || `CL-IMPORT-${idx}`;
            const businessName = row[3]?.toString() || 'Sin Nombre';
            const nit = row[2]?.toString() || '';
            const address = row[11]?.toString() || '';
            const routeId = row[24]?.toString() || 'BUG001';
            const city = row[13]?.toString() || 'Bucaramanga';

            return {
              id,
              docType: row[1]?.toString() || 'NIT',
              docNumber: nit,
              nit: nit,
              name: businessName,
              businessName: businessName,
              contactName: businessName,
              branchCode: row[4]?.toString(),
              businessType: row[5]?.toString(),
              firstName: row[6]?.toString(),
              secondName: row[7]?.toString(),
              lastName: row[8]?.toString(),
              secondLastName: row[9]?.toString(),
              decisionMaker: row[10]?.toString(),
              address: address,
              neighborhood: row[12]?.toString(),
              city: city,
              zone: city,
              state: row[14]?.toString(),
              country: row[15]?.toString() || 'Colombia',
              phone: row[16]?.toString() || '',
              mobile: row[17]?.toString() || '',
              email: row[18]?.toString() || '',
              priceList: row[19]?.toString() || 'PR001',
              priceListId: row[19]?.toString() || 'PR001',
              paymentMethods: row[20]?.toString() || 'CONTADO',
              minOrder: parseFloat(row[21]?.toString() || '0'),
              creditLimit: parseFloat(row[22]?.toString().replace(',', '.') || '0'),
              discountRate: 0,
              currentDebt: 0,
              vendorId: row[23]?.toString(),
              routeId: routeId,
              routes: [routeId],
              visitOrder: parseInt(row[25]?.toString() || '1'),
              isActive: row[26]?.toString() === "1",
              takeOrderWithDebt: row[27]?.toString() === "1",
              longitude: parseFloat(row[28]?.toString() || '0'),
              latitude: parseFloat(row[29]?.toString() || '0'),
              location: {
                lat: parseFloat(row[29]?.toString() || '0'),
                lng: parseFloat(row[28]?.toString() || '0'),
                address: address
              },
              status: ClientStatus.ACTIVO,
              type: 'tradicional' as ClientType,
              routeType: RouteType.TRADICIONAL,
              frequency: VisitFrequency.SEMANAL
            };
          }).filter(c => c.docNumber && c.name !== 'Sin Nombre');

          if (mapped.length === 0) {
            setImportErrors(["No se encontraron clientes con Nombre y NIT válidos."]);
            setImportStatus('ERROR');
          } else {
            setPendingClients(mapped);
            setImportStatus('READY');
          }
        }, 1200);
      } catch (err) {
        setImportErrors(["Error al procesar el archivo. Formato no soportado."]);
        setImportStatus('ERROR');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImport = () => {
    onBulkAddClients(pendingClients);
    setIsImportModalOpen(false);
    setImportStatus('IDLE');
    setPendingClients([]);
    alert(`Se han incorporado ${pendingClients.length} clientes al maestro universal.`);
  };

  // Lógica de Filtrado Avanzado (Combinable)
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const s = searchTerm.toLowerCase();
      
      // Búsqueda textual amplia
      const matchesSearch = 
        c.name.toLowerCase().includes(s) || 
        c.id.toLowerCase().includes(s) ||
        c.docNumber.includes(s) ||
        (c.address || '').toLowerCase().includes(s);

      // Filtros específicos
      const matchesRoute = filters.routeId ? c.routeId === filters.routeId : true;
      const matchesStatus = filters.status ? c.status === filters.status : true;
      const matchesCity = filters.city ? c.city === filters.city : true;
      const matchesDecision = filters.decisionMaker 
        ? (c.decisionMaker || '').toLowerCase().includes(filters.decisionMaker.toLowerCase()) ||
          (c.responsiblePerson || '').toLowerCase().includes(filters.decisionMaker.toLowerCase())
        : true;
      
      const matchesCredit = filters.hasCredit === 'all' 
        ? true 
        : filters.hasCredit === 'yes' ? (c.creditLimit || 0) > 0 : (c.creditLimit || 0) === 0;

      return matchesSearch && matchesRoute && matchesStatus && matchesCity && matchesDecision && matchesCredit;
    });
  }, [clients, searchTerm, filters]);

  const handleExport30Col = () => {
    const headers = [
      "CÓDIGO", "TIPO DOC", "NIT/CC", "NEGOCIO", "SUCURSAL", "TIPO NEG",
      "NOMBRE 1", "NOMBRE 2", "APELLIDO 1", "APELLIDO 2", "DECISOR",
      "DIRECCIÓN", "BARRIO", "CIUDAD", "DEPTO", "PAÍS", "TEL", "CEL",
      "EMAIL", "LISTA PRECIO", "PAGO", "MIN ORD", "CUPO", "VEND", "RUTA",
      "VISITA ORD", "ACTIVO", "CARTERA ORD", "LONG", "LAT"
    ];

    const rows = clients.map(c => [
      c.id, c.docType || "NIT", c.docNumber, c.name, c.branchCode || "001", c.businessType || "AGRO",
      c.firstName || "", c.secondName || "", c.lastName || "", c.secondLastName || "",
      c.decisionMaker || c.responsiblePerson || "", c.address, c.neighborhood || "", c.city, c.state || "",
      c.country || "Colombia", c.phone || "", c.mobile, c.email || "", c.priceList,
      c.paymentMethods || "CONTADO", c.minOrder || 0, c.creditLimit, c.vendorId || "ADM", c.routeId,
      c.visitOrder || 1, c.isActive !== false ? 1 : 0, c.takeOrderWithDebt ? 1 : 0, c.longitude || 0, c.latitude || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MAESTRO_CLIENTES_EXPORT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Corporativo con Contadores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-[#0f172a] p-8 rounded-[3rem] text-white flex items-center justify-between relative overflow-hidden shadow-2xl border border-white/5">
          <div className="absolute -right-10 -bottom-10 opacity-10"><Database size={200} /></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Maestro Universal</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Protocolo de Gestión de Identidades Agronaturex.</p>
          </div>
          <div className="p-4 bg-blue-600 rounded-3xl shadow-xl relative z-10">
             <FileSpreadsheet size={32} />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clientes Activos</p>
           <p className="text-3xl font-black text-slate-800">{clients.filter(c => c.isActive).length}</p>
        </div>
        <div className="bg-white p-4 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center gap-3">
           <div className="flex gap-2">
              <button 
                onClick={() => handleOpenModal()}
                className="w-14 h-14 bg-[#0056b2] text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
                title="Alta Individual"
              >
                <Plus size={28} />
              </button>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform active:scale-95"
                title="Importación Masiva"
              >
                <Upload size={24} />
              </button>
           </div>
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gestión Maestro</p>
        </div>
      </div>

      {/* Buscador y Panel de Filtros Avanzados */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Búsqueda rápida por nombre, ID o NIT..."
              className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 text-sm font-bold placeholder:text-slate-300 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${isFilterOpen ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <Filter size={16} /> Búsqueda Avanzada
              {isFilterOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button 
              onClick={handleExport30Col}
              className="px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 hover:bg-slate-800 transition-all"
            >
              <Download size={16} /> Exportar
            </button>
          </div>
        </div>

        {/* Panel Expandible de Filtros */}
        {isFilterOpen && (
          <div className="p-8 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Zona / Ciudad</label>
                   <select 
                     className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                     value={filters.city}
                     onChange={e => setFilters({...filters, city: e.target.value})}
                   >
                      <option value="">Todas las Zonas</option>
                      {config.zones.map(z => <option key={z} value={z}>{z}</option>)}
                   </select>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ruta Asignada</label>
                   <select 
                     className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                     value={filters.routeId}
                     onChange={e => setFilters({...filters, routeId: e.target.value})}
                   >
                      <option value="">Cualquier Ruta</option>
                      {config.routes.map(r => <option key={r} value={r}>{r}</option>)}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado de Relación</label>
                   <select 
                     className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                     value={filters.status}
                     onChange={e => setFilters({...filters, status: e.target.value})}
                   >
                      <option value="">Todos los Estados</option>
                      {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s.split(' / ')[0]}</option>)}
                   </select>
                </div>

                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Condición de Crédito</label>
                   <select 
                     className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                     value={filters.hasCredit}
                     onChange={e => setFilters({...filters, hasCredit: e.target.value as any})}
                   >
                      <option value="all">Ver Todos</option>
                      <option value="yes">Con Cupo de Crédito</option>
                      <option value="no">Solo Contado</option>
                   </select>
                </div>

                <div className="lg:col-span-2 space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Decisor de Compra / Propietario</label>
                   <input 
                     type="text" 
                     placeholder="Buscar por nombre del decisor..."
                     className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                     value={filters.decisionMaker}
                     onChange={e => setFilters({...filters, decisionMaker: e.target.value})}
                   />
                </div>

                <div className="lg:col-span-2 flex items-end">
                   <button 
                    onClick={resetFilters}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all active:scale-95"
                   >
                      <RotateCcw size={14} /> Limpiar Filtros
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Tabla Maestro Universal */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest border-b border-slate-800">
                <th className="p-6 w-16 text-emerald-500">COD</th>
                <th className="p-6">Establecimiento Maestro</th>
                <th className="p-6">Decisor / Responsable</th>
                <th className="p-6">Localización / Ruta</th>
                <th className="p-6 text-center">Condiciones</th>
                <th className="p-6 text-center">Estado CRM</th>
                <th className="p-6 text-right">Mando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-6 font-black text-slate-800 bg-slate-50/50 group-hover:bg-emerald-50 transition-colors">{c.id}</td>
                  <td className="p-6">
                    <p className="font-black text-slate-900 text-sm uppercase leading-none mb-1">{c.name}</p>
                    <p className="text-slate-400 font-bold tracking-widest text-[9px] uppercase italic">{c.docNumber}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-slate-700 uppercase">{c.decisionMaker || c.responsiblePerson || 'No registrado'}</p>
                    <p className="text-slate-400 font-bold text-[9px] mt-0.5">{c.mobile || c.phone || 'Sin contacto'}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                       <MapPin size={12} className="text-blue-500" />
                       <span className="font-black text-slate-700 uppercase">{c.routeId}</span>
                    </div>
                    <p className="text-slate-400 font-medium truncate max-w-[180px]">{c.city} - {c.address}</p>
                  </td>
                  <td className="p-6 text-center">
                    <div className="bg-slate-50 rounded-xl py-2 px-3 inline-block">
                       <p className="font-black text-slate-900 text-xs">${(c.creditLimit || 0).toLocaleString()}</p>
                       <p className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Lista: {c.priceList}</p>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1.5 rounded-xl font-black uppercase text-[8px] border-2 ${
                      c.status === ClientStatus.ACTIVO ? 'border-emerald-100 text-emerald-600 bg-emerald-50' :
                      c.status === ClientStatus.FRIO ? 'border-blue-100 text-blue-400 bg-blue-50' :
                      c.status === ClientStatus.CALIFICADO ? 'border-amber-100 text-amber-500 bg-amber-50' :
                      'border-slate-100 text-slate-400 bg-slate-50'
                    }`}>
                       {c.status.split(' / ')[0]}
                    </span>
                  </td>
                  <td className="p-6 text-right flex gap-2 justify-end">
                     <button onClick={() => handleOpenModal(c)} className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <Edit2 size={18} />
                     </button>
                     <button onClick={() => { if(confirm('¿Eliminar cliente del maestro?')) onDeleteClient(c.id); }} className="p-3 bg-white border border-slate-100 text-slate-300 rounded-2xl hover:bg-red-50 hover:text-white transition-all shadow-sm">
                        <Trash2 size={18} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredClients.length === 0 && (
           <div className="py-32 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200 border-2 border-dashed border-slate-200">
                <Search size={48}/>
              </div>
              <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tighter">Sin coincidencias encontradas</h3>
              <p className="text-sm text-slate-300 italic font-medium max-w-sm mx-auto">Prueba ajustando los filtros avanzados o verificando el criterio de búsqueda rápida.</p>
              <button onClick={resetFilters} className="mt-8 px-8 py-3 bg-[#0056b2] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest">Resetear todo</button>
           </div>
        )}
      </div>

      {/* Modal Avanzado Tomapedidos Individual */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-6xl h-[90vh] shadow-2xl border border-white/20 animate-in zoom-in duration-300 flex flex-col overflow-hidden">
            
            <div className="p-8 bg-[#0056b2] text-white flex justify-between items-center shadow-xl shrink-0">
               <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-[2rem] backdrop-blur-md border border-white/10">
                     <Database size={32} />
                  </div>
                  <div>
                     <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">{isEditing ? 'Ajustar Ficha Maestro' : 'Alta de Cliente Institucional'}</h3>
                     <p className="text-[10px] font-black text-blue-200 uppercase tracking-[0.3em] mt-2">Protocolo de Datos Maestros 30 Columnas</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90"><X size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar bg-slate-50/50">
               
               <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] border-b border-blue-100 pb-3 flex items-center gap-2">
                     <Database size={16} /> I. Identidad Fiscal e Institucional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Único (ID) *</label>
                        <input required className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm focus:ring-4 focus:ring-blue-500/10" value={formData.id || ''} onChange={e => setFormData({...formData, id: e.target.value})} placeholder="Ej: C10" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Tipo Documento</label>
                        <select className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.docType || 'NIT'} onChange={e => setFormData({...formData, docType: e.target.value})}>
                           <option value="NIT">NIT</option>
                           <option value="CC">Cédula Ciudadanía</option>
                        </select>
                     </div>
                     <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Número Documento / NIT *</label>
                        <input required className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm" value={formData.docNumber || ''} onChange={e => setFormData({...formData, docNumber: e.target.value})} placeholder="900.123.456-1" />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial del Negocio *</label>
                        <input required className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="TIENDA DONDE RICARDO" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Razón Social Legal</label>
                        <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.businessName || ''} onChange={e => setFormData({...formData, businessName: e.target.value})} placeholder="Inversiones Agri S.A.S" />
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-200 pb-3 flex items-center gap-2">
                     <Briefcase size={16} /> II. Datos del Decisor y Responsable
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Decisor de Compra (Dueño / Gerente)</label>
                        <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.decisionMaker || ''} onChange={e => setFormData({...formData, decisionMaker: e.target.value})} placeholder="Nombre completo del decisor" />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Persona de Contacto / Responsable</label>
                        <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.responsiblePerson || ''} onChange={e => setFormData({...formData, responsiblePerson: e.target.value})} placeholder="Nombre del contacto principal" />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} placeholder="Primer Nombre" />
                     <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.secondName || ''} onChange={e => setFormData({...formData, secondName: e.target.value})} placeholder="Segundo Nombre" />
                     <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} placeholder="Primer Apellido" />
                     <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.secondLastName || ''} onChange={e => setFormData({...formData, secondLastName: e.target.value})} placeholder="Segundo Apellido" />
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.2em] border-b border-emerald-100 pb-3 flex items-center gap-2">
                     <MapPin size={16} /> III. Localización y Logística de Despacho
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección Exacta de Entrega *</label>
                        <input required className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm" value={formData.address || ''} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Calle / Carrera / Avenida..." />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Barrio</label>
                        <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.neighborhood || ''} onChange={e => setFormData({...formData, neighborhood: e.target.value})} placeholder="Ej. El Bosque" />
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                     <select className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm" value={formData.city || ''} onChange={e => setFormData({...formData, city: e.target.value})}>
                        {config.zones.map(z => <option key={z} value={z}>{z}</option>)}
                     </select>
                     <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.state || 'SANTANDER'} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="Departamento" />
                     <input required className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm text-blue-600" value={formData.mobile || ''} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="Celular Principal *" />
                     <input className="w-full p-4 bg-white border-none rounded-2xl text-sm font-bold shadow-sm" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="Email Corporativo" />
                  </div>
               </div>

               <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-amber-600 uppercase tracking-[0.2em] border-b border-amber-100 pb-3 flex items-center gap-2">
                     <CreditCard size={16} /> IV. Parámetros Comerciales y de Cartera
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Lista de Precios Tomapedidos</label>
                        <select className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm" value={formData.priceList} onChange={e => setFormData({...formData, priceList: e.target.value})}>
                           {config.priceLists.map(pl => <option key={pl} value={pl}>{pl}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Límite de Crédito Autorizado ($)</label>
                        <input type="number" className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black text-blue-600 shadow-sm" value={formData.creditLimit} onChange={e => setFormData({...formData, creditLimit: parseFloat(e.target.value)})} />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Ruta Maestro Asignada</label>
                        <select className="w-full p-4 bg-white border-none rounded-2xl text-sm font-black shadow-sm" value={formData.routeId} onChange={e => setFormData({...formData, routeId: e.target.value})}>
                           {config.routes.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white">
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.takeOrderWithDebt ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`} onClick={() => setFormData({...formData, takeOrderWithDebt: !formData.takeOrderWithDebt})}>
                           {formData.takeOrderWithDebt && <UserCheck size={14} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Pedido con Deuda</span>
                     </label>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isActive ? 'bg-emerald-50 border-emerald-500' : 'border-white/20'}`} onClick={() => setFormData({...formData, isActive: !formData.isActive})}>
                           {formData.isActive && <UserCheck size={14} />}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Cliente Activo</span>
                     </label>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Estado CRM</label>
                        <select className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as ClientStatus})}>
                           {Object.values(ClientStatus).map(s => <option key={s} value={s} className="bg-slate-900">{s.split(' / ')[0]}</option>)}
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Orden en Ruta</label>
                        <input type="number" className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-sm font-black outline-none" value={formData.visitOrder} onChange={e => setFormData({...formData, visitOrder: parseInt(e.target.value)})} />
                     </div>
                  </div>
               </div>

               <div className="flex gap-4 pt-10 sticky bottom-0 bg-slate-50/95 backdrop-blur-sm py-6 border-t border-slate-200">
                  <button type="submit" className="flex-[2] py-6 bg-[#0056b2] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-900/40 hover:bg-blue-700 active-scale transition-all flex items-center justify-center gap-4">
                     <Save size={24} /> {isEditing ? 'Consolidar Cambios en Maestro' : 'Incorporar Cliente al Espejo'}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-6 bg-white border-2 border-slate-200 text-slate-400 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:text-red-500 transition-all active:scale-95">
                     Descartar
                  </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Avanzado de Importación (Motor Tomapedidos) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-12 shadow-2xl animate-in zoom-in duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
                 <div className="h-full bg-blue-600 animate-progress"></div>
              </div>

              <div className="flex justify-between items-start mb-10">
                 <div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Motor de Importación</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Maestro Institucional 30 Columnas</p>
                 </div>
                 <button onClick={() => { setIsImportModalOpen(false); setImportStatus('IDLE'); }} className="p-3 bg-slate-100 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"><X /></button>
              </div>

              {importStatus === 'IDLE' && (
                <div className="space-y-8">
                   <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="group border-4 border-dashed border-slate-100 rounded-[2.5rem] py-16 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer"
                   >
                      <div className="p-6 bg-white rounded-3xl shadow-xl mb-6 group-hover:scale-110 transition-transform">
                         <Upload size={48} className="text-blue-600" />
                      </div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Sube tu archivo Maestro</p>
                      <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Excel (.xlsx) o CSV</p>
                      <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={processFile} />
                   </div>

                   <div className="flex items-center justify-between p-6 bg-blue-50 rounded-3xl border border-blue-100">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><FileText size={24} /></div>
                         <div>
                            <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Estructura Estándar</p>
                            <p className="text-xs text-blue-900/60 font-medium italic">30 columnas institucionales.</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleExport30Col()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all"
                      >
                         Bajar Plantilla
                      </button>
                   </div>
                </div>
              )}

              {(importStatus === 'READING' || importStatus === 'VALIDATING') && (
                <div className="py-20 flex flex-col items-center space-y-8">
                   <div className="relative">
                      <Loader2 size={100} className="text-[#0056b2] animate-spin" />
                      <Database size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
                   </div>
                   <div className="text-center">
                      <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Validando Espejo de Datos</h4>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2 animate-pulse">Analizando integridad de columnas...</p>
                   </div>
                </div>
              )}

              {importStatus === 'READY' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                   <div className="p-10 bg-emerald-50 rounded-[3rem] border border-emerald-100 text-center relative overflow-hidden">
                      <div className="absolute -right-10 -bottom-10 opacity-10"><CheckCircle2 size={150} /></div>
                      <div className="w-24 h-24 bg-white text-emerald-600 rounded-[2.2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl border-4 border-emerald-100 relative z-10">
                         <CheckCircle2 size={48} />
                      </div>
                      <h4 className="text-3xl font-black text-emerald-900 uppercase tracking-tighter relative z-10">¡Importación Lista!</h4>
                      <p className="text-sm text-emerald-700/70 font-medium italic mt-2 relative z-10">Se han procesado {pendingClients.length} registros válidos.</p>
                   </div>
                   
                   <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                      <div className="p-4 bg-white border-b border-slate-200 flex justify-between">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vista Previa (30 Col)</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto p-4 space-y-2">
                         {pendingClients.slice(0, 3).map((c, i) => (
                           <div key={i} className="flex justify-between items-center text-[10px] font-bold text-slate-600 bg-white p-2 rounded-xl border border-slate-100">
                              <span className="uppercase">{c.name}</span>
                              <span className="text-blue-500 font-black">{c.docNumber}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <button onClick={handleCommitImport} className="py-5 bg-slate-950 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95">
                         <Save size={20} /> Consolidar en Maestro
                      </button>
                      <button onClick={() => {setImportStatus('IDLE'); setPendingClients([]);}} className="py-5 bg-white border-2 border-slate-100 text-slate-400 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:text-red-500 transition-all active:scale-95">
                         Descartar
                      </button>
                   </div>
                </div>
              )}

              {importStatus === 'ERROR' && (
                <div className="py-12 text-center space-y-8">
                   <div className="w-24 h-24 bg-red-50 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl border-4 border-red-100">
                      <AlertCircle size={48} />
                   </div>
                   <div>
                      <h4 className="text-2xl font-black text-red-900 uppercase tracking-tighter">Inconsistencia Maestro</h4>
                      <div className="mt-4 p-4 bg-red-50 rounded-2xl text-left border border-red-100">
                         {importErrors.map((err, i) => <p key={i} className="text-xs text-red-700 font-bold flex items-center gap-2 mb-1"><span className="w-1 h-1 bg-red-400 rounded-full"></span> {err}</p>)}
                      </div>
                   </div>
                   <button onClick={() => setImportStatus('IDLE')} className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg">Intentar de Nuevo</button>
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement;
