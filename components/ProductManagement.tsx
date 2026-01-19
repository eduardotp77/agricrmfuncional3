
import React, { useState, useMemo } from 'react';
import { 
  Package, Search, Edit3, ArrowUpRight, Filter, 
  ChevronRight, Save, X, DollarSign, Layers, Tag,
  AlertCircle, History, TrendingUp, RefreshCw, LayoutGrid, List, Info, Sparkles, Plus, Database, Box
} from 'lucide-react';
import { Product, ProductUnit } from '../types';

interface ProductManagementProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
}

const ProductManagement: React.FC<ProductManagementProps> = ({ products, onUpdateProduct, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newProductData, setNewProductData] = useState<Partial<Product>>({
    category: 'GENERAL',
    inventory: 0,
    basePrice: 0,
    reorderPoint: 10,
    unit: 'UND'
  });

  const categories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);

  const filtered = useMemo(() => products.filter(p => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = 
      p.name.toLowerCase().includes(s) || 
      p.code.toLowerCase().includes(s) || 
      p.category.toLowerCase().includes(s) ||
      p.basePrice.toString().includes(s);
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  }), [products, searchTerm, selectedCategory]);

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onUpdateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProductData.code && newProductData.name) {
      onAddProduct(newProductData as Product);
      setIsNewModalOpen(false);
      setNewProductData({ category: 'GENERAL', inventory: 0, basePrice: 0, reorderPoint: 10, unit: 'UND' });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Header Institucional */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Maestro de Productos</h2>
          <p className="text-slate-500 text-sm font-medium italic">Catálogo corporativo con buscador inteligente multivariable.</p>
        </div>
        <div className="flex gap-3">
           <button 
             onClick={() => setIsNewModalOpen(true)}
             className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-900/20 flex items-center gap-2 hover:bg-emerald-700 active-scale transition-all"
           >
              <Plus size={18} /> Nuevo Producto
           </button>
           <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
              <button onClick={() => setViewMode('board')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'board' ? 'bg-[#0056b2] text-white shadow-lg' : 'text-slate-400'}`}><LayoutGrid size={16} /></button>
              <button onClick={() => setViewMode('table')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'table' ? 'bg-[#0056b2] text-white shadow-lg' : 'text-slate-400'}`}><List size={16} /></button>
           </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Escribe código, nombre, categoría o precio para filtrar..."
            className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="w-full md:w-64 px-6 py-4 bg-slate-50 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer border-none"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">Todas las Categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(p => (
            <div key={p.code} className="bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all group overflow-hidden">
               <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-blue-50 text-[#0056b2] rounded-3xl border border-blue-100 group-hover:bg-[#0056b2] group-hover:text-white transition-all">
                     <Package size={24} />
                  </div>
                  <div className="text-right">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{p.category}</p>
                     <span className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-tighter shadow-sm">{p.code}</span>
                  </div>
               </div>
               <h4 className="font-black text-slate-800 uppercase text-sm mb-4 leading-tight min-h-[40px]">{p.name}</h4>
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">P. Base</p>
                     <p className="text-base font-black text-slate-900">${p.basePrice.toLocaleString()}</p>
                  </div>
                  <div className={`p-4 rounded-3xl border ${p.inventory > p.reorderPoint ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                     <p className={`text-[8px] font-black uppercase tracking-widest mb-1 ${p.inventory > p.reorderPoint ? 'text-emerald-500' : 'text-red-500'}`}>Stock</p>
                     <p className={`text-base font-black ${p.inventory > p.reorderPoint ? 'text-emerald-700' : 'text-red-700'}`}>{p.inventory} <span className="text-[10px] opacity-60">{p.unit}</span></p>
                  </div>
               </div>
               <button onClick={() => setEditingProduct(p)} className="w-full py-4 border-2 border-slate-100 text-slate-400 rounded-3xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-[#0056b2] hover:text-white hover:border-[#0056b2] transition-all flex items-center justify-center gap-2">
                 <Edit3 size={16} /> Ajustar Ficha
               </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-900 text-slate-400 font-black uppercase tracking-widest border-b border-slate-800">
                <th className="p-6">Código</th>
                <th className="p-6">Nombre del Producto</th>
                <th className="p-6">Categoría</th>
                <th className="p-6">Precio Base</th>
                <th className="p-6 text-center">Inventario</th>
                <th className="p-6 text-center">UM</th>
                <th className="p-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(p => (
                <tr key={p.code} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-6 font-black text-blue-600">{p.code}</td>
                  <td className="p-6 font-black text-slate-800 uppercase text-xs">{p.name}</td>
                  <td className="p-6 font-bold text-slate-400 uppercase tracking-widest">{p.category}</td>
                  <td className="p-6 font-black text-slate-900 text-sm">${p.basePrice.toLocaleString()}</td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1 rounded-lg font-black ${p.inventory > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {p.inventory}
                    </span>
                  </td>
                  <td className="p-6 text-center text-slate-500 font-bold uppercase">{p.unit}</td>
                  <td className="p-6 text-right">
                     <button onClick={() => setEditingProduct(p)} className="p-3 bg-slate-100 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all"><Edit3 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Nuevo Producto */}
      {isNewModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-8">
                 <div className="flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl">
                       <Box size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Alta de Producto</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Sincronización con Tomapedidos</p>
                    </div>
                 </div>
                 <button onClick={() => setIsNewModalOpen(false)} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddProduct} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Código Único (PLU) *</label>
                       <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black shadow-inner" value={newProductData.code || ''} onChange={e => setNewProductData({...newProductData, code: e.target.value})} placeholder="Ej: AG001" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría Maestro</label>
                       <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold shadow-inner" value={newProductData.category || ''} onChange={e => setNewProductData({...newProductData, category: e.target.value})} placeholder="Ej: LÍQUIDOS" />
                    </div>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Comercial *</label>
                    <input required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black shadow-inner" value={newProductData.name || ''} onChange={e => setNewProductData({...newProductData, name: e.target.value})} placeholder="Ej: AGUA BOT. 300 ML X 24UD" />
                 </div>
                 <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio Base ($)</label>
                       <input type="number" required className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black text-blue-600 shadow-inner" value={newProductData.basePrice} onChange={e => setNewProductData({...newProductData, basePrice: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Unidad Medida</label>
                       {/* Cast string to ProductUnit to fix type mismatch */}
                       <input className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black shadow-inner" value={newProductData.unit} onChange={e => setNewProductData({...newProductData, unit: e.target.value as ProductUnit})} />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Reorden (Min)</label>
                       <input type="number" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black shadow-inner" value={newProductData.reorderPoint} onChange={e => setNewProductData({...newProductData, reorderPoint: parseInt(e.target.value)})} />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#0056b2] text-white rounded-3xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 mt-4 active-scale transition-all">
                    <Save size={18} /> Incorporar al Maestro
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Modal: Editar Producto */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-[3.5rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in duration-300">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Ficha Técnica: {editingProduct.code}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión Central de Inventario</p>
                 </div>
                 <button onClick={() => setEditingProduct(null)} className="p-3 bg-slate-100 rounded-full hover:bg-red-50 text-slate-400 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveProduct} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio Base</label>
                       <input type="number" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black" value={editingProduct.basePrice} onChange={e => setEditingProduct({...editingProduct, basePrice: parseFloat(e.target.value)})} />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Stock Físico</label>
                       <input type="number" className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-black" value={editingProduct.inventory} onChange={e => setEditingProduct({...editingProduct, inventory: parseInt(e.target.value)})} />
                    </div>
                 </div>
                 <button type="submit" className="w-full py-5 bg-[#0056b2] text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl flex items-center justify-center gap-3"><Save size={18} /> Guardar Cambios</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
