
import React, { useState, useRef } from 'react';
import { Upload, X, ChevronRight, CheckCircle2, AlertTriangle, Table as TableIcon, Download, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Prospect, ProspectStatus } from '../types';
import * as XLSX from 'xlsx';

interface ProspectImportProps {
  onImport: (prospects: Prospect[]) => void;
}

const ProspectImport: React.FC<ProspectImportProps> = ({ onImport }) => {
  const [importStatus, setImportStatus] = useState<'IDLE' | 'READING' | 'MAPPING' | 'ERROR'>('IDLE');
  const [fileData, setFileData] = useState<any[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const TARGET_FIELDS = [
    { key: 'name', label: 'Nombre Persona', required: true },
    { key: 'businessName', label: 'Nombre Establecimiento', required: true },
    { key: 'interest', label: 'Interés / Notas', required: false },
    { key: 'estimatedPurchase', label: 'Potencial ($)', required: false },
    { key: 'source', label: 'Fuente (Maps/Web)', required: false }
  ];

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Nombre Persona;Nombre Establecimiento;Interes;Potencial;Fuente\nCarlos Sanchez;Agrotodo Lebrija;Busca fertilizante foliar;1500000;Google Maps";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "PLANTILLA_PROSPECTOS_AGRICRM.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus('READING');
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        if (data.length < 1) throw new Error("Archivo vacío.");

        setHeaders(data[0].map(h => h?.toString().trim() || "Columna vacía"));
        setFileData(data.slice(1));
        
        // Auto-mapeo inteligente por nombre
        const newMapping: Record<string, number> = {};
        data[0].forEach((h, idx) => {
          const header = h?.toString().toLowerCase();
          if (header.includes("nombre") || header.includes("persona")) newMapping['name'] = idx;
          if (header.includes("negocio") || header.includes("establecimiento") || header.includes("finca")) newMapping['businessName'] = idx;
          if (header.includes("interes") || header.includes("notas")) newMapping['interest'] = idx;
          if (header.includes("potencial") || header.includes("valor")) newMapping['estimatedPurchase'] = idx;
          if (header.includes("fuente")) newMapping['source'] = idx;
        });

        setMapping(newMapping);
        setImportStatus('MAPPING');
      } catch (err) {
        setErrorMsg("Formato de archivo no reconocido. Use CSV o Excel.");
        setImportStatus('ERROR');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCompleteImport = () => {
    // Validar mapeo de campos obligatorios
    const missingFields = TARGET_FIELDS.filter(f => f.required && mapping[f.key] === undefined);
    
    if (missingFields.length > 0) {
      alert(`Error: Debe asignar las columnas para: ${missingFields.map(f => f.label).join(", ")}`);
      return;
    }

    // Correctly initialized customFields to fix missing property error
    const importedProspects: Prospect[] = fileData
      .filter(row => row[mapping['name']] && row[mapping['businessName']])
      .map((row, idx) => ({
        id: `IMP-${Date.now()}-${idx}`,
        name: row[mapping['name']]?.toString() || 'Sin Nombre',
        businessName: row[mapping['businessName']]?.toString() || 'Sin Negocio',
        interest: row[mapping['interest']]?.toString() || '',
        status: ProspectStatus.SIN_CALIFICAR,
        lastInteractionDate: new Date().toISOString(),
        estimatedPurchase: parseFloat(row[mapping['estimatedPurchase']]?.toString().replace(/\D/g, '') || '0'),
        totalPurchased: 0,
        repurchaseCount: 0,
        source: row[mapping['source']]?.toString() || 'Importado',
        customFields: {}
      }));

    onImport(importedProspects);
    setImportStatus('IDLE');
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 overflow-hidden">
      {importStatus === 'IDLE' && (
        <div className="space-y-8">
           <div 
            onClick={() => fileInputRef.current?.click()}
            className="group border-4 border-dashed border-slate-100 rounded-[2.5rem] py-16 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-emerald-50 hover:border-emerald-200 transition-all cursor-pointer"
           >
              <div className="p-6 bg-white rounded-3xl shadow-xl mb-6 group-hover:scale-110 transition-transform">
                 <Upload size={48} className="text-emerald-600" />
              </div>
              <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Importar Base de Prospectos</p>
              <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Excel o CSV</p>
              <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
           </div>

           <div className="flex items-center justify-between p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm"><FileText size={24} /></div>
                 <div>
                    <p className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Guía de Estructura</p>
                    <p className="text-xs text-emerald-900/60 font-medium italic">Descarga la plantilla oficial.</p>
                 </div>
              </div>
              <button 
                onClick={handleDownloadTemplate}
                className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/20 hover:bg-emerald-700 transition-all"
              >
                 Descargar Plantilla
              </button>
           </div>
        </div>
      )}

      {importStatus === 'READING' && (
        <div className="py-20 flex flex-col items-center space-y-6">
           <Loader2 size={80} className="text-emerald-600 animate-spin" />
           <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Procesando registros...</h4>
        </div>
      )}

      {importStatus === 'MAPPING' && (
        <div className="space-y-8 animate-in slide-in-from-right duration-300">
          <div className="flex justify-between items-center border-b border-slate-50 pb-4">
             <div>
                <h3 className="font-black text-slate-800 uppercase text-lg tracking-tighter">Mapeo de Datos</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asocia las columnas de tu archivo</p>
             </div>
             <button onClick={() => setImportStatus('IDLE')} className="p-2 bg-slate-100 rounded-full hover:bg-red-50 text-red-400 transition-all"><X size={16} /></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Estructura del Sistema</p>
                {TARGET_FIELDS.map(field => (
                  <div key={field.key} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex justify-between mb-2">
                       <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                       </label>
                    </div>
                    <select 
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      onChange={(e) => setMapping({...mapping, [field.key]: parseInt(e.target.value)})}
                      value={mapping[field.key] ?? ""}
                    >
                      <option value="">-- Ignorar columna --</option>
                      {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                    </select>
                  </div>
                ))}
             </div>
             
             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white overflow-hidden relative">
                <div className="absolute top-4 right-4 opacity-10"><TableIcon size={120} /></div>
                <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-6">Muestra de tus Datos</h4>
                <div className="space-y-3 font-mono text-[10px]">
                   {fileData.slice(0, 4).map((row, i) => (
                     <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/10 truncate whitespace-nowrap">
                        {row.join('  |  ')}
                     </div>
                   ))}
                   <div className="pt-6 border-t border-white/10 text-center">
                      <p className="text-slate-500 italic">Total registros encontrados: <span className="text-white font-black">{fileData.length}</span></p>
                   </div>
                </div>
             </div>
          </div>

          <button 
            onClick={handleCompleteImport}
            className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-900/40 hover:bg-emerald-500 transition-all flex items-center justify-center gap-3"
          >
            <CheckCircle2 size={24} /> Confirmar e Importar Prospectos
          </button>
        </div>
      )}

      {importStatus === 'ERROR' && (
        <div className="py-12 text-center space-y-6">
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <AlertTriangle size={40} />
           </div>
           <div>
              <h4 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Error de Carga</h4>
              <p className="text-slate-500 text-sm italic mt-2">{errorMsg}</p>
           </div>
           <button 
            onClick={() => setImportStatus('IDLE')}
            className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest"
           >
              Intentar de nuevo
           </button>
        </div>
      )}
    </div>
  );
};

export default ProspectImport;
