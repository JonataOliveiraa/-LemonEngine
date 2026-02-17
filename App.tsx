import React, { useEffect } from 'react';
import { useEditorStore } from './store';
import Dashboard from './components/workspace/Dashboard';
import Editor from './components/editor/Editor';
import TextureManager from './components/editor/TextureManager'; // Importe o TextureManager
import Header from './components/editor/Header'; // Header agora fica no App
import GlobalSettingsModal from './components/GlobalSettingsModal';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { activeWorkspaceId, theme, _hasHydrated, viewMode } = useEditorStore();
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  if (!_hasHydrated) {
      return (
          <div className={`h-screen w-screen flex flex-col items-center justify-center transition-colors duration-300 ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'}`}>
             <Loader2 className={`w-10 h-10 animate-spin ${theme === 'dark' ? 'text-white' : 'text-[#007acc]'}`} />
             <p className={`mt-4 text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                 Loading Assets...
             </p>
          </div>
      );
  }

  // Se não tem projeto aberto, mostra Dashboard
  if (!activeWorkspaceId) {
    return (
      <div className={`h-screen w-screen flex flex-col transition-colors duration-300 font-sans ${theme === 'dark' ? 'bg-[#1e1e1e] text-slate-200' : 'bg-white text-slate-900'} overflow-hidden`}>
        <Toaster position="bottom-right" theme={theme} />
        <Dashboard />
        <GlobalSettingsModal />
      </div>
    );
  }

  // Se tem projeto, mostra o Ambiente de Trabalho (Header + Conteúdo)
  return (
    <div className={`h-screen w-screen flex flex-col transition-colors duration-300 font-sans ${theme === 'dark' ? 'bg-[#1e1e1e] text-slate-200' : 'bg-white text-slate-900'} overflow-hidden`}>
      <Toaster position="bottom-right" theme={theme} />
      
      {/* Header Fixo Global */}
      <Header />

      {/* Área Principal - Alterna entre Editor e TextureManager */}
      <div className="flex-1 overflow-hidden relative">
        {viewMode === 'textures' ? (
          <TextureManager />
        ) : (
          <Editor />
        )}
      </div>

      <GlobalSettingsModal />
    </div>
  );
};

export default App;