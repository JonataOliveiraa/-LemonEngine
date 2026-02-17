import React, { useState, useRef } from 'react';
import { useEditorStore } from '../../store';
import { EditorHandle } from '../../types'; // Certifique-se de que types.ts foi atualizado
import Sidebar from './Sidebar';
import EntityEditor from './editors/ItemEditor';
import ManifestEditor from './editors/ManifestEditor';
import MainJsEditor from './editors/MainJsEditor';
import PropertiesPanel from './PropertiesPanel';
import CreationModal from './CreationModal';
import DeleteConfirmation from './DeleteConfirmation'; 
import { ChevronRight, Terminal, X, FolderInput, Lightbulb, FileSearch, Save } from 'lucide-react';
import RenameModal from './RenameModal';
import MoveModal from './MoveModal';
import FileTabs from './FileTabs'; 

const Editor: React.FC = () => {
  const { 
    activeWorkspaceId, activeEntityId, workspaces, focusMode, isFullscreen, 
    isSidebarOpen, setSidebarOpen, isPropertiesOpen, setPropertiesOpen,
    modalCreateFolder, closeCreateFolderModal, addFolder,
    creationModal, moveModal, openMoveModal
  } = useEditorStore();

  // Ref que guardará a instância do editor ativo (seja EntityEditor ou MainJsEditor)
  const currentEditorRef = useRef<EditorHandle>(null);

  const safeWorkspaces = workspaces || []; 
  const workspace = safeWorkspaces.find(w => w.id === activeWorkspaceId);
  const activeEntity = workspace?.entities?.find(e => e.id === activeEntityId);
  
  const [newFolderName, setNewFolderName] = useState('');

  // Funções disparadas pelos botões do Header Unificado
  const handleSave = () => currentEditorRef.current?.save();
  const handleFocus = () => currentEditorRef.current?.focus && currentEditorRef.current.focus();

  const renderMainContent = () => {
    // 1. Editor de Settings.json (Não usa ref pois salva automaticamente ou tem botão próprio)
    if (activeEntityId === 'settings' && workspace) {
      return (
        <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-8">
          <ManifestEditor workspace={workspace} type="settings" />
        </div>
      );
    }
    
    // 2. Editor do Main.js
    if (activeEntityId === 'main' && workspace) {
      // IMPORTANTE: MainJsEditor precisa ter forwardRef implementado também para isso funcionar
      return (
        <div className="h-full">
          <MainJsEditor ref={currentEditorRef} workspace={workspace} />
        </div>
      );
    }

    // 3. Editor de Entidade (Item, NPC, etc)
    if (activeEntity) {
      return (
        <div className="h-full">
            {/* Passamos a ref aqui */}
            <EntityEditor ref={currentEditorRef} entity={activeEntity} />
        </div>
      );
    }

    // 4. Estado Vazio (Dashboard inicial)
    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 md:p-12 animate-in fade-in duration-700">
            <div className="max-w-md space-y-8">
                <div className="relative inline-block">
                    <div className="bg-slate-50 dark:bg-[#252526] p-8 md:p-10 rounded-[2rem] border border-slate-200 dark:border-[#333] shadow-2xl">
                        <Terminal className="w-12 h-12 md:w-16 md:h-16 text-slate-400 dark:text-slate-600" />
                    </div>
                </div>
                <div className="space-y-4 px-4">
                    <h3 className="text-xl md:text-2xl font-bold text-slate-700 dark:text-slate-300 tracking-tight uppercase">Ready to Hack</h3>
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden relative h-full">
        
        {/* SIDEBAR */}
        {!isFullscreen && !focusMode && (
          <>
            <div 
              className={`fixed inset-0 bg-black/60 z-[100] lg:hidden backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setSidebarOpen(false)}
            />
            
            <aside className={`
              fixed inset-y-0 left-0 lg:static lg:inset-auto 
              h-full lg:h-full 
              z-[110] lg:z-auto 
              transition-transform duration-300 ease-in-out 
              border-r border-slate-200 dark:border-[#333] shrink-0
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              w-[280px] bg-slate-50 dark:bg-[#252526]
            `}>
              <Sidebar />
            </aside>
          </>
        )}

        {/* Toggle Button Mobile */}
        {!isSidebarOpen && !focusMode && !isFullscreen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="fixed lg:hidden left-0 top-1/2 -translate-y-1/2 bg-[#007acc] text-white p-2 rounded-r-lg shadow-xl z-[90] active:scale-90 transition-transform"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        
        {/* Main Content Area */}
        <main className="flex-1 bg-white dark:bg-[#1e1e1e] flex flex-col overflow-hidden relative transition-all duration-300">
          
          {/* --- HEADER UNIFICADO (TABS + TOOLBAR) --- */}
          <div className="h-10 bg-slate-100 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333] flex items-center justify-between shrink-0">
              
              {/* Esquerda: FileTabs (flex-1 para ocupar espaço) */}
              <div className="flex-1 min-w-0 h-full overflow-hidden">
                  <FileTabs />
              </div>

              {/* Direita: Actions (Só aparece se tiver entidade ativa ou main.js) */}
              {(activeEntity || activeEntityId === 'main') && (
                  <div className="flex items-center gap-1 px-2 dark:border-[#333] bg-white dark:bg-[#252526] h-full shrink-0 z-10 shadow-sm">
                      
                      {/* Caminho do Arquivo (Apenas para Entidades) */}
                      {activeEntity && (
                        <div className="hidden md:block mr-2 text-[9px] text-slate-400 font-mono max-w-[150px] truncate">
                            /{activeEntity.folder || 'Root'}
                        </div>
                      )}

                      {/* Botão Mover (Apenas para Entidades) */}
                      {activeEntity && (
                        <button onClick={() => openMoveModal(activeEntity.id, activeEntity.folder || '')} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-[#333] transition-colors" title="Move File">
                            <FolderInput className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Botão Inspetor (Apenas para Entidades) */}
                      {activeEntity && (
                        <button onClick={() => setPropertiesOpen(!isPropertiesOpen)} className={`p-1.5 rounded transition-all ${isPropertiesOpen ? 'bg-[#007acc] text-white' : 'text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-[#333]'}`} title="Inspect">
                            <FileSearch className="w-4 h-4" />
                        </button>
                      )}
                      
                      {/* Botão Focar Editor */}
                      <button onClick={handleFocus} className="p-1.5 rounded text-slate-500 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-[#333] transition-colors" title="Focus Editor">
                          <Lightbulb className="w-4 h-4" />
                      </button>
                      
                      <div className="w-px h-4 bg-slate-200 dark:bg-[#444] mx-1"></div>

                      {/* Botão Salvar (Comanda o filho via Ref) */}
                      <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-md text-[10px] font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm">
                          <Save className="w-3 h-3" /> Save
                      </button>
                  </div>
              )}
          </div>

          <div className="flex-1 overflow-hidden h-full">
            {renderMainContent()}
          </div>
        </main>

        {/* Properties Panel */}
        {isPropertiesOpen && !isFullscreen && !focusMode && activeEntity && (
            <div className="w-80 h-full shrink-0 hidden lg:block">
                <PropertiesPanel entity={activeEntity} />
            </div>
        )}

      {/* Modais Globais */}
      {creationModal?.isOpen && <CreationModal />}
      <DeleteConfirmation />
      <RenameModal />
      {moveModal.isOpen && <MoveModal />}

      {modalCreateFolder.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[300] p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#252526] rounded-2xl w-full max-w-md border border-slate-200 dark:border-[#333] p-6 shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-[#333] flex justify-between items-center bg-slate-50 dark:bg-[#1e1e1e]">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white">Create Directory</h2>
              <button onClick={closeCreateFolderModal} className="text-slate-400 hover:bg-slate-200 dark:hover:bg-[#333] p-2 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={e => { 
              e.preventDefault(); 
              const name = newFolderName.trim().replace(/\s+/g, '');
              if(!activeWorkspaceId || !modalCreateFolder.category || !name) return; 
              const full = modalCreateFolder.parentPath ? `${modalCreateFolder.parentPath}/${name}` : name; 
              addFolder(activeWorkspaceId, modalCreateFolder.category, full); 
              setNewFolderName(''); 
              closeCreateFolderModal();
            }} className="p-10 space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Directory Name</label>
                <input 
                  autoFocus 
                  placeholder="e.g. SubFolder" 
                  className="w-full bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-xl px-6 py-5 text-lg md:text-base font-bold text-slate-900 dark:text-white outline-none focus:border-[#007acc] shadow-inner" 
                  value={newFolderName} onChange={e => setNewFolderName(e.target.value)} 
                /> 
              </div>
              <button className="w-full py-5 bg-[#007acc] hover:bg-[#0062a3] text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95">Add Folder</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Editor;