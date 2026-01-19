
import React, { useState, useRef } from 'react';
import { Download, Upload, FileText, MessageCircle, RefreshCcw, Search, DollarSign, Wallet, Phone, Send, Info } from 'lucide-react';
import { CarteraItem, Client } from '../types';

interface CarteraModuleProps {
  cartera: CarteraItem[];
  clients: Client[];
  onImportCartera: (items: CarteraItem[]) => void;
}

const CarteraModule: React.FC<CarteraModuleProps> = ({ cartera, clients, onImportCartera }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      // Header: CÓDIGO CLIENTE;NOMBRE CLIENTE;CÓDIGO TIPO DE DOCUMENTO;NÚMERO DE DOCUMENTO;NUMERO DE PEDIDO;FECHA DEL DOCUMENTO;FECHA DE EXPIRACIÓN;VALOR;SALDO
      const items: CarteraItem[] = lines.slice(1).map(line => {
        const p = line.split(';');
        return {
          clientId: p[0]?.trim(),
          clientName: p[1]?.trim(),
          docTypeCode: p[2]?.trim() as 'RC' | 'FV',
          docNumber: p[3]?.trim(),
          orderNumber: p[4]?.trim(),
          docDate: p[5]?.trim(),
          expiryDate: p[6]?.trim(),
          value: parseFloat(p[7]?.replace(',', '.') || '0'),
          balance: parseFloat(p[8]?.replace(',', '.') || '0'),
        };
      });
      onImportCartera(items);
    };
    reader.readAsText(file);
  };

  const filteredCartera = cartera.filter(item => 
    item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.clientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCartera = cartera.reduce((sum, item) => sum + item.balance, 0);

  const sendWhatsApp = (item: CarteraItem) => {
    const client = clients.find(c => c.id === item.clientId);
    if (!client) return;
    
    const message = `*ESTADO DE CUENTA - AGRICRM*%0A` +
      `Hola *${item.clientName}*, te enviamos el reporte de tu saldo pendiente:%0A%0A` +
      `📌 *Documento:* ${item.docTypeCode} ${item.docNumber}%0A` +
      `📅 *Vencimiento:* ${item.expiryDate}%0A` +
      `💰 *Saldo Pendiente:* $${item.balance.toLocaleString()}%0A%0A` +
      `_Por favor confirmar el pago. Gracias._`;
    
    window.open(`https://wa.me/${client.mobile}?text=${message}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
                 <Wallet size={32} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cartera Consolidada</p>
                 <p className="text-3xl font-black text-slate-800 tracking-tighter">${totalCartera.toLocaleString()}</p>
              </div>
           </div>
           <div className="flex gap-2">
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileLoad} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl"
              >
                <Upload size={16} /> Cargar Cartera (;)
              </button>
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-500 transition-colors">
                <RefreshCcw size={20} />
              </button>
           </div>
        </div>
        
        <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-900/20 text-white relative overflow-hidden flex flex-col justify-center">
           <div className="absolute -right-4 -bottom-4 opacity-10"><DollarSign size={80} /></div>
           <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Cuentas por Cobrar</p>
           <p className="text-xl font-black tracking-tight">{cartera.length} Facturas</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar cliente en cartera..."
          className="flex-1 outline-none text-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[10px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest border-b border-slate-100">
                <th className="p-5">Cód. Cliente</th>
                <th className="p-5">Establecimiento</th>
                <th className="p-5">Tipo / Nro</th>
                <th className="p-5">Vencimiento</th>
                <th className="p-5">Valor</th>
                <th className="p-5 text-emerald-600">Saldo</th>
                <th className="p-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCartera.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-5 font-black text-slate-800">{item.clientId}</td>
                  <td className="p-5">
                    <p className="font-black text-slate-700 uppercase">{item.clientName}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">
                      {item.docTypeCode === 'RC' ? 'Canal Tradicional' : 'Institucional'}
                    </p>
                  </td>
                  <td className="p-5">
                    <span className={`px-2 py-1 rounded-md font-black text-[9px] mr-2 ${item.docTypeCode === 'FV' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                       {item.docTypeCode}
                    </span>
                    <span className="font-bold text-slate-600">{item.docNumber}</span>
                  </td>
                  <td className="p-5">
                    <p className="font-bold text-slate-700">{item.expiryDate}</p>
                    <p className="text-[8px] text-slate-400">Emisión: {item.docDate}</p>
                  </td>
                  <td className="p-5 text-slate-400 font-bold">${item.value.toLocaleString()}</td>
                  <td className="p-5 font-black text-slate-800 text-xs">${item.balance.toLocaleString()}</td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => sendWhatsApp(item)}
                      className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      title="Enviar Cobro WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCartera.length === 0 && (
                <tr>
                   <td colSpan={7} className="p-20 text-center">
                      <div className="flex flex-col items-center opacity-30">
                         <FileText size={48} className="mb-4" />
                         <p className="font-black uppercase tracking-widest text-xs">No se encontraron saldos de cartera</p>
                      </div>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CarteraModule;
