import React, { useState, useMemo } from 'react';
import { useEditorStore } from '../../store';
import { ModEntity } from '../../types';
import { ImageIcon, Folder, X, ZoomIn, RefreshCw, Box, Upload, ChevronDown, Search, FileImage, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

// --- UTILS ---

const formatCategory = (cat: string) => {
    if (!cat) return '';
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
};

const getTexturePath = (category: string, folder: string | undefined | null, name: string) => {
    const parts = [
        'Textures', 
        formatCategory(category), 
        folder?.trim(), 
        name
    ].filter(p => p && p.trim() !== ''); 
    
    return parts.join('/');
};

const checkerboardStyle = {
    backgroundImage: `
        linear-gradient(45deg, #808080 25%, transparent 25%), 
        linear-gradient(-45deg, #808080 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #808080 75%), 
        linear-gradient(-45deg, transparent 75%, #808080 75%)
    `,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    opacity: 0.05
};

// --- MODAL DE DETALHES ---
const TextureDetailsModal = ({ 
    texture, 
    entity, 
    onClose, 
    onUpdate,
    onRemove 
}: { 
    texture: string, 
    entity: ModEntity, 
    onClose: () => void, 
    onUpdate: (file: File) => void,
    onRemove: () => void 
}) => {
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
    const [isDeleting, setIsDeleting] = useState(false); // Estado para o Popup de Confirmação
    const sizeKB = Math.round(texture.length * 0.75 / 1024);
    const fullPath = getTexturePath(entity.category, entity.folder, entity.internalName) + '.png';

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-5xl h-[90vh] md:h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-700 relative" onClick={e => e.stopPropagation()}>
                
                {/* POPUP DE CONFIRMAÇÃO DE DELEÇÃO (Overlay Absoluto) */}
                {isDeleting && (
                    <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-w-sm w-full text-center space-y-6">
                            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-rose-50 dark:ring-rose-900/10">
                                <AlertTriangle className="w-10 h-10 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Delete Texture?</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                    Are you sure you want to remove the texture from <span className="text-slate-900 dark:text-white font-bold">{entity.internalName}</span>?
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setIsDeleting(false)}
                                    className="flex-1 py-3 bg-slate-200 dark:bg-[#333] hover:bg-slate-300 dark:hover:bg-[#444] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={onRemove}
                                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-500/30 transition-all active:scale-95"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Visualizador (Mobile: Altura fixa / Desktop: Flex-1) */}
                <div className="h-64 md:h-auto md:flex-1 bg-slate-100 dark:bg-[#0a0a0a] flex items-center justify-center p-8 relative overflow-hidden group shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#333]">
                    <div className="absolute inset-0 pointer-events-none" style={checkerboardStyle}></div>
                    
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                        <img 
                            src={texture} 
                            className="max-w-full max-h-full object-contain pixelated drop-shadow-2xl" 
                            onLoad={(e) => setImgSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
                        />
                    </div>
                    
                    <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur border border-white/10 shadow-lg">
                        {imgSize.w} x {imgSize.h} px
                    </div>
                </div>

                {/* Info Sidebar (Mobile: Scrollável / Desktop: Largura fixa) */}
                <div className="flex-1 md:flex-none p-6 md:p-8 md:w-96 bg-white dark:bg-[#252526] flex flex-col overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-start mb-6">
                        <div className="min-w-0">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate">{entity.internalName}</h3>
                            <div className="flex items-center gap-1.5 mt-2 text-slate-500 bg-slate-100 dark:bg-[#333] px-2 py-1 rounded-md w-fit max-w-full">
                                <Folder className="w-3 h-3 shrink-0" />
                                <p className="text-[10px] font-mono truncate">{fullPath}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-[#1e1e1e] rounded-xl border border-slate-100 dark:border-[#333]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">File Size</p>
                                <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200">~{sizeKB} KB</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-[#1e1e1e] rounded-xl border border-slate-100 dark:border-[#333]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Format</p>
                                <p className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200">PNG</p>
                            </div>
                        </div>
                        
                        <div className="p-4 bg-slate-50 dark:bg-[#1e1e1e] rounded-xl border border-slate-100 dark:border-[#333]">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Linked Entity</p>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-[#007acc] rounded-lg flex items-center justify-center text-white font-bold text-xs">
                                    {entity.type.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold dark:text-white truncate">{entity.displayName}</p>
                                    <p className="text-[10px] text-slate-500">{formatCategory(entity.type)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-[#333] space-y-3">
                        <label className="flex items-center justify-center gap-3 w-full py-4 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-xl hover:shadow-2xl">
                            <RefreshCw className="w-4 h-4" /> Replace Sprite
                            <input type="file" accept="image/png" className="hidden" onChange={(e) => {
                                if(e.target.files?.[0]) onUpdate(e.target.files[0]);
                            }} />
                        </label>

                        <button 
                            onClick={() => setIsDeleting(true)} // Abre o popup de confirmação
                            className="flex items-center justify-center gap-3 w-full py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/30"
                        >
                            <Trash2 className="w-4 h-4" /> Remove Sprite
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MODAL DE ADICIONAR TEXTURA ---
const AddTextureModal = () => {
    const { modalAddTexture, closeAddTextureModal, workspaces, activeWorkspaceId, updateEntity } = useEditorStore();
    const workspace = workspaces.find(w => w.id === activeWorkspaceId);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [fileData, setFileData] = useState<string | null>(null);

    if (!modalAddTexture.isOpen) return null;

    const entitiesWithoutTexture = (workspace?.entities || [])
        .filter(e => !e.texture)
        .filter(e => {
            const path = getTexturePath(e.category, e.folder, e.internalName);
            return path.toLowerCase().includes(searchTerm.toLowerCase());
        });

    const handleSave = () => {
        if (!selectedEntityId || !fileData) {
            toast.error("Select a path target and upload a file.");
            return;
        }
        const entity = workspace?.entities.find(e => e.id === selectedEntityId);
        if (entity && activeWorkspaceId) {
            updateEntity(activeWorkspaceId, { ...entity, texture: fileData });
            toast.success("Texture added successfully!");
            closeAddTextureModal();
            setSelectedEntityId('');
            setFileData(null);
            setSearchTerm('');
        }
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'image/png') {
                toast.error("Only PNG files are allowed.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setFileData(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={closeAddTextureModal}>
            <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-[#333]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest">Add Texture</h3>
                        <p className="text-xs text-slate-500 mt-1">Assign sprite to existing entity path</p>
                    </div>
                    <button onClick={closeAddTextureModal} className="p-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                            <Folder className="w-3 h-3" /> Target Path (Search)
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="e.g. Items/Swords"
                                className="w-full bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-xl pl-10 pr-4 py-3 text-xs font-bold dark:text-white outline-none focus:border-[#007acc] transition-all"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="max-h-32 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-[#333] rounded-xl bg-slate-50 dark:bg-[#252526] p-1">
                            {entitiesWithoutTexture.length > 0 ? (
                                entitiesWithoutTexture.map(e => (
                                    <button
                                        key={e.id}
                                        onClick={() => setSelectedEntityId(e.id)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 ${selectedEntityId === e.id ? 'bg-[#007acc] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#333]'}`}
                                    >
                                        <FileImage className="w-3 h-3 opacity-70 shrink-0" />
                                        <span className="truncate">{getTexturePath(e.category, e.folder, e.internalName)}</span>
                                    </button>
                                ))
                            ) : (
                                <div className="p-3 text-center text-[10px] text-slate-400 italic">No available entities found for this path.</div>
                            )}
                        </div>
                    </div>

                    <label className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${fileData ? 'border-[#007acc] bg-[#007acc]/5' : 'border-slate-200 dark:border-[#333] hover:bg-slate-50 dark:hover:bg-[#252526]'}`}>
                        {fileData ? (
                            <div className="relative group">
                                <img src={fileData} className="h-32 object-contain pixelated drop-shadow-md" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                    <span className="text-white text-xs font-bold">Change</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-slate-400">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-[#333] rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold uppercase block">Click to Upload PNG</span>
                                <span className="text-[9px] opacity-60">Max 512x512 recommended</span>
                            </div>
                        )}
                        <input type="file" accept="image/png" className="hidden" onChange={handleFile} />
                    </label>

                    <button 
                        onClick={handleSave}
                        disabled={!selectedEntityId || !fileData}
                        className="w-full py-4 bg-[#007acc] hover:bg-[#0062a3] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all active:scale-95"
                    >
                        Save Asset to Path
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- MANAGER PRINCIPAL ---
const TextureManager: React.FC = () => {
  const { workspaces, activeWorkspaceId, updateEntity } = useEditorStore();
  const workspace = workspaces.find(w => w.id === activeWorkspaceId);
  const [selectedTextureEntity, setSelectedTextureEntity] = useState<ModEntity | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const textureGroups = useMemo(() => {
      const groups: Record<string, ModEntity[]> = {};
      if (!workspace) return {};

      workspace.entities.forEach(entity => {
          if (!entity.texture) return;
          
          // Gera path corrigido (ex: Textures/Item/Folder)
          const path = getTexturePath(entity.category, entity.folder, '');
          
          if (searchFilter) {
              const fullSearchPath = getTexturePath(entity.category, entity.folder, entity.internalName);
              if (!fullSearchPath.toLowerCase().includes(searchFilter.toLowerCase())) return;
          }

          if (!groups[path]) groups[path] = [];
          groups[path].push(entity);
      });
      return groups;
  }, [workspace, searchFilter]);

  const handleUpdateTexture = (entity: ModEntity, file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          if (activeWorkspaceId) {
              updateEntity(activeWorkspaceId, { ...entity, texture: reader.result as string });
              toast.success("Texture updated!");
              setSelectedTextureEntity(null);
          }
      };
      reader.readAsDataURL(file);
  };

  const handleRemoveTexture = (entity: ModEntity) => {
      if (activeWorkspaceId) {
          updateEntity(activeWorkspaceId, { ...entity, texture: undefined });
          toast.success("Texture removed");
          setSelectedTextureEntity(null);
      }
  };

  if (!workspace) return null;

  const sortedPaths = Object.keys(textureGroups).sort();
  const totalTextures = workspace.entities.filter(e => e.texture).length;

  return (
    <div className="h-full bg-slate-50 dark:bg-[#121212] overflow-y-auto custom-scrollbar p-4 md:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-8 pb-24">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                        <ImageIcon className="w-8 h-8 text-[#007acc]" />
                        Texture Atlas
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                        Managing <span className="text-[#007acc]">{totalTextures}</span> sprites
                    </p>
                </div>
                
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Filter textures by path or name..."
                        className="w-full bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-xl pl-11 pr-4 py-3 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-[#007acc] shadow-sm transition-all"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                {sortedPaths.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-3xl">
                        <Box className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400">No textures found</p>
                    </div>
                ) : (
                    sortedPaths.map(path => (
                        <details key={path} open className="group bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                            <summary className="flex items-center justify-between p-4 cursor-pointer select-none bg-slate-50 dark:bg-[#252526] hover:bg-slate-100 dark:hover:bg-[#2d2d2d] transition-colors list-none">
                                <div className="flex items-center gap-3">
                                    <span className="p-2 bg-slate-200 dark:bg-[#333] rounded-lg text-slate-500"><Folder className="w-4 h-4" /></span>
                                    <h3 className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">{path}</h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold bg-[#007acc]/10 text-[#007acc] px-2 py-1 rounded-md">
                                        {textureGroups[path].length} items
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                                </div>
                            </summary>
                            
                            <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {textureGroups[path].map(entity => (
                                    <div 
                                        key={entity.id} 
                                        onClick={() => setSelectedTextureEntity(entity)}
                                        className="group/card flex flex-col bg-slate-50 dark:bg-[#121212] rounded-xl border border-slate-200 dark:border-[#333] overflow-hidden hover:border-[#007acc] dark:hover:border-[#007acc] hover:shadow-lg transition-all cursor-pointer relative"
                                    >
                                        <div className="aspect-square relative flex items-center justify-center p-4">
                                            <div className="absolute inset-0 pointer-events-none opacity-20" style={checkerboardStyle}></div>
                                            
                                            <img 
                                                src={entity.texture} 
                                                className="max-w-full max-h-full object-contain pixelated drop-shadow-md group-hover/card:scale-110 transition-transform duration-300 relative z-10" 
                                            />
                                            
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-[1px]">
                                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
                                                    <ZoomIn className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="p-3 border-t border-slate-200 dark:border-[#333] bg-white dark:bg-[#252526] z-30">
                                            <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate text-center" title={entity.internalName}>
                                                {entity.internalName}
                                            </p>
                                            <p className="text-[9px] text-slate-400 text-center font-mono mt-0.5">.png</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </details>
                    ))
                )}
            </div>
        </div>

        {selectedTextureEntity && selectedTextureEntity.texture && (
            <TextureDetailsModal 
                texture={selectedTextureEntity.texture} 
                entity={selectedTextureEntity}
                onClose={() => setSelectedTextureEntity(null)}
                onUpdate={(file) => handleUpdateTexture(selectedTextureEntity, file)}
                onRemove={() => handleRemoveTexture(selectedTextureEntity)}
            />
        )}

        <AddTextureModal />
    </div>
  );
};

export default TextureManager;