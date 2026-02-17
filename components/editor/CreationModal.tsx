import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store';
import { TEMPLATES_BY_CATEGORY, CATEGORIES_CONFIG } from '../../constants';
import { EntityType } from '../../types';
import { X, ChevronRight, Wand2, Upload, LayoutGrid, ChevronDown, ChevronLeft, Eye, FileCode, Copy, Check, FilePlus, Zap } from 'lucide-react';
import { toast } from 'sonner';

// --- CodeMirror Imports ---
import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import { syntaxHighlighting } from "@codemirror/language";

// --- Sub-Componente para Exibição de Código ---
const CodePreview = ({ code }: { code: string }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const viewRef = useRef<EditorView | null>(null);

    useEffect(() => {
        if (!editorRef.current) return;

        const state = EditorState.create({
            doc: code,
            extensions: [
                lineNumbers(),
                javascript(),
                syntaxHighlighting(oneDarkHighlightStyle),
                EditorView.editable.of(false),
                EditorView.lineWrapping,
                EditorView.theme({
                    "&": { height: "100%", backgroundColor: "transparent" },
                    ".cm-gutters": { backgroundColor: "transparent", border: "none", color: "#666" },
                    ".cm-scroller": { fontFamily: "'Fira Code', monospace", fontSize: "11px" },
                    
                    // --- SCROLLBAR CUSTOMIZADA (CSS INJETADO NO CODEMIRROR) ---
                    ".cm-scroller::-webkit-scrollbar": {
                        width: "12px",
                        height: "12px"
                    },
                    ".cm-scroller::-webkit-scrollbar-track": {
                        backgroundColor: "transparent"
                    },
                    ".cm-scroller::-webkit-scrollbar-thumb": {
                        backgroundColor: "#333", // Cor do thumb (Dark Gray)
                        borderRadius: "6px",
                        border: "3px solid transparent", // Cria o efeito de espaçamento (padding)
                        backgroundClip: "content-box"
                    },
                    ".cm-scroller::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#555" // Hover state
                    },
                    ".cm-scroller::-webkit-scrollbar-corner": {
                        backgroundColor: "transparent"
                    }
                })
            ]
        });

        const view = new EditorView({ state, parent: editorRef.current });
        viewRef.current = view;
        return () => view.destroy();
    }, []);

    useEffect(() => {
        if (viewRef.current && code !== viewRef.current.state.doc.toString()) {
            viewRef.current.dispatch({
                changes: { from: 0, to: viewRef.current.state.doc.length, insert: code }
            });
        }
    }, [code]);

    return <div ref={editorRef} className="h-full w-full" />;
};

const QuickCreationForm = ({ category, folder }: { category: EntityType, folder: string }) => {
    const { addEntity, activeWorkspaceId, closeCreationModal, expandToPath } = useEditorStore();
    const [internalName, setInternalName] = useState('');

    const handleQuickCreate = () => {
        if (!internalName.trim()) { toast.error("Filename is required"); return; }
        if (!activeWorkspaceId) return;

        const code = `export class ${internalName} {\n    constructor() {\n        \n    }\n}`;

        addEntity(activeWorkspaceId, {
            type: category,
            category: category,
            internalName,
            folder,
            template: 'Quick Blank',
            code 
        });
        
        expandToPath(category, folder);

        toast.success(`File ${internalName}.js created!`);
        closeCreationModal();
    };

    return (
        <div className="max-w-md mx-auto w-full p-8 flex flex-col justify-center h-full animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <Zap className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Quick Create</h2>
                <p className="text-xs text-slate-500 mt-2">Create a <strong>Clean Class</strong> without framework inheritance.</p>
            </div>

            <div className="space-y-4">
                <div className="relative group">
                    <input 
                        autoFocus
                        value={internalName}
                        onChange={e => setInternalName(e.target.value.replace(/\s+/g, ''))}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickCreate()}
                        placeholder="Filename"
                        className="w-full bg-white dark:bg-[#252526] border-2 border-slate-200 dark:border-[#333] rounded-xl px-5 py-4 font-bold text-lg text-slate-900 dark:text-white focus:border-emerald-500 outline-none shadow-sm transition-all text-center"
                    />
                    <div className="absolute right-4 top-5 text-xs font-mono text-slate-400">.js</div>
                </div>

                <button 
                    onClick={handleQuickCreate}
                    disabled={!internalName}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-sm uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    <FilePlus className="w-4 h-4" />
                    Create Empty File
                </button>
            </div>
        </div>
    );
};

// --- Formulário Padrão com Preview ---
const CreationForm = ({ templateId, category, folder }: { templateId: string, category: EntityType, folder: string }) => {
    const { addEntity, activeWorkspaceId, closeCreationModal, expandToPath } = useEditorStore();
    const [internalName, setInternalName] = useState('');
    const [textureData, setTextureData] = useState<string | null>(null);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [copied, setCopied] = useState(false);

    const templateData = TEMPLATES_BY_CATEGORY[category]?.find(t => t.id === templateId);
    const generatedCode = templateData 
        ? templateData.getCode(internalName || `My${templateData.label.split(' ')[0].replace(/[^a-zA-Z]/g, '')}`) 
        : '';

    const handleCreate = () => {
        if (!internalName.trim()) { toast.error("Name is required"); return; }
        if (!activeWorkspaceId || !templateData) return;

        addEntity(activeWorkspaceId, {
            type: category,
            category: category,
            internalName,
            folder,
            template: templateId,
            texture: textureData || undefined,
            code: generatedCode
        });

        expandToPath(category, folder);

        toast.success(`Created ${internalName}`);
        closeCreationModal();
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setTextureData(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCopyCode = () => {
        navigator.clipboard.writeText(generatedCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success("Code copied");
    };

    if (!templateData) return null;

    return (
        <>
            <div className="max-w-6xl mx-auto w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 flex flex-col lg:flex-row gap-8 h-full">
                <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    <div className="mb-6 flex items-center gap-4 border-b border-slate-200 dark:border-[#333] pb-6 shrink-0">
                        <div className="p-3 bg-slate-100 dark:bg-[#252526] rounded-xl text-slate-500 dark:text-slate-400">
                            {templateData.icon}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{templateData.label}</h2>
                            <p className="text-xs text-slate-500 font-medium">{templateData.description}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Class Name (ID)</label>
                            <div className="relative group">
                                <input 
                                    autoFocus
                                    value={internalName}
                                    onChange={e => setInternalName(e.target.value.replace(/\s+/g, ''))}
                                    placeholder={`My${templateData.label.split(' ')[0].replace(/[^a-zA-Z]/g, '')}`}
                                    className="w-full bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-xl px-5 py-4 font-bold text-lg text-slate-900 dark:text-white focus:border-[#007acc] outline-none shadow-sm transition-all group-hover:shadow-md"
                                />
                                <div className="absolute right-4 top-5 text-xs font-mono text-slate-400">.js</div>
                            </div>
                        </div>

                        {templateData.requiresTexture && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Texture Asset</label>
                                <label className="flex items-center gap-5 p-4 border border-dashed border-slate-300 dark:border-[#444] rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-[#2a2d2e] hover:border-[#007acc] transition-all group bg-white dark:bg-[#252526]">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-[#333] rounded-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-[#444] group-hover:border-[#007acc]">
                                        {textureData ? <img src={textureData} className="w-full h-full object-contain pixelated" /> : <Upload className="w-6 h-6 text-slate-300 group-hover:text-[#007acc]" />}
                                    </div>
                                    <div className="flex-1">
                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 block group-hover:text-[#007acc]">{textureData ? 'Change Texture' : 'Upload PNG'}</span>
                                        <span className="text-[10px] text-slate-400">Max 32x32 recommended</span>
                                    </div>
                                    <input type="file" accept="image/png" className="hidden" onChange={handleUpload} />
                                </label>
                            </div>
                        )}

                        <div className="flex gap-3 mt-4">
                            <button 
                                onClick={() => setShowMobilePreview(true)}
                                className="lg:hidden flex-1 py-4 bg-slate-100 dark:bg-[#252526] text-slate-600 dark:text-slate-300 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                            >
                                <Eye className="w-4 h-4" /> Preview Code
                            </button>

                            <button 
                                onClick={handleCreate}
                                disabled={!internalName}
                                className="flex-[2] py-4 bg-[#007acc] hover:bg-[#0062a3] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                            >
                                <Wand2 className="w-4 h-4" />
                                Generate Script
                            </button>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex flex-1 flex-col bg-[#1e1e1e] rounded-xl border border-[#333] overflow-hidden shadow-inner h-[500px] shrink-0">
                    <div className="px-4 py-3 bg-[#252526] border-b border-[#333] flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400">
                            <FileCode className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Live Code Preview</span>
                        </div>
                        <button onClick={handleCopyCode} className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase flex items-center gap-1">
                            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />} 
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                    <div className="flex-1 overflow-hidden relative">
                        <CodePreview code={generatedCode} />
                    </div>
                </div>
            </div>

            {showMobilePreview && (
                <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
                    <div className="bg-[#1e1e1e] w-full h-[80vh] rounded-2xl border border-[#333] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-[#333] flex items-center justify-between bg-[#252526]">
                            <div className="flex items-center gap-2">
                                <FileCode className="w-4 h-4 text-[#007acc]" />
                                <span className="text-xs font-black text-white uppercase tracking-widest">Generated Preview</span>
                            </div>
                            <button onClick={() => setShowMobilePreview(false)} className="p-2 bg-[#333] rounded-full text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            <CodePreview code={generatedCode} />
                        </div>
                        <div className="p-4 border-t border-[#333] bg-[#252526]">
                            <button 
                                onClick={() => setShowMobilePreview(false)}
                                className="w-full py-3 bg-[#007acc] text-white rounded-lg font-bold text-xs uppercase"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// --- Componente Principal ---
const CreationModal: React.FC = () => {
    const { creationModal, closeCreationModal, resetCreationState } = useEditorStore();
    const [mobileView, setMobileView] = useState<'list' | 'form'>('list');
    const [isQuickMode, setIsQuickMode] = useState(false);

    useEffect(() => {
        if (creationModal?.isOpen === false) {
            setMobileView('list');
            setIsQuickMode(false);
        }
    }, [creationModal?.isOpen]);

    const handleReset = () => {
        resetCreationState();
        closeCreationModal();
        setMobileView('list');
        setIsQuickMode(false);
    }

    const handleSelectTemplate = (catId: EntityType, tempId: string) => {
        setIsQuickMode(false);
        useEditorStore.setState(state => ({
            creationModal: { ...state.creationModal, activeCategory: catId, selectedTemplateId: tempId }
        }));
        setMobileView('form');
    };

    const handleActivateQuickMode = () => {
        setIsQuickMode(true);
        setMobileView('form');
        useEditorStore.setState(state => ({
            creationModal: { ...state.creationModal, selectedTemplateId: null }
        }));
    }

    const activeCategory = creationModal?.activeCategory || EntityType.ITEM;
    const selectedTemplateId = creationModal?.selectedTemplateId;

    if (!creationModal?.isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-0 md:p-8 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1e1e1e] w-full h-full md:rounded-2xl md:h-[90vh] md:max-w-7xl shadow-2xl flex overflow-hidden border border-slate-200 dark:border-[#333]">
                
                {/* SIDEBAR */}
                <div className={`
                    w-full md:w-72 bg-slate-50 dark:bg-[#252526] border-r border-slate-200 dark:border-[#333] flex-col
                    ${mobileView === 'form' ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="p-5 border-b border-slate-200 dark:border-[#333] flex justify-between items-center shrink-0">
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-700 dark:text-white">New File</h2>
                            <p className="text-[10px] text-slate-400">Target: /{creationModal.targetFolder || 'Root'}</p>
                        </div>
                        <button onClick={handleReset} className="md:hidden p-2 bg-slate-200 dark:bg-[#333] rounded-full"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                        {/* BOTÃO MÁGICO DE CRIAÇÃO RÁPIDA */}
                        <button 
                            onClick={handleActivateQuickMode}
                            className={`w-full flex items-center gap-3 px-4 py-3 mb-4 rounded-xl transition-all text-left border ${isQuickMode ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'bg-white dark:bg-[#2d2d2d] border-slate-200 dark:border-[#333] text-slate-600 dark:text-slate-300 hover:border-emerald-500/50 hover:text-emerald-500'}`}
                        >
                            <div className={`p-1.5 rounded-lg ${isQuickMode ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-[#333]'}`}>
                                <Zap className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <span className="text-xs font-black uppercase tracking-tight block">Empty File</span>
                                <span className="text-[9px] opacity-70 font-medium">Quick create (No template)</span>
                            </div>
                            {isQuickMode && <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        <div className="h-px bg-slate-200 dark:bg-[#333] my-2" />

                        {CATEGORIES_CONFIG.map(cat => {
                            const isCatActive = activeCategory === cat.id && !isQuickMode;
                            const catTemplates = TEMPLATES_BY_CATEGORY[cat.id] || [];
                            
                            return (
                                <div key={cat.id} className="rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => {
                                            setIsQuickMode(false);
                                            useEditorStore.setState(state => ({ creationModal: { ...state.creationModal, activeCategory: cat.id } }));
                                        }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all text-left ${isCatActive ? 'bg-white dark:bg-[#333] text-[#007acc] shadow-sm font-bold' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-[#2d2d2d]'}`}
                                    >
                                        {cat.icon}
                                        <span className="text-[11px] uppercase tracking-tight flex-1">{cat.label}</span>
                                        {isCatActive ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                                    </button>

                                    {isCatActive && (
                                        <div className="bg-slate-100 dark:bg-[#202021] border-l-2 border-[#007acc] ml-4 my-1 pl-1 space-y-0.5 animate-in slide-in-from-left-1">
                                            {catTemplates.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleSelectTemplate(cat.id, t.id)}
                                                    className={`w-full text-left px-4 py-2 text-[11px] transition-colors rounded-r-md ${selectedTemplateId === t.id ? 'bg-[#007acc] text-white font-bold' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                                                >
                                                    {t.label}
                                                </button>
                                            ))}
                                            {catTemplates.length === 0 && <div className="px-4 py-2 text-[10px] text-slate-400 italic">No templates</div>}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* MAIN */}
                <div className={`
                    flex-1 bg-white dark:bg-[#1e1e1e] flex-col relative
                    ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="h-16 border-b border-slate-100 dark:border-[#333] flex items-center justify-between px-6 shrink-0 bg-white dark:bg-[#1e1e1e]">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setMobileView('list')} className="md:hidden p-2 bg-slate-100 dark:bg-[#333] rounded-full">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 hidden md:block">
                                {isQuickMode ? 'Quick Creation Mode' : 'Configuration & Preview'}
                            </span>
                        </div>
                        <button onClick={handleReset} className="hidden md:flex p-2 hover:bg-slate-100 dark:hover:bg-[#333] rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-hidden flex items-center justify-center bg-slate-50/30 dark:bg-[#151515]">
                        {isQuickMode ? (
                            <QuickCreationForm category={activeCategory} folder={creationModal.targetFolder} />
                        ) : selectedTemplateId ? (
                            <CreationForm templateId={selectedTemplateId} category={activeCategory} folder={creationModal.targetFolder} />
                        ) : (
                            <div className="text-center p-10 opacity-40 select-none">
                                <LayoutGrid className="w-20 h-20 mx-auto mb-6 text-slate-300 dark:text-slate-600" />
                                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Select a Template</h3>
                                <p className="text-[10px] text-slate-400 mt-2">Choose a category or use "Empty File" for a blank script.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreationModal;