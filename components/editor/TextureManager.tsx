import React, { useState, useMemo } from 'react';
import { useEditorStore } from '../../store';
import { ModEntity } from '../../types';
import { v4 as uuidv4 } from 'uuid';
import { Folder, X, ZoomIn, RefreshCw, Box, Upload, Search, FileImage, Trash2, AlertTriangle, Plus, Link as LinkIcon, FolderOpen, CheckCircle2, ImageIcon, FileCog, Type } from 'lucide-react';
import { toast } from 'sonner';

// --- UTILITÁRIOS ---

const formatCategory = (cat: string) => {
    if (!cat) return '';
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
};

/**
 * Calcula o caminho final onde a textura será salva no build.
 * Forçamos o uso de 'any' para garantir que o TS não ignore nossas propriedades customizadas.
 */
const getEffectiveTexturePath = (entity: any) => {
    const name = entity.textureName || entity.internalName;
    if (!name) return 'Textures/...';

    // Se o usuário definiu um caminho customizado no modal
    if (entity.texturePath && typeof entity.texturePath === 'string' && entity.texturePath.trim() !== '') {
        const custom = entity.texturePath.trim().endsWith('/') ? entity.texturePath.trim() : `${entity.texturePath.trim()}/`;
        return `Textures/${custom}${name}.png`;
    }

    // Fallback padrão da LemonEngine se não tiver custom path
    const parts = [
        'Textures',
        formatCategory(entity.type || 'Other'),
        entity.folder?.trim(),
        name
    ].filter(p => p && p.trim() !== '');

    return parts.join('/') + '.png';
};

const checkerboardStyle = {
    backgroundImage: `linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)`,
    backgroundSize: '20px 20px',
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
    opacity: 0.05
};

const PathPreviewBox = ({ path, label }: { path: string | null; label?: string }) => {
    if (!path) return null;
    return (
        <div className="rounded-lg bg-[#007acc]/5 border border-[#007acc]/20 px-3.5 py-3 flex items-start gap-2.5 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4 text-[#007acc] shrink-0 mt-0.5" />
            <div className="min-w-0">
                {label && <p className="text-[10px] font-righteous text-slate-400 uppercase tracking-widest mb-1">{label}</p>}
                <p className="text-[11px] font-mono text-[#007acc] break-all leading-relaxed font-bold">{path}</p>
            </div>
        </div>
    );
};

// --- MODAL DE DETALHES DA TEXTURA ---

const TextureDetailsModal = ({
    texture, entity, onClose, onUpdate, onRemove
}: {
    texture: string,
    entity: ModEntity,
    onClose: () => void,
    onUpdate: (file: File) => void,
    onRemove: () => void
}) => {
    const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
    const [isDeleting, setIsDeleting] = useState(false);
    const sizeKB = Math.round(texture.length * 0.75 / 1024);
    const fullPath = getEffectiveTexturePath(entity);

    return (
        <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-5xl h-[90vh] md:h-[85vh] rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-slate-200 dark:border-[#333] relative" onClick={e => e.stopPropagation()}>
                {isDeleting && (
                    <div className="absolute inset-0 z-50 bg-white/95 dark:bg-[#1e1e1e]/95 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-w-sm w-full text-center space-y-6">
                            <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/20 rounded-xl flex items-center justify-center mx-auto">
                                <AlertTriangle className="w-10 h-10 text-rose-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-righteous text-slate-900 dark:text-white uppercase tracking-wide">Delete Texture?</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    Remove texture from <span className="text-slate-900 dark:text-white font-bold">{entity.internalName}</span>?
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setIsDeleting(false)} className="flex-1 py-3 bg-slate-200 dark:bg-[#333] hover:bg-slate-300 dark:hover:bg-[#444] text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">Cancel</button>
                                <button onClick={onRemove} className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md transition-all active:scale-95">Yes, Delete</button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="h-64 md:h-auto md:flex-1 bg-slate-100 dark:bg-[#0a0a0a] flex items-center justify-center p-8 relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#333]">
                    <div className="absolute inset-0 pointer-events-none" style={checkerboardStyle}></div>
                    <img src={texture} className="max-w-full max-h-full object-contain pixelated drop-shadow-2xl z-10" onLoad={(e) => setImgSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })} alt="Preview" />
                    <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1.5 rounded-md text-xs font-mono backdrop-blur border border-white/10 shadow-lg z-20">
                        {imgSize.w} x {imgSize.h} px
                    </div>
                </div>
                <div className="flex-1 md:p-8 p-6 md:w-96 bg-white dark:bg-[#1e1e1e] flex flex-col overflow-y-auto scrollbar-hide">
                    <div className="flex justify-between items-start mb-6">
                        <div className="min-w-0">
                            <h3 className="text-2xl font-righteous text-slate-900 dark:text-white uppercase tracking-wide truncate">{entity.internalName}</h3>
                            <div className="flex items-center gap-1.5 mt-2 text-slate-500 bg-slate-100 dark:bg-[#252526] px-2.5 py-1.5 rounded-md w-fit max-w-full border border-slate-200 dark:border-[#333]">
                                <Folder className="w-3.5 h-3.5 shrink-0 text-[#007acc]" />
                                <p className="text-[11px] font-mono truncate text-slate-600 dark:text-slate-400">{fullPath}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-4 flex-1">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-[#252526] rounded-lg border border-slate-200 dark:border-[#333]">
                                <p className="text-[10px] font-righteous text-slate-400 uppercase tracking-widest mb-1">File Size</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">~{sizeKB} KB</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-[#252526] rounded-lg border border-slate-200 dark:border-[#333]">
                                <p className="text-[10px] font-righteous text-slate-400 uppercase tracking-widest mb-1">Format</p>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">PNG</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-[#252526] rounded-lg border border-slate-200 dark:border-[#333]">
                            <p className="text-[10px] font-righteous text-slate-400 uppercase tracking-widest mb-2">Linked Asset</p>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-[#007acc] rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm"><FileImage className="w-5 h-5" /></div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold dark:text-white truncate">{entity.displayName}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{formatCategory(entity.type)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-[#333] space-y-3">
                        <label className="flex items-center justify-center gap-3 w-full py-4 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-lg text-xs font-bold uppercase tracking-widest cursor-pointer transition-all active:scale-95 shadow-md">
                            <RefreshCw className="w-4 h-4" /> Replace Sprite
                            <input type="file" accept="image/png" className="hidden" onChange={(e) => e.target.files?.[0] && onUpdate(e.target.files[0])} />
                        </label>
                        <button onClick={() => setIsDeleting(true)} className="flex items-center justify-center gap-3 w-full py-4 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-xs font-bold uppercase tracking-widest transition-all">
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
    const { modalAddTexture, closeAddTextureModal, workspaces, activeWorkspaceId, updateEntity, addEntity } = useEditorStore();
    const workspace = workspaces.find(w => w.id === activeWorkspaceId);

    const [mode, setMode] = useState<'script' | 'custom'>('script');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEntityId, setSelectedEntityId] = useState('');
    const [customPath, setCustomPath] = useState('');   
    const [textureName, setTextureName] = useState(''); 
    const [fileData, setFileData] = useState<string | null>(null);

    const selectedEntity = workspace?.entities.find(e => e.id === selectedEntityId);
    const customPathInvalid = mode === 'custom' && customPath.trim() !== '' && !customPath.trim().endsWith('/');

    const previewPath = useMemo(() => {
        if (mode === 'script' && selectedEntity) return getEffectiveTexturePath(selectedEntity);
        if (mode === 'custom' && textureName.trim() && customPath.trim() && !customPathInvalid) {
            // Forçamos o 'any' para simular a entidade pro preview funcionar sem erro do TS
            return getEffectiveTexturePath({ internalName: textureName, texturePath: customPath } as any);
        }
        return null;
    }, [mode, selectedEntity, customPath, textureName, customPathInvalid]);

    if (!modalAddTexture?.isOpen) return null;

    const entitiesWithoutTexture = (workspace?.entities || [])
        .filter(e => !e.texture && e.type !== 'asset')
        .filter(e => e.internalName.toLowerCase().includes(searchTerm.toLowerCase()));

    const canSave = mode === 'script' 
        ? (!!fileData && !!selectedEntityId)
        : (!!fileData && !!textureName.trim() && !!customPath.trim() && !customPathInvalid);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'image/png') return toast.error("Only PNG files allowed.");
        if (mode === 'custom' && !textureName) setTextureName(file.name.replace(/\.png$/i, ''));
        const reader = new FileReader();
        reader.onloadend = () => setFileData(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!canSave || !activeWorkspaceId) return;

        if (mode === 'script' && selectedEntity) {
            updateEntity(activeWorkspaceId, { ...selectedEntity, texture: fileData! });
            toast.success("Texture linked to script!");
        } else {
            // Mandamos as propriedades soltas garantindo a estrutura correta pro store.ts ler
            addEntity(activeWorkspaceId, {
                id: uuidv4(),
                type: 'asset',
                category: 'Assets',
                internalName: textureName.trim(),
                displayName: textureName.trim(),
                texture: fileData!,
                texturePath: customPath.trim(),
                textureName: textureName.trim(),
                content: '',
            } as any);
            toast.success("Custom asset created!");
        }
        handleClose();
    };

    const handleClose = () => {
        closeAddTextureModal();
        setMode('script');
        setSelectedEntityId('');
        setFileData(null);
        setCustomPath('');
        setTextureName('');
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={handleClose}>
            <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-xl shadow-2xl border border-slate-200 dark:border-[#333] scrollbar-hide flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center px-7 pt-7 pb-5 border-b border-slate-100 dark:border-[#2a2a2a]">
                    <div>
                        <h3 className="text-xl font-righteous text-slate-900 dark:text-white uppercase tracking-wide">Import Sprite</h3>
                        <p className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-widest">Define the asset storage method</p>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded-lg text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="px-7 pt-5">
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-[#252526] rounded-lg border border-slate-200 dark:border-[#2e2e2e]">
                        <button onClick={() => setMode('script')} className={`flex items-center justify-center gap-2 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${mode === 'script' ? 'bg-white dark:bg-[#1e1e1e] text-[#007acc] shadow-sm border border-slate-200 dark:border-[#333]' : 'text-slate-500 hover:text-slate-700'}`}>
                            <FileCog className="w-3.5 h-3.5" /> Script Link
                        </button>
                        <button onClick={() => setMode('custom')} className={`flex items-center justify-center gap-2 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${mode === 'custom' ? 'bg-white dark:bg-[#1e1e1e] text-[#007acc] shadow-sm border border-slate-200 dark:border-[#333]' : 'text-slate-500 hover:text-slate-700'}`}>
                            <LinkIcon className="w-3.5 h-3.5" /> Custom Path
                        </button>
                    </div>
                </div>

                <div className="px-7 py-5 space-y-6 flex-1">
                    <div className="space-y-2">
                        <label className="text-[11px] font-righteous text-slate-400 uppercase flex items-center gap-1.5 tracking-widest">
                            <Upload className="w-3.5 h-3.5 text-[#007acc]" /> Sprite File
                        </label>
                        <label className={`flex flex-col items-center justify-center gap-3 py-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${fileData ? 'border-[#007acc] bg-[#007acc]/5' : 'border-slate-200 dark:border-[#333] hover:bg-slate-50 dark:hover:bg-[#252526]'}`}>
                            {fileData ? <img src={fileData} className="h-20 object-contain pixelated drop-shadow-md" alt="Asset" /> : (
                                <div className="text-center text-slate-400">
                                    <Upload className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                    <span className="text-[10px] font-bold uppercase block">Select PNG</span>
                                </div>
                            )}
                            <input type="file" accept="image/png" className="hidden" onChange={handleFile} />
                        </label>
                    </div>

                    {mode === 'script' ? (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2.5">
                                <label className="text-[11px] font-righteous text-slate-400 uppercase flex items-center gap-1.5 tracking-widest">
                                    <FileImage className="w-3.5 h-3.5 text-[#007acc]" /> Target Script
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" placeholder="Filter scripts..." className="w-full bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-lg pl-10 pr-4 py-2.5 text-xs font-bold dark:text-white outline-none" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                </div>
                                <div className="max-h-32 overflow-y-auto scrollbar-hide border border-slate-200 dark:border-[#333] rounded-lg bg-slate-50 dark:bg-[#252526] p-1">
                                    {entitiesWithoutTexture.map(e => (
                                        <button key={e.id} onClick={() => setSelectedEntityId(e.id)} className={`w-full text-left px-3 py-2 rounded-md text-xs font-bold flex items-center gap-2 mb-0.5 ${selectedEntityId === e.id ? 'bg-[#007acc] text-white' : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-[#333]'}`}>
                                            <FileImage className="w-3.5 h-3.5 opacity-50" /> {e.internalName}.js
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                            <div className="space-y-2">
                                <label className="text-[11px] font-righteous text-slate-400 uppercase flex items-center gap-1.5 tracking-widest">
                                    <FolderOpen className="w-3.5 h-3.5 text-[#007acc]" /> Folder Path
                                </label>
                                <div className="relative flex items-center">
                                    <span className="absolute left-3 text-[11px] font-mono text-slate-400 pointer-events-none">Textures/</span>
                                    <input placeholder="Tests/SubFolder/" className={`w-full bg-slate-50 dark:bg-[#252526] border rounded-lg pl-[76px] pr-4 py-2.5 text-xs font-mono outline-none ${customPathInvalid ? 'border-amber-500 text-amber-500' : 'border-slate-200 dark:border-[#333] text-[#007acc]'}`} value={customPath} onChange={e => setCustomPath(e.target.value)} />
                                </div>
                                {customPathInvalid && <p className="text-[9px] text-amber-500 font-bold ml-1 uppercase">⚠ Path must end with /</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-righteous text-slate-400 uppercase flex items-center gap-1.5 tracking-widest">
                                    <Type className="w-3.5 h-3.5 text-[#007acc]" /> Asset Name
                                </label>
                                <div className="flex items-center">
                                    <input placeholder="my_texture" className="flex-1 bg-slate-50 dark:bg-[#252526] border border-r-0 border-slate-200 dark:border-[#333] rounded-l-lg px-3.5 py-2.5 text-xs font-mono text-[#007acc] outline-none" value={textureName} onChange={e => setTextureName(e.target.value.replace(/\s+/g, '_'))} />
                                    <span className="px-3 py-2.5 bg-slate-100 dark:bg-[#333] border border-slate-200 dark:border-[#444] rounded-r-lg text-[11px] font-mono text-slate-400">.png</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {previewPath && <PathPreviewBox path={previewPath} label="Build destination" />}
                </div>

                <div className="px-7 pb-7">
                    <button onClick={handleSave} disabled={!canSave} className="w-full py-4 bg-[#007acc] hover:bg-[#0062a3] disabled:opacity-30 disabled:grayscale text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg transition-all active:scale-95">
                        {mode === 'script' ? 'Link Sprite to Script' : 'Create Custom Asset'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE PRINCIPAL (TEXTURE MANAGER) ---

const TextureManager: React.FC = () => {
    const { workspaces, activeWorkspaceId, updateEntity, openAddTextureModal } = useEditorStore();
    const workspace = workspaces.find(w => w.id === activeWorkspaceId);
    
    const [selectedTextureEntity, setSelectedTextureEntity] = useState<ModEntity | null>(null);
    const [searchFilter, setSearchFilter] = useState('');

    const textureGroups = useMemo(() => {
        const groups: Record<string, ModEntity[]> = {};
        if (!workspace) return {};

        workspace.entities.forEach(entity => {
            if (!entity.texture) return;
            const fullPath = getEffectiveTexturePath(entity);
            const folderPath = fullPath.substring(0, fullPath.lastIndexOf('/') + 1);
            
            if (searchFilter && !fullPath.toLowerCase().includes(searchFilter.toLowerCase())) return;
            if (!groups[folderPath]) groups[folderPath] = [];
            groups[folderPath].push(entity);
        });
        return groups;
    }, [workspace, searchFilter]);

    if (!workspace) return null;

    const sortedPaths = Object.keys(textureGroups).sort();

    return (
        <div className="h-full bg-slate-50 dark:bg-[#121212] overflow-y-auto scrollbar-hide p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-6 pb-24">
                
                {/* Header do Manager */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1e1e1e] p-6 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm">
                    <div>
                        <h2 className="text-4xl font-pixel text-slate-900 dark:text-white leading-none">
                            Texture<span className="text-[#007acc]">Atlas</span>
                        </h2>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-2">
                            Managing <span className="text-[#007acc]">{workspace.entities.filter(e => e.texture).length}</span> assets
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input placeholder="Search..." className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-[#333] rounded-lg pl-9 pr-4 py-2 text-xs font-bold outline-none focus:border-[#007acc]" value={searchFilter} onChange={e => setSearchFilter(e.target.value)} />
                        </div>
                        <button onClick={openAddTextureModal} className="flex items-center gap-2 px-4 py-2 bg-[#007acc] text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-md hover:bg-[#0062a3] transition-all">
                            <Plus className="w-4 h-4" /> Add Sprite
                        </button>
                    </div>
                </div>

                {/* Listagem por Pastas */}
                <div className="space-y-6">
                    {sortedPaths.length === 0 ? (
                        <div onClick={openAddTextureModal} className="group flex flex-col items-center justify-center py-24 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-xl bg-white dark:bg-[#1e1e1e] cursor-pointer hover:border-[#007acc] dark:hover:border-[#007acc] hover:bg-[#007acc]/5 transition-all">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-[#252526] group-hover:bg-[#007acc]/10 rounded-2xl flex items-center justify-center mb-5 border border-slate-200 dark:border-[#333] group-hover:border-[#007acc]/30 transition-all">
                                <Plus className="w-9 h-9 text-slate-300 dark:text-slate-600 group-hover:text-[#007acc] transition-colors" />
                            </div>
                            <p className="text-sm font-righteous uppercase tracking-widest text-slate-400 group-hover:text-[#007acc] transition-colors">Import your first sprite</p>
                            <p className="text-[11px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest opacity-60">Click to link an asset</p>
                        </div>
                    ) : (
                        sortedPaths.map(path => (
                            <div key={path} className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-xl overflow-hidden shadow-sm">
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333]">
                                    <div className="flex items-center gap-3">
                                        <Folder className="w-4 h-4 text-[#007acc]" />
                                        <h3 className="text-[10px] font-righteous text-slate-500 dark:text-slate-300 uppercase tracking-widest">{path}</h3>
                                    </div>
                                </div>
                                <div className="p-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                    {textureGroups[path].map(entity => (
                                        <div key={entity.id} onClick={() => setSelectedTextureEntity(entity)} className="group cursor-pointer">
                                            <div className="aspect-square bg-slate-50 dark:bg-[#121212] rounded-lg border border-slate-200 dark:border-[#333] p-2 relative flex items-center justify-center overflow-hidden hover:border-[#007acc] transition-all">
                                                <div className="absolute inset-0 opacity-10" style={checkerboardStyle}></div>
                                                <img src={entity.texture} className="max-w-full max-h-full object-contain pixelated relative z-10 group-hover:scale-110 transition-transform" alt="sprite" />
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-500 text-center mt-2 truncate uppercase">{(entity as any).textureName || entity.internalName}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedTextureEntity?.texture && (
                <TextureDetailsModal
                    texture={selectedTextureEntity.texture}
                    entity={selectedTextureEntity}
                    onClose={() => setSelectedTextureEntity(null)}
                    onUpdate={(file) => {
                         const reader = new FileReader();
                         reader.onloadend = () => {
                             updateEntity(activeWorkspaceId!, { ...selectedTextureEntity, texture: reader.result as string });
                             toast.success("Updated!");
                             setSelectedTextureEntity(null);
                         };
                         reader.readAsDataURL(file);
                    }}
                    onRemove={() => {
                        updateEntity(activeWorkspaceId!, { ...selectedTextureEntity, texture: undefined });
                        toast.success("Removed");
                        setSelectedTextureEntity(null);
                    }}
                />
            )}
            
            <AddTextureModal />
        </div>
    );
};

export default TextureManager;