import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useEditorStore } from '../../store';
import { 
    Globe, Plus, Trash2, Upload, ChevronLeft, Search, FileJson, Languages, 
    AlertCircle, Braces, X
} from 'lucide-react';
import { toast } from 'sonner';

// ==================== CONSTANTES E UTILITÁRIOS ====================

const SUPPORTED_LANGUAGES = [
    { id: 'de-DE', display: 'Deutsch (de-DE)' },
    { id: 'en-US', display: 'English (en-US)' },
    { id: 'es-ES', display: 'Español (es-ES)' },
    { id: 'fr-FR', display: 'Français (fr-FR)' },
    { id: 'it-IT', display: 'Italiano (it-IT)' },
    { id: 'pl-PL', display: 'Polski (pl-PL)' },
    { id: 'pt-BR', display: 'Português (pt-BR)' },
    { id: 'ru-RU', display: 'Русский (ru-RU)' },
    { id: 'zh-Hans', display: '简体中文 (zh-Hans)' }
];

const STANDARD_CATEGORIES = ['ItemName', 'ItemTooltip', 'ProjectileName', 'BuffName', 'BuffDescription', 'NPCName', 'NPCChat', 'TownNPCMood', 'Bestiary', 'CustomText', 'ArmorSetBonus'];

const flattenObject = (ob: any): Record<string, string> => {
    let toReturn: any = {};
    for (let i in ob) {
        if (!ob.hasOwnProperty(i)) continue;
        if ((typeof ob[i]) === 'object' && ob[i] !== null && !Array.isArray(ob[i])) {
            let flatObject = flattenObject(ob[i]);
            for (let x in flatObject) {
                if (!flatObject.hasOwnProperty(x)) continue;
                toReturn[i + '.' + x] = flatObject[x];
            }
        } else {
            toReturn[i] = String(ob[i]);
        }
    }
    return toReturn;
};

// ==================== HOOK PERSONALIZADO PARA DETECTAR MOBILE ====================

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
};

// ==================== COMPONENTE DE LINHA DE TRADUÇÃO (inalterado) ====================

interface TranslationRowProps {
    locKey: string;
    locValue: string;
    onUpdateKey: (oldKey: string, newKey: string, value: string) => void;
    onUpdateValue: (key: string, newValue: string) => void;
    onDelete: (key: string) => void;
    isNewlyCreated: boolean;
}

const TranslationRow: React.FC<TranslationRowProps> = React.memo(({ locKey, locValue, onUpdateKey, onUpdateValue, onDelete, isNewlyCreated }) => {
    const [localKey, setLocalKey] = useState(locKey);

    useEffect(() => {
        setLocalKey(locKey);
    }, [locKey]);

    useEffect(() => {
        if (isNewlyCreated) {
            const el = document.getElementById(`key-${locKey}`);
            if (el) {
                el.focus();
                (el as HTMLInputElement).select();
            }
        }
    }, [isNewlyCreated, locKey]);

    const commitKeyUpdate = () => {
        const finalKey = localKey.trim();
        if (finalKey && finalKey !== locKey) {
            onUpdateKey(locKey, finalKey, locValue);
        } else {
            setLocalKey(locKey);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            commitKeyUpdate();
            const targetKey = localKey.trim() || locKey;
            setTimeout(() => {
                document.getElementById(`val-${targetKey}`)?.focus();
            }, 50);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-lg p-2 shadow-sm focus-within:border-[#007acc] transition-colors">
            <div className="w-full sm:w-1/3 shrink-0">
                <input
                    id={`key-${locKey}`}
                    type="text"
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    onBlur={commitKeyUpdate}
                    onKeyDown={handleKeyDown}
                    placeholder="KeyName"
                    className="w-full bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#444] rounded-md px-3 py-2 text-xs font-mono text-[#007acc] outline-none focus:bg-white dark:focus:bg-[#121212] focus:border-[#007acc] transition-all"
                />
            </div>
            <div className="hidden sm:block text-slate-300 dark:text-[#444] font-black">:</div>
            <div className="flex-1 flex items-center gap-2 w-full">
                <input
                    id={`val-${locKey}`}
                    type="text"
                    value={locValue}
                    onChange={(e) => onUpdateValue(locKey, e.target.value)}
                    placeholder="Translation text..."
                    className="flex-1 bg-transparent border border-transparent rounded-md px-2 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:bg-slate-50 dark:focus:bg-[#252526] transition-all"
                />
                <button onClick={() => onDelete(locKey)} className="p-2 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 rounded-md transition-colors shrink-0" title="Delete Key">
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});

// ==================== NOVOS COMPONENTES PARA MOBILE ====================

interface MobileCategoryBarProps {
    categories: string[];
    selectedCategory: string | null;
    onSelectCategory: (cat: string) => void;
    onDeleteCategory: (cat: string) => void;
    onAddCategory: (name: string) => void;
    newCategoryName: string;
    setNewCategoryName: (name: string) => void;
    showSuggestions: boolean;
    setShowSuggestions: (show: boolean) => void;
    filteredSuggestions: string[];
}

const MobileCategoryBar: React.FC<MobileCategoryBarProps> = ({
    categories,
    selectedCategory,
    onSelectCategory,
    onDeleteCategory,
    onAddCategory,
    newCategoryName,
    setNewCategoryName,
    showSuggestions,
    setShowSuggestions,
    filteredSuggestions
}) => {
    const [isAdding, setIsAdding] = useState(false);

    const handleAddClick = () => {
        if (isAdding && newCategoryName.trim()) {
            onAddCategory(newCategoryName.trim());
            setNewCategoryName('');
            setIsAdding(false);
        } else {
            setIsAdding(true);
        }
    };

    return (
        <div className="p-3 bg-white dark:bg-[#1e1e1e] border-b border-slate-200 dark:border-[#333]">
            <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase text-slate-500">Categories</span>
                <button
                    onClick={handleAddClick}
                    className="ml-auto p-1.5 bg-[#007acc] text-white rounded-md text-xs font-bold uppercase flex items-center gap-1"
                >
                    {isAdding ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isAdding ? 'Confirm' : 'Add'}</span>
                </button>
            </div>

            {isAdding && (
                <div className="mb-3 relative">
                    <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => {
                            setNewCategoryName(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Nome da nova categoria"
                        className="w-full bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#444] rounded-lg px-3 py-2 text-sm outline-none focus:border-[#007acc]"
                        autoFocus
                    />
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#444] rounded-lg shadow-xl max-h-40 overflow-y-auto z-50 py-1">
                            {filteredSuggestions.map(c => (
                                <button
                                    key={c}
                                    onMouseDown={() => {
                                        setNewCategoryName(c);
                                        setShowSuggestions(false);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-[#333]"
                                >
                                    {c}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {categories.length === 0 ? (
                    <p className="text-xs text-slate-400">Nenhuma categoria</p>
                ) : (
                    categories.map(cat => (
                        <div key={cat} className="flex items-center shrink-0">
                            <button
                                onClick={() => onSelectCategory(cat)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-l-md transition-colors ${
                                    selectedCategory === cat
                                        ? 'bg-[#007acc] text-white'
                                        : 'bg-slate-100 dark:bg-[#252526] text-slate-700 dark:text-slate-300'
                                }`}
                            >
                                {cat}
                            </button>
                            {selectedCategory === cat && (
                                <button
                                    onClick={() => onDeleteCategory(cat)}
                                    className="p-1.5 bg-[#007acc] text-white rounded-r-md hover:bg-rose-500 transition-colors"
                                    title="Excluir categoria"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// ==================== COMPONENTE PRINCIPAL ====================

const LocalizationEditor: React.FC = () => {
    const { workspaces, activeWorkspaceId, updateWorkspace } = useEditorStore();
    const workspace = workspaces.find(w => w.id === activeWorkspaceId);
    const isMobile = useIsMobile();

    const [selectedLang, setSelectedLang] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    // UI States
    const [newLang, setNewLang] = useState<string>(SUPPORTED_LANGUAGES[0].id);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [confirmDeleteLang, setConfirmDeleteLang] = useState<string | null>(null);
    const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!workspace) return null;

    const rawLocData = workspace.localization || { 'en-US': {} };

    const locData = useMemo(() => {
        const normalized: Record<string, Record<string, Record<string, string>>> = {};
        for (const lang in rawLocData) {
            normalized[lang] = {};
            for (const cat in rawLocData[lang]) {
                normalized[lang][cat] = flattenObject(rawLocData[lang][cat]);
            }
        }
        return normalized;
    }, [rawLocData]);

    const currentLangs = Object.keys(locData).sort();

    const saveLocData = (newData: any) => {
        updateWorkspace(activeWorkspaceId!, { localization: newData });
    };

    const handleAddLanguage = () => {
        if (rawLocData[newLang]) {
            toast.error("Language already exists!");
            return;
        }
        const updated = JSON.parse(JSON.stringify(rawLocData));
        updated[newLang] = {};
        saveLocData(updated);
        toast.success(`Language added!`);
    };

    const handleDeleteLanguage = (lang: string, e: React.MouseEvent) => {
        e.stopPropagation(); 
        if (confirmDeleteLang === lang) {
            const updated = JSON.parse(JSON.stringify(rawLocData));
            delete updated[lang];
            saveLocData(updated);
            setConfirmDeleteLang(null);
            if (selectedLang === lang) setSelectedLang(null);
            toast.success(`Language deleted.`);
        } else {
            setConfirmDeleteLang(lang);
            setTimeout(() => setConfirmDeleteLang(null), 3000); 
        }
    };

    const handleAddCategory = () => {
        const cat = newCategoryName.trim();
        if (!cat || !selectedLang) return;
        if (rawLocData[selectedLang] && rawLocData[selectedLang][cat]) {
            toast.error("Category already exists!");
            return;
        }
        const updated = JSON.parse(JSON.stringify(rawLocData));
        if (!updated[selectedLang]) updated[selectedLang] = {};
        updated[selectedLang][cat] = {};
        saveLocData(updated);
        setNewCategoryName('');
        setSelectedCategory(cat);
        setShowSuggestions(false);
    };

    const handleAddKey = () => {
        if (!selectedLang || !selectedCategory) return;
        const newKey = `NewKey_${Date.now()}`;
        const updated = JSON.parse(JSON.stringify(rawLocData));
        if (!updated[selectedLang]) updated[selectedLang] = {};
        if (!updated[selectedLang][selectedCategory]) updated[selectedLang][selectedCategory] = {};
        updated[selectedLang][selectedCategory][newKey] = "";
        saveLocData(updated);
        setNewlyCreatedKey(newKey);
        setSearchTerm('');
    };

    const handleUpdateTranslationKey = (oldKey: string, newKey: string, value: string) => {
        if (!selectedLang || !selectedCategory) return;
        if (oldKey === newKey) return;
        const updated = JSON.parse(JSON.stringify(rawLocData)); 
        if (!updated[selectedLang]) updated[selectedLang] = {};
        if (!updated[selectedLang][selectedCategory]) updated[selectedLang][selectedCategory] = {};
        if (updated[selectedLang][selectedCategory][newKey] !== undefined) {
            toast.error(`Key "${newKey}" already exists!`);
            return;
        }
        delete updated[selectedLang][selectedCategory][oldKey];
        updated[selectedLang][selectedCategory][newKey] = value;
        saveLocData(updated);
        if (newlyCreatedKey === oldKey) setNewlyCreatedKey(newKey);
    };

    const handleUpdateTranslationValue = (key: string, newValue: string) => {
        if (!selectedLang || !selectedCategory) return;
        const updated = JSON.parse(JSON.stringify(rawLocData)); 
        if (!updated[selectedLang]) updated[selectedLang] = {};
        if (!updated[selectedLang][selectedCategory]) updated[selectedLang][selectedCategory] = {};
        updated[selectedLang][selectedCategory][key] = newValue;
        saveLocData(updated);
    };

    const handleDeleteTranslation = (key: string) => {
        if (!selectedLang || !selectedCategory) return;
        const updated = JSON.parse(JSON.stringify(rawLocData));
        if (updated[selectedLang] && updated[selectedLang][selectedCategory]) {
            delete updated[selectedLang][selectedCategory][key];
            saveLocData(updated);
        }
    };

    const handleDeleteCategory = (cat: string) => {
        if (!selectedLang) return;
        const updated = JSON.parse(JSON.stringify(rawLocData));
        if (updated[selectedLang]) {
            delete updated[selectedLang][cat];
            saveLocData(updated);
        }
        if (selectedCategory === cat) setSelectedCategory(null);
    };

    const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedLang) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed = JSON.parse(ev.target?.result as string);
                const updated = JSON.parse(JSON.stringify(rawLocData));
                Object.keys(parsed).forEach(category => {
                    if (!updated[selectedLang][category]) {
                        updated[selectedLang][category] = {};
                    }
                    const flatCategoryData = flattenObject(parsed[category]);
                    updated[selectedLang][category] = {
                        ...updated[selectedLang][category],
                        ...flatCategoryData
                    };
                });
                saveLocData(updated);
                toast.success("JSON imported and merged successfully!");
            } catch (err) {
                toast.error("Invalid JSON format.");
            }
        };
        reader.readAsText(file);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getLanguageDisplay = (id: string) => {
        const lang = SUPPORTED_LANGUAGES.find(l => l.id === id);
        return lang ? lang.display : id;
    };

    // ==================== TELA DE SELEÇÃO DE IDIOMA (responsiva, mas já razoável) ====================
    if (!selectedLang) {
        return (
            <div className="h-full bg-slate-50 dark:bg-[#121212] overflow-y-auto p-4 md:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                        <h2 className="text-2xl font-righteous text-slate-800 dark:text-white uppercase tracking-wide">Localization</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Manage game translations</p>
                    </div>

                    <div className="bg-white dark:bg-[#1e1e1e] p-4 rounded-xl border border-slate-200 dark:border-[#333] shadow-sm flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Languages className="w-5 h-5 text-[#007acc] shrink-0" />
                            <select 
                                value={newLang} onChange={(e) => setNewLang(e.target.value)}
                                className="w-full sm:w-56 bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#444] rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#007acc] text-slate-700 dark:text-slate-200 appearance-none"
                            >
                                {SUPPORTED_LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.display}</option>)}
                            </select>
                        </div>
                        <button onClick={handleAddLanguage} className="w-full sm:w-auto px-5 py-2.5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2">
                            <Plus className="w-4 h-4" /> Add Language
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {currentLangs.map(langId => {
                            const categoryCount = Object.keys(locData[langId] || {}).length;
                            const isConfirming = confirmDeleteLang === langId;
                            return (
                                <div 
                                    key={langId} 
                                    onClick={() => setSelectedLang(langId)}
                                    className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-xl p-5 hover:border-[#007acc] dark:hover:border-[#007acc] cursor-pointer transition-all shadow-sm flex items-center justify-between group"
                                >
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{getLanguageDisplay(langId)}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-[#252526] px-1.5 py-0.5 rounded">{langId}</span>
                                            <span className="text-[10px] font-bold uppercase text-slate-400">{categoryCount} Categories</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDeleteLanguage(langId, e)}
                                        className={`p-2 rounded-lg transition-colors ${isConfirming ? 'bg-rose-500 text-white' : 'text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500'}`}
                                        title={isConfirming ? "Click again to confirm" : "Delete Language"}
                                    >
                                        {isConfirming ? <AlertCircle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ==================== DADOS PARA O EDITOR ====================
    const categories = Object.keys(locData[selectedLang] || {}).sort();
    const currentTranslations = selectedCategory ? locData[selectedLang][selectedCategory] : {};
    const filteredKeys = Object.keys(currentTranslations || {}).filter(k => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return k.toLowerCase().includes(s) || (currentTranslations[k]?.toLowerCase().includes(s) ?? false);
    });

    const filteredSuggestions = STANDARD_CATEGORIES.filter(c => 
        c.toLowerCase().includes(newCategoryName.toLowerCase()) && c !== newCategoryName
    );

    // ==================== RENDER CONDICIONAL: MOBILE VS DESKTOP ====================
    if (isMobile) {
        // ---------- LAYOUT MOBILE ----------
        return (
            <div className="h-full flex flex-col bg-slate-50 dark:bg-[#121212] overflow-hidden">
                {/* Barra superior com idioma e ações */}
                <div className="p-3 bg-white dark:bg-[#1e1e1e] border-b border-slate-200 dark:border-[#333] flex items-center justify-between">
                    <button onClick={() => { setSelectedLang(null); setSelectedCategory(null); }} className="flex items-center gap-1 px-2 py-1 text-slate-600 dark:text-slate-300">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-xs font-bold">Languages</span>
                    </button>
                    <span className="text-xs font-mono bg-[#007acc]/10 text-[#007acc] px-2 py-1 rounded">{selectedLang}</span>
                    <label className="p-1.5 text-emerald-600 dark:text-emerald-500 cursor-pointer">
                        <Upload className="w-5 h-5" />
                        <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJson} />
                    </label>
                </div>

                {/* Barra de categorias mobile (com novo componente) */}
                <MobileCategoryBar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onAddCategory={handleAddCategory}
                    newCategoryName={newCategoryName}
                    setNewCategoryName={setNewCategoryName}
                    showSuggestions={showSuggestions}
                    setShowSuggestions={setShowSuggestions}
                    filteredSuggestions={filteredSuggestions}
                />

                {/* Área de edição das chaves */}
                {selectedCategory ? (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <div className="p-3 bg-white dark:bg-[#1e1e1e] border-b border-slate-200 dark:border-[#333] flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search key..."
                                    className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-[#333] rounded-md pl-9 pr-3 py-2 text-sm outline-none focus:border-[#007acc]"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button onClick={handleAddKey} className="p-2 bg-[#007acc] text-white rounded-md">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                            {filteredKeys.length === 0 ? (
                                <p className="text-center text-xs text-slate-400">Nenhuma tradução encontrada.</p>
                            ) : (
                                filteredKeys.map(key => (
                                    <TranslationRow
                                        key={key}
                                        locKey={key}
                                        locValue={currentTranslations[key]}
                                        onUpdateKey={handleUpdateTranslationKey}
                                        onUpdateValue={handleUpdateTranslationValue}
                                        onDelete={handleDeleteTranslation}
                                        isNewlyCreated={newlyCreatedKey === key}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                        Selecione uma categoria
                    </div>
                )}
            </div>
        );
    }

    // ---------- LAYOUT DESKTOP (original, com pequenos ajustes) ----------
    return (
        <div className="h-full flex flex-col md:flex-row bg-slate-50 dark:bg-[#121212] overflow-hidden">
            {/* Esquerda: Categorias */}
            <div className="w-full md:w-72 bg-white dark:bg-[#1e1e1e] border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#333] flex flex-col shrink-0">
                <div className="p-3.5 border-b border-slate-200 dark:border-[#333] flex items-center justify-between bg-slate-50 dark:bg-[#1a1a1a]">
                    <button onClick={() => { setSelectedLang(null); setSelectedCategory(null); }} className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-slate-200 dark:hover:bg-[#333] rounded-md text-slate-600 dark:text-slate-300 transition-colors text-xs font-bold uppercase">
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#007acc] bg-[#007acc]/10 px-2 py-0.5 rounded">{selectedLang}</span>
                    <label className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#333] rounded-md text-emerald-600 dark:text-emerald-500 cursor-pointer transition-colors" title="Import JSON">
                        <Upload className="w-4 h-4" />
                        <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImportJson} />
                    </label>
                </div>

                <div className="p-3 flex-1 overflow-y-auto scrollbar-hide space-y-1.5 max-h-[30vh] md:max-h-none">
                    {categories.length === 0 ? (
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-6">No categories</p>
                    ) : (
                        categories.map(cat => (
                            <div key={cat} className="flex items-stretch">
                                <button 
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`flex-1 flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-bold transition-all min-w-0 ${selectedCategory === cat ? 'bg-[#007acc] text-white rounded-l-md' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252526] rounded-md'}`}
                                >
                                    <Braces className={`w-3.5 h-3.5 shrink-0 ${selectedCategory === cat ? 'opacity-100' : 'opacity-50 text-[#007acc]'}`} />
                                    <span className="truncate text-left">{cat}</span>
                                </button>
                                
                                {selectedCategory === cat && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat); }} 
                                        className="p-2.5 bg-[#007acc] text-white hover:bg-rose-500 rounded-r-md border-l border-white/20 transition-all shrink-0"
                                        title="Delete Category"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-[#333] bg-slate-50 dark:bg-[#1a1a1a]">
                    <div className="flex flex-col gap-2 relative">
                        <div className="relative">
                            <input 
                                placeholder="New Category..." 
                                value={newCategoryName} 
                                onChange={(e) => {
                                    setNewCategoryName(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                className="w-full bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#444] rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-[#007acc] text-slate-800 dark:text-slate-200"
                            />
                            {showSuggestions && filteredSuggestions.length > 0 && (
                                <div className="absolute bottom-full left-0 w-full mb-1 bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#444] rounded-lg shadow-xl max-h-40 overflow-y-auto z-50 py-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-[#444] [&::-webkit-scrollbar-thumb]:rounded-full">
                                    {filteredSuggestions.map(c => (
                                        <button 
                                            key={c} 
                                            onMouseDown={() => setNewCategoryName(c)} 
                                            className="w-full flex items-center gap-2 text-left px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333] transition-colors"
                                        >
                                            <Braces className="w-3.5 h-3.5 shrink-0 opacity-50 text-[#007acc]" />
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="w-full py-2 bg-slate-200 dark:bg-[#333] hover:bg-[#007acc] hover:text-white disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
                            Add Category
                        </button>
                    </div>
                </div>
            </div>

            {/* Direita: Editor de Chaves */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {!selectedCategory ? (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-40 select-none p-4 text-center">
                        <FileJson className="w-12 h-12 text-slate-400 mb-3" />
                        <p className="text-xs font-righteous uppercase tracking-widest text-slate-500">Select a category on the left</p>
                    </div>
                ) : (
                    <>
                        <div className="p-4 bg-white dark:bg-[#1e1e1e] border-b border-slate-200 dark:border-[#333] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm z-10 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded bg-[#007acc]/10 flex items-center justify-center border border-[#007acc]/20">
                                    <Braces className="w-4 h-4 text-[#007acc]" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-righteous text-slate-900 dark:text-white tracking-wide">{selectedCategory}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{Object.keys(currentTranslations).length} Keys</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-48 lg:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <input 
                                        type="text" placeholder="Search keys..." 
                                        className="w-full bg-slate-50 dark:bg-[#121212] border border-slate-200 dark:border-[#333] rounded-md pl-9 pr-3 py-1.5 text-xs font-bold outline-none focus:border-[#007acc] text-slate-700 dark:text-slate-200"
                                        value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <button onClick={handleAddKey} className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#007acc] text-white rounded-md text-[10px] font-bold uppercase tracking-widest hover:bg-[#0062a3] transition-all shadow-sm shrink-0">
                                    <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Key</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                            {filteredKeys.length === 0 ? (
                                <p className="text-center text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-10">No translations found.</p>
                            ) : (
                                filteredKeys.map(key => (
                                    <TranslationRow 
                                        key={key}
                                        locKey={key}
                                        locValue={currentTranslations[key]}
                                        onUpdateKey={handleUpdateTranslationKey}
                                        onUpdateValue={handleUpdateTranslationValue}
                                        onDelete={handleDeleteTranslation}
                                        isNewlyCreated={newlyCreatedKey === key}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LocalizationEditor;