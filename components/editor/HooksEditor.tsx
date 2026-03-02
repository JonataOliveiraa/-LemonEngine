import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store';
import { Save, Zap, Loader2, Info, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

const HOOK_CATEGORIES = [
  'Item', 'NPC', 'Player', 'Projectile', 'Recipe', 
  'Chat', 'Cloud', 'GameContent', 'Lang', 'Main', 
  'Wiring', 'WorldGen'
];

const HooksEditor: React.FC = () => {
  const { activeWorkspaceId, workspaces, updateWorkspace } = useEditorStore();
  const workspace = workspaces.find(w => w.id === activeWorkspaceId);
  
  const [activeCategory, setActiveCategory] = useState<string>('Item');
  const [loading, setLoading] = useState(false);
  const [parsedHooks, setParsedHooks] = useState<Record<string, Record<string, boolean>>>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Controle do Dropdown no Mobile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!workspace) return;
    
    const loadHooks = async () => {
      setLoading(true);
      try {
        const loaded: Record<string, Record<string, boolean>> = {};
        
        for (const cat of HOOK_CATEGORIES) {
          if (workspace.enabledHooks?.[cat]) {
            loaded[cat] = { ...workspace.enabledHooks[cat] };
          } else {
            try {
              const res = await fetch(`/framework/TL/Hooks/${cat}.js`);
              if (res.ok) {
                const text = await res.text();
                const match = text.match(/static\s+HookList\s*=\s*{([\s\S]*?)}/);
                if (match) {
                  const block = match[1];
                  const hooks: Record<string, boolean> = {};
                  block.split('\n').forEach(line => {
                    const parts = line.split(':');
                    if (parts.length >= 2) {
                      const key = parts[0].replace(/\/\/.*$/, '').trim();
                      const valStr = parts[1].split(',')[0].replace(/\/\/.*$/, '').trim();
                      if (key) {
                        hooks[key] = valStr === 'true';
                      }
                    }
                  });
                  loaded[cat] = hooks;
                }
              }
            } catch (e) {
              console.warn(`Failed to load default hooks for ${cat}`, e);
            }
          }
        }
        setParsedHooks(loaded);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadHooks();
  }, [workspace?.id]);

  const handleToggle = (key: string) => {
    setParsedHooks(prev => ({
      ...prev,
      [activeCategory]: {
        ...prev[activeCategory],
        [key]: !prev[activeCategory]?.[key]
      }
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!activeWorkspaceId) return;
    updateWorkspace(activeWorkspaceId, { enabledHooks: parsedHooks });
    setHasChanges(false);
    toast.success('Hooks configuration saved successfully!');
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-[#1e1e1e]">
        <Loader2 className="w-8 h-8 text-[#007acc] animate-spin" />
      </div>
    );
  }

  const currentHooks = parsedHooks[activeCategory] || {};

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-slate-50 dark:bg-[#1e1e1e] overflow-hidden">
      
      {/* ----------------- MOBILE NAVIGATION ----------------- */}
      <div className="md:hidden p-4 border-b border-slate-200 dark:border-[#333] bg-white dark:bg-[#252526] z-10 shrink-0" ref={dropdownRef}>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full flex items-center justify-between p-3 bg-slate-100 dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-lg"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#007acc]" />
            <span className="font-righteous text-slate-800 dark:text-white uppercase tracking-wide text-sm">{activeCategory} Hooks</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown Menu (Mobile) */}
        {isDropdownOpen && (
          <div className="absolute top-[72px] left-4 right-4 bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-lg shadow-xl overflow-hidden max-h-[60vh] overflow-y-auto z-20 animate-in fade-in slide-in-from-top-2">
             {HOOK_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setIsDropdownOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#333] last:border-0 text-sm font-bold transition-colors ${activeCategory === cat ? 'bg-[#007acc]/10 text-[#007acc]' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#333]'}`}
              >
                <span>{cat}</span>
                <span className="text-[10px] bg-slate-200 dark:bg-[#1e1e1e] text-slate-500 px-2.5 py-1 rounded-md">
                  {Object.keys(parsedHooks[cat] || {}).length}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ----------------- DESKTOP SIDEBAR ----------------- */}
      <div className="hidden md:flex w-64 bg-white dark:bg-[#252526] border-r border-slate-200 dark:border-[#333] flex-col h-full shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-[#333] shrink-0 bg-slate-50 dark:bg-[#1e1e1e]">
          <h2 className="text-xs font-righteous uppercase tracking-widest text-slate-400">Class Target</h2>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {HOOK_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold transition-all ${activeCategory === cat ? 'bg-[#007acc] text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#333]'}`}
            >
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${activeCategory === cat ? 'text-blue-200' : 'text-slate-400'}`} />
                {cat}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md ${activeCategory === cat ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-[#1e1e1e] text-slate-500'}`}>
                {Object.keys(parsedHooks[cat] || {}).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ----------------- MAIN AREA (SWITCHES) ----------------- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="p-4 md:p-10 max-w-4xl w-full mx-auto flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Header & Save Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
             <div className="hidden md:block">
               <h1 className="text-2xl font-righteous text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-3">
                 <Zap className="w-6 h-6 text-[#007acc]" />
                 {activeCategory} Hooks
               </h1>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Enable or disable events for this class</p>
             </div>
             
             {/* No Mobile, a descrição fica aqui em cima */}
             <p className="md:hidden text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
               Configure hooks to enable/disable specific code events.
             </p>
             
             <button
               onClick={handleSave}
               disabled={!hasChanges}
               className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-md shrink-0 ${hasChanges ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20 active:scale-95' : 'bg-slate-200 dark:bg-[#333] text-slate-400 cursor-not-allowed'}`}
             >
               <Save className="w-4 h-4" /> Save Changes
             </button>
          </div>

          {/* Grid de Switches */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 pb-24">
            {Object.entries(currentHooks).map(([key, enabled]) => (
              <div 
                key={key} 
                className={`bg-white dark:bg-[#252526] border p-4 rounded-lg flex items-center justify-between cursor-pointer transition-colors shadow-sm hover:shadow-md ${enabled ? 'border-slate-300 dark:border-[#444]' : 'border-slate-100 dark:border-[#222] opacity-70 hover:opacity-100'}`}
                onClick={() => handleToggle(key)}
              >
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className={`text-sm font-bold truncate ${enabled ? 'text-slate-800 dark:text-slate-200' : 'text-slate-500'}`} title={key}>{key}</h3>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{enabled ? 'Active' : 'Disabled'}</p>
                </div>
                
                {/* Switch iOS Style */}
                <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${enabled ? 'bg-[#007acc]' : 'bg-slate-300 dark:bg-[#444]'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            ))}
            
            {Object.keys(currentHooks).length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center opacity-50">
                    <Info className="w-10 h-10 text-slate-400 mb-4" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 text-center">No hooks found for<br/>{activeCategory} category.</p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HooksEditor;