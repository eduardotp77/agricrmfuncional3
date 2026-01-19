
import React, { useState } from 'react';
import { Download, Upload, FileSpreadsheet, Plus, Search, MapPin, CheckCircle2, ChevronRight, Filter, Database, TrendingUp, Info } from 'lucide-react';
import { Client, ClientStatus } from '../types';

interface TomapedidosClientTableProps {
  clients: Client[];
  onAddClient: (c: Client) => void;
  onUpdateClient: (c: Client) => void;
}

const TomapedidosClientTable: React.FC<TomapedidosClientTableProps> = ({ clients, onAddClient, onUpdateClient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    const headers = [
      "CÓDIGO (Obligatorio)", "TIPO DOCUMENTO (Obligatorio)", "NÚMERO DOCUMENTO (Obligatorio)",
      "NOMBRE DEL NEGOCIO (Obligatorio)", "CÓDIGO DE SUCURSAL", "TIPO DE NEGOCIO",
      "PRIMER NOMBRE (Obligatorio)", "SEGUNDO NOMBRE", "PRIMER APELLIDO", "SEGUNDO APELLIDO",
      "PERSONA A CARGO", "DIRECCIÓN (Obligatorio)", "BARRIO", "CIUDAD", "DEPARTAMENTO",
      "PAÍS", "TELÉFONO", "CELULAR (Obligatorio)", "CORREO ELECTRÓNICO", "LISTA DE PRECIOS",
      "MÉTODOS DE PAGO", "PEDIDO MINIMO", "LÍMITE DE CRÉDITO", "VENDEDOR", "RUTA",
      "ÓRDEN DE VISITA", "ACTIVO", "TOMAR_ORDEN_CON_CARTERA (1 = SI, 0 = NO)", "LONGITUD", "LATITUD"
    ];

    const rows = clients.map(c => [
      c.id, c.docType || "NIT", c.docNumber, c.name, c.branchCode || "001", c.businessType || "AGRO",
      c.firstName || c.name.split(' ')[0], c.secondName || "", c.lastName || "", c.secondLastName || "",
      c.responsiblePerson || c.decisionMaker || "", c.address, c.neighborhood || "", c.city, c.state || "",
      c.country || "Colombia", c.phone || "", c.mobile, c.email || "", c.priceList,
      c.paymentMethods || "CONTADO", c.minOrder || 0, c.creditLimit, c.vendorId || "ADM", c.routeId,
      c.visitOrder || 1, c.isActive !== false ? 1 : 0, c.takeOrderWithDebt ? 1 : 0, c.longitude || 0, c.latitude || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(";")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MAESTRO_TOMAPEDIDOS_FULL_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Resumen de Integridad Maestro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-2 bg-[#0f172a] p-8 rounded-[3rem] text-white flex items-center justify-between relative overflow-hidden shadow-2xl border border-white/5">
            <div className="absolute -right-10 -bottom-10 opacity-10"><Database size={150} /></div>
            <div className="relative z-10">
               <h2 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Espejo Tomapedidos</h2>
               <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">Sincronización de 30 Columnas Estándar.</p>
            </div>
            <div className="p-4 bg-emerald-500 rounded-3xl shadow-xl shadow-emerald-900/40 relative z-10">
               <CheckCircle2 size={32} />
            </div>
         </div>
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Registros Validados</p>
            <p className="text-3xl font-black text-slate-800">{clients.length}</p>
         </div>
         <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Alertas Datos</p>
            <p className="text-3xl font-black text-red-500">0</p>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl border border-slate-100">
        <div className="flex-1 w-full flex items-center gap-3 px-4">
           <Search className="text-slate-400" size={20} />
           <input 
             type="text" 
             placeholder="Buscar en el maestro universal..." 
             className="w-full py-3 outline-none text-sm font-bold placeholder:text-slate-300"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button onClick={handleExport} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 font-black text-[10px] uppercase tracking-widest transition-all">
            <Download size={16} /> Exportar 30 Col
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-[#0056b2] text-white rounded-2xl hover:bg-blue-700 font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 active-scale">
            <Plus size={16} /> Alta Maestro
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-[10px]">
            <thead>
              <tr className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest border-b border-slate-800">
                <th className="p-6 w-16 text-emerald-500">COD</th>
                <th className="p-6">Establecimiento Maestro</th>
                <th className="p-6">Geolocalización / Ruta</th>
                <th className="p-6">Condición Financiera</th>
                <th className="p-6 text-center">Crédito</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-right">Mando</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="p-6 font-black text-slate-800 bg-slate-50/50 group-hover:bg-emerald-50 transition-colors">{c.id}</td>
                  <td className="p-6">
                    <p className="font-black text-slate-900 text-sm uppercase leading-none mb-1">{c.name}</p>
                    <p className="text-slate-400 font-bold tracking-widest text-[9px] uppercase italic">{c.city} - {c.neighborhood || 'SIN BARRIO'}</p>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 mb-1">
                       <MapPin size={12} className="text-blue-500" />
                       <span className="font-black text-slate-700 uppercase">{c.routeId}</span>
                    </div>
                    <p className="text-slate-400 font-medium truncate max-w-[180px]">{c.address}</p>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-blue-600 uppercase tracking-tighter">LISTA: {c.priceList}</p>
                    <p className="text-slate-400 font-bold uppercase mt-0.5">{c.paymentMethods || 'CONTADO'}</p>
                  </td>
                  <td className="p-6 text-center">
                    <div className="bg-slate-50 rounded-xl py-2 px-3 inline-block">
                       <p className="font-black text-slate-900 text-xs">${c.creditLimit.toLocaleString()}</p>
                       <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Cupo Asignado</p>
                    </div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1.5 rounded-xl font-black uppercase text-[8px] border-2 ${
                      c.status === ClientStatus.ACTIVO ? 'border-emerald-100 text-emerald-600 bg-emerald-50' :
                      c.status === ClientStatus.CALIFICADO ? 'border-blue-100 text-blue-600 bg-blue-50' :
                      'border-slate-100 text-slate-400 bg-slate-50'
                    }`}>
                       {c.status.split(' / ')[0]}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                     <button className="p-3 bg-white border border-slate-100 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-sm">
                        <ChevronRight size={18} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div className="py-32 text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                <FileSpreadsheet size={48} />
             </div>
             <h4 className="text-xl font-black text-slate-400 uppercase tracking-tighter">No hay datos que coincidan</h4>
             <p className="text-sm text-slate-300 font-medium italic mt-1">Refina tu búsqueda o importa un nuevo maestro.</p>
          </div>
        )}
      </div>

      {/* Panel Informativo de Tomapedidos */}
      <div className="bg-blue-50 p-8 rounded-[3rem] border border-blue-100 flex items-start gap-6">
         <div className="p-4 bg-white rounded-3xl text-blue-600 shadow-xl shadow-blue-900/10">
            <Info size={32} />
         </div>
         <div>
            <h4 className="text-lg font-black text-blue-900 uppercase tracking-tighter mb-2">Protocolo de Importación</h4>
            <p className="text-sm text-blue-700/70 font-medium leading-relaxed max-w-3xl italic">
               Este maestro es el núcleo del sistema de despacho. Cualquier cambio realizado aquí impactará directamente en la ruta del entregador y en la terminal de toma de pedidos móvil. Asegúrese de que el CÓDIGO (ID) sea único para evitar duplicidad de saldos en cartera.
            </p>
         </div>
      </div>
    </div>
  );
};

export default TomapedidosClientTable;
