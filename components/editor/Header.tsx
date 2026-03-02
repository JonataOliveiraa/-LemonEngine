import React, { useState } from 'react';
import { useEditorStore } from '../../store';
import { 
  ArrowLeft, Share2, Settings, ChevronRight, Box, Loader2, User, 
  Image as ImageIcon, MoreVertical, PlusCircle, Code, Zap, Globe, Home 
} from 'lucide-react';
import { buildMod } from '../../services/buildService';
import { toast } from 'sonner';

const Header: React.FC = () => {
  const { 
    setActiveWorkspace, activeWorkspaceId, workspaces, setGlobalSettingsOpen, 
    userProfile, viewMode, setViewMode, openAddTextureModal 
  } = useEditorStore();
  
  const workspace = workspaces.find(w => w.id === activeWorkspaceId);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBuild = async () => {
    if (!workspace) return;
    setIsBuilding(true);
    const buildToast = toast.loading(`Compiling ${workspace.name}...`);
    try {
      await buildMod(workspace);
      toast.success("Mod bundled successfully!", { id: buildToast });
    } catch (error) {
      toast.error("Compilation failed.", { id: buildToast });
    } finally {
      setIsBuilding(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="h-12 bg-slate-100 dark:bg-[#2d2d2d] border-b border-slate-300 dark:border-[#1e1e1e] flex items-center justify-between px-4 shrink-0 z-[70] shadow-sm transition-colors relative">
      
      {/* ESQUERDA: NOME DO PROJETO E SETA DE VOLTAR */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        
        {/* Mostra a seta apenas se não estiver na página principal (entities/code editor) */}
        {viewMode !== 'entities' && viewMode !== 'files' && (
          <button 
            onClick={() => setViewMode('entities')}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#3e3e3e] rounded-md transition-colors text-slate-500 dark:text-slate-400 shrink-0"
            title="Back to Code Editor"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-[#007acc] p-1.5 rounded-md shadow-sm shrink-0">
            <Box className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm font-righteous text-slate-700 dark:text-slate-200 uppercase tracking-wide truncate max-w-[100px] sm:max-w-[200px]">
              {workspace?.name}
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 shrink-0" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider shrink-0 mt-0.5">v{workspace?.version}.0</span>
          </div>
        </div>
      </div>

      {/* DIREITA: CONTROLES E MENUS */}
      <div className="flex items-center gap-1 sm:gap-3">
        
        {/* --- DESKTOP CONTROLS --- */}
        <div className="hidden md:flex items-center gap-2">
          
          {/* NAVEGAÇÃO CENTRAL (EDITOR | TEXTURES | HOOKS | LOCALIZATION) */}
          <div className="flex items-center bg-slate-200 dark:bg-[#3e3e3e] rounded-lg p-1 mr-2">
              <button 
                onClick={() => setViewMode('entities')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'entities' || viewMode === 'files' ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Code className="w-3.5 h-3.5" /> Editor
              </button>
              <button 
                onClick={() => setViewMode('textures')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'textures' ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <ImageIcon className="w-3.5 h-3.5" /> Textures
              </button>
              <button 
                onClick={() => setViewMode('hooks')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'hooks' ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Zap className="w-3.5 h-3.5" /> Hooks
              </button>
              <button 
                onClick={() => setViewMode('localization')}
                className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'localization' ? 'bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                <Globe className="w-3.5 h-3.5" /> Localization
              </button>
          </div>
          <div className="w-px h-5 bg-slate-300 dark:bg-[#3e3e3e] mx-1"></div>

          {/* Botão de Build Compacto */}
          <button 
            onClick={handleBuild}
            disabled={isBuilding}
            title="Build Mod"
            className="bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-slate-400 dark:disabled:bg-slate-700 text-white px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
          >
            {isBuilding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>Build</span>
          </button>
          
          <button 
            onClick={() => setGlobalSettingsOpen(true)}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-[#3e3e3e] rounded-md text-slate-500 dark:text-slate-400 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-300 dark:border-[#3e3e3e]">
            {/* NOVO BOTÃO DE SAÍDA / DASHBOARD */}
            <button 
                onClick={() => setActiveWorkspace(null)}
                className="p-1.5 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 rounded-md text-slate-500 dark:text-slate-400 transition-colors"
                title="Return to Dashboard"
            >
                <Home className="w-4 h-4" />
            </button>

            <div className="w-6 h-6 rounded-md bg-slate-200 dark:bg-[#3e3e3e] flex items-center justify-center border border-slate-300 dark:border-[#4e4e4e] ml-1">
                <User className="w-3 h-3 text-slate-500 dark:text-slate-400" />
            </div>
          </div>
        </div>

        {/* --- MOBILE MENU --- */}
        <div className="md:hidden relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:bg-slate-200 dark:hover:bg-[#3e3e3e] rounded-md transition-colors text-slate-500 dark:text-slate-400"
          >
            <MoreVertical className="w-5 h-5" />
          </button>

          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-[80]" onClick={() => setIsMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-lg shadow-xl z-[90] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                
                <div className="p-2 border-b border-slate-100 dark:border-[#333]">
                    <button 
                      onClick={() => { setViewMode('entities'); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[10px] font-bold uppercase transition-colors ${viewMode === 'entities' || viewMode === 'files' ? 'bg-[#007acc] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333]'}`}
                    >
                      <Code className="w-4 h-4" /> Code Editor
                    </button>
                    <button 
                      onClick={() => { setViewMode('textures'); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[10px] font-bold uppercase transition-colors mt-1 ${viewMode === 'textures' ? 'bg-[#007acc] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333]'}`}
                    >
                      <ImageIcon className="w-4 h-4" /> Textures
                    </button>
                    <button 
                      onClick={() => { setViewMode('hooks'); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[10px] font-bold uppercase transition-colors mt-1 ${viewMode === 'hooks' ? 'bg-[#007acc] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333]'}`}
                    >
                      <Zap className="w-4 h-4" /> Hooks
                    </button>
                    <button 
                      onClick={() => { setViewMode('localization'); setIsMenuOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-[10px] font-bold uppercase transition-colors mt-1 ${viewMode === 'localization' ? 'bg-[#007acc] text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333]'}`}
                    >
                      <Globe className="w-4 h-4" /> Localization
                    </button>
                </div>

                {viewMode === 'textures' && (
                    <button 
                        onClick={() => { openAddTextureModal(); setIsMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-[#2d2d2d]"
                    >
                        <PlusCircle className="w-4 h-4" /> Add Texture
                    </button>
                )}
                
                <button 
                  onClick={handleBuild}
                  disabled={isBuilding}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-[#0e639c] dark:text-sky-400 hover:bg-slate-50 dark:hover:bg-[#2d2d2d] disabled:opacity-50"
                >
                  {isBuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />} Build Mod
                </button>
                
                <button 
                  onClick={() => { setGlobalSettingsOpen(true); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d2d2d]"
                >
                  <Settings className="w-4 h-4" /> Settings
                </button>

                <div className="h-px bg-slate-100 dark:bg-[#333]" />
                
                {/* NOVO BOTÃO DE SAÍDA / DASHBOARD MOBILE */}
                <button 
                  onClick={() => { setActiveWorkspace(null); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <Home className="w-4 h-4" /> Back to Dashboard
                </button>

              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;