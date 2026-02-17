import React, { useState, useRef } from 'react';
import { useEditorStore } from '../../store';
import { Plus, Search, Box, Settings, Image as ImageIcon, X as CloseIcon, AlertTriangle, FileUp, Loader2, Zap, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Author } from '../../types';
import { importModFromZip } from '../../services/importService';

const Dashboard: React.FC = () => {
  const { workspaces, addWorkspace, importWorkspace, deleteWorkspace, setActiveWorkspace, setGlobalSettingsOpen } = useEditorStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [search, setSearch] = useState('');
  
  const modIconRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string }>({ isOpen: false, id: null, name: '' });
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const [newMod, setNewMod] = useState({
    name: '',
    icon: undefined as string | undefined,
    internalId: '',
    description: '',
    authors: [{ name: '', file: '0.jpg', avatar: undefined, icon_height: 70, color: '#f7ff00', link: '' }] as Author[]
  });

  const updateAuthorName = (index: number, name: string) => {
    const nextAuthors = [...newMod.authors];
    nextAuthors[index].name = name;
    setNewMod(prev => ({ ...prev, authors: nextAuthors }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleImportMod = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setIsImporting(true);
    setImportStatus('Processing ZIP structure...');

    try {
        const newWorkspace = await importModFromZip(file);
        importWorkspace(newWorkspace);
        toast.success(`Mod "${newWorkspace.name}" imported successfully!`);
        setIsModalOpen(false);
    } catch (error: any) {
        console.error(error);
        toast.error(`Import failed: ${error.message}`);
    } finally {
        setIsImporting(false);
    }
  };

  const handleCreate = () => {
    if (!newMod.name || newMod.authors.some(a => !a.name)) {
      toast.error('Mod name and all authors are required.');
      return;
    }
    
    addWorkspace({
        name: newMod.name,
        icon: newMod.icon,
        authors: newMod.authors,
        internalId: newMod.internalId,
        description: newMod.description
    });
    
    setIsModalOpen(false);
    toast.success(`Mod "${newMod.name}" initialized successfully!`);
  };

  const openDeleteModal = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); 
    setDeleteModal({ isOpen: true, id, name });
    setDeleteConfirmationText('');
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmationText !== 'Confirm' || !deleteModal.id) return;
    deleteWorkspace(deleteModal.id);
    toast.success('Project deleted permanently.');
    setDeleteModal({ isOpen: false, id: null, name: '' });
  };

  const filtered = workspaces.filter(ws => 
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto bg-slate-50 dark:bg-[#1e1e1e] transition-colors duration-300 custom-scrollbar relative">
      
      {isImporting && (
          <div className="fixed inset-0 z-[100] bg-white/80 dark:bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
              <Loader2 className="w-12 h-12 text-[#007acc] animate-spin mb-4" />
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-widest">{importStatus}</h3>
              <p className="text-xs text-slate-500 mt-2 font-mono">LemonEngine is working...</p>
          </div>
      )}

      <div className="max-w-7xl mx-auto w-full">
        {/* HEADER BRANDING */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 mb-12 animate-in fade-in slide-in-from-top duration-500 pt-4">
          <div className="flex items-center gap-5">
            {/* LOGO CONTAINER - Mantendo estilo clean */}
            <div className="w-14 h-14 rounded-2xl shadow-xl shadow-blue-500/20 flex items-center justify-center shrink-0 border-2 border-white dark:border-[#333]">
               <img 
                 src="/assets/logo.png" 
                 alt="Logo" 
                 className="w-full h-full rounded-xl object-contain drop-shadow-sm" 
                 onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
               />
               <Zap className="w-8 h-8 text-white hidden" />
            </div>
            <div>
              <h1 className="text-3xl font-righteous text-slate-900 dark:text-white tracking-tighter leading-none uppercase">
                Lemon<span className="text-[#007acc]">Engine</span>
              </h1>
              <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1 ml-0.5">Build TL Pro mods</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#007acc] transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-[#007acc] text-slate-900 dark:text-white w-full md:w-72 transition-all shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setGlobalSettingsOpen(true)}
              className="p-3 bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-xl text-slate-500 hover:text-[#007acc] dark:hover:text-[#007acc] transition-all shadow-sm hover:shadow-md"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HERO ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group relative overflow-hidden bg-white dark:bg-[#252526] hover:border-[#007acc] dark:hover:border-[#007acc] text-left p-8 rounded-3xl border-2 border-slate-200 dark:border-[#333] transition-all shadow-sm hover:shadow-xl"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <Plus className="w-32 h-32 -mr-10 -mt-10" />
            </div>
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-2">
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">New Project</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Start from scratch</p>
                </div>
                <div className="w-12 h-12 bg-[#007acc] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6" />
                </div>
            </div>
          </button>

          <button 
            onClick={() => importInputRef.current?.click()}
            className="group relative overflow-hidden bg-white dark:bg-[#252526] hover:border-emerald-500 dark:hover:border-emerald-500 text-left p-8 rounded-3xl border-2 border-slate-200 dark:border-[#333] transition-all shadow-sm hover:shadow-xl"
          >
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileUp className="w-32 h-32 -mr-10 -mt-10" />
            </div>
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-2">
                    <h3 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tight">Import Mod</h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">.zip or .tlmod archive</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                    <FileUp className="w-6 h-6" />
                </div>
            </div>
            <input 
                ref={importInputRef}
                type="file" 
                accept=".zip,.tlmod" 
                className="hidden" 
                onChange={handleImportMod}
            />
          </button>
        </div>

        {/* PROJECTS GRID */}
        <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 ml-1">Recent Projects</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24">
          {filtered.map(ws => (
            <div key={ws.id} className="bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-3xl overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative flex flex-col">
              
              <div className="h-40 bg-slate-100 dark:bg-[#202020] relative flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-[#333]">
                 {/* Pattern Background */}
                 <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#999 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                 
                 {ws.icon ? (
                   <img src={ws.icon} alt={ws.name} className="w-24 h-24 object-cover rounded-2xl shadow-lg transform group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <Box className="w-16 h-16 text-slate-300 dark:text-[#333]" />
                 )}
                 
                 <div className="absolute top-4 right-4 bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider">
                   v{ws.version}.0
                 </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-black text-xl text-slate-900 dark:text-white truncate mb-1 uppercase tracking-tight">{ws.name}</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-6">Internal: {ws.internalId}</p>
                
                <div className="mt-auto flex gap-3">
                    <button 
                      onClick={() => setActiveWorkspace(ws.id)}
                      className="flex-1 bg-slate-900 dark:bg-[#007acc] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                    >
                      Open Studio
                    </button>
                    <button 
                        onClick={(e) => openDeleteModal(e, ws.id, ws.name)}
                        className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
              </div>
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 dark:border-[#333] rounded-3xl">
               <Box className="w-12 h-12 text-slate-300 mx-auto mb-4 opacity-30" />
               <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No projects found</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-3xl w-full max-w-xl max-h-[90dvh] overflow-y-auto shadow-2xl transition-colors custom-scrollbar">
            <div className="p-8 border-b border-slate-200 dark:border-[#333] flex justify-between items-center bg-slate-50 dark:bg-[#1e1e1e] sticky top-0 z-10">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Initialize Project</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-white dark:bg-[#252526] rounded-full border border-slate-200 dark:border-[#333] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><CloseIcon className="w-5 h-5" /></button>
            </div>
            
            <div className="p-8 space-y-8 bg-white dark:bg-[#1e1e1e]">
              <div className="flex flex-col sm:flex-row gap-8">
                <div className="space-y-3 shrink-0">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 block">Icon</label>
                  <div 
                    onClick={() => modIconRef.current?.click()}
                    className="w-32 h-32 bg-slate-50 dark:bg-[#252526] border-2 border-dashed border-slate-200 dark:border-[#333] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#007acc] dark:hover:border-[#007acc] transition-all overflow-hidden group"
                  >
                    {newMod.icon ? (
                      <img src={newMod.icon} alt="Mod Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-slate-300 dark:text-[#444] mx-auto mb-2 group-hover:text-[#007acc] transition-colors" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Upload</span>
                      </div>
                    )}
                    <input ref={modIconRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, (base64) => setNewMod({ ...newMod, icon: base64 }))} />
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mod Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Super Sword Mod"
                      className="w-full bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-xl p-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#007acc] transition-all text-base"
                      value={newMod.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const internal = name.replace(/\s+/g, '');
                        setNewMod({ ...newMod, name, internalId: internal });
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Author</label>
                      <input 
                          type="text" 
                          placeholder="Your Name"
                          className="w-full bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-xl p-4 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#007acc] transition-all text-base"
                          value={newMod.authors[0].name}
                          onChange={(e) => updateAuthorName(0, e.target.value)}
                      />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 dark:bg-[#252526] border-t border-slate-200 dark:border-[#333]">
              <button 
                onClick={handleCreate} 
                className="w-full py-4 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-xl font-black text-xs uppercase tracking-[0.15em] transition-all shadow-xl shadow-blue-500/20 transform active:scale-[0.98]"
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#252526] border border-rose-200 dark:border-rose-900/30 rounded-3xl w-full max-w-md shadow-2xl p-8 space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/10 rounded-full flex items-center justify-center mb-2">
                <AlertTriangle className="w-10 h-10 text-rose-500" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Delete Project?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Permanently delete <strong className="text-slate-900 dark:text-white">{deleteModal.name}</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <input 
                  type="text" 
                  placeholder='Type "Confirm"'
                  className="w-full bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-xl p-4 text-center font-bold text-slate-900 dark:text-white focus:border-rose-500 focus:outline-none transition-all uppercase"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  autoFocus
                />
              
              <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                  className="flex-1 py-4 bg-slate-100 dark:bg-[#333] hover:bg-slate-200 dark:hover:bg-[#444] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  disabled={deleteConfirmationText !== 'Confirm'}
                  className={`flex-1 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg text-white
                    ${deleteConfirmationText === 'Confirm' 
                      ? 'bg-rose-500 hover:bg-rose-600 transform active:scale-95' 
                      : 'bg-slate-300 dark:bg-[#444] cursor-not-allowed opacity-50'}`}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;