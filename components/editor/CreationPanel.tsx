import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store';
import { TEMPLATES_BY_CATEGORY } from '../../constants';
import { EntityType } from '../../types';
import { Eye, Upload, Wand2, Terminal, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  isMobile?: boolean; 
  onClose?: () => void;
}

const CreationPanel: React.FC<Props> = ({ isMobile = false, onClose }) => {
  const { 
    creationModal, // <--- NOME CORRETO DO STORE
    closeCreationModal, // <--- NOME CORRETO
    addEntity, 
    activeWorkspaceId, 
    setSidebarOpen,
    expandToPath
  } = useEditorStore();

  // Usa creationModal para pegar os dados (Desktop e Mobile unificados)
  const activeCategory = creationModal.activeCategory || EntityType.ITEM;
  const activeFolder = creationModal.targetFolder || '';
  
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [internalName, setInternalName] = useState('');
  const [textureData, setTextureData] = useState<string | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);

  const templates = TEMPLATES_BY_CATEGORY[activeCategory] || [];
  const currentTemplateData = templates.find(t => t.id === selectedTemplate);

  const handleCreate = () => {
    if (!internalName.trim()) {
      toast.error("Class name is required");
      return;
    }
    if (!activeWorkspaceId || !selectedTemplate || !activeCategory) return;

    addEntity(activeWorkspaceId, {
      type: activeCategory, // Garante que a categoria está sendo passada!
      category: activeCategory,
      internalName: internalName,
      folder: activeFolder,
      template: selectedTemplate,
      texture: textureData || undefined, 
      code: currentTemplateData?.getCode(internalName) 
    });

    expandToPath(activeCategory, activeFolder);
    toast.success(`${internalName} created!`);
    
    // Cleanup
    setInternalName('');
    setTextureData(null);
    
    if (isMobile) {
      closeCreationModal();
      if(onClose) onClose();
      setSidebarOpen(false); 
    }
  };

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTextureData(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // --- RENDERIZADORES ---

  const renderTemplateList = () => (
    <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
      {templates.map(t => (
        <button
          key={t.id}
          onClick={() => setSelectedTemplate(t.id)}
          className={`
            text-left p-3 rounded-xl border transition-all flex items-center gap-3 relative overflow-hidden
            ${selectedTemplate === t.id 
              ? 'bg-[#007acc]/10 border-[#007acc] ring-1 ring-[#007acc]' 
              : 'border-slate-200 dark:border-[#333] hover:border-slate-300 dark:hover:border-[#555] bg-white dark:bg-[#252526]'}
          `}
        >
          <div className={`p-2.5 rounded-lg shrink-0 ${selectedTemplate === t.id ? 'bg-[#007acc] text-white' : 'bg-slate-100 dark:bg-[#1e1e1e] text-slate-500'}`}>
            {t.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`text-xs font-bold ${selectedTemplate === t.id ? 'text-[#007acc] dark:text-sky-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {t.label}
            </h4>
            <p className="text-[10px] text-slate-500 truncate">{t.description}</p>
          </div>
          
          <div 
            onClick={(e) => { e.stopPropagation(); setSelectedTemplate(t.id); setShowCodePreview(true); }}
            className="p-2 text-slate-400 hover:text-[#007acc] hover:bg-slate-100 dark:hover:bg-[#333] rounded-full transition-colors"
          >
            <Eye className="w-4 h-4" />
          </div>
        </button>
      ))}
    </div>
  );

  const renderForm = () => {
    if (!selectedTemplate || !currentTemplateData) return null;

    return (
      <div className={`space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-300 ${isMobile ? 'mt-4' : ''}`}>
        <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Class Name</label>
            <div className="relative">
                <input 
                    autoFocus
                    value={internalName}
                    onChange={(e) => setInternalName(e.target.value.replace(/\s+/g, ''))}
                    placeholder={`e.g. My${currentTemplateData.label.split(' ')[0]}`}
                    className="w-full bg-slate-50 dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#007acc] transition-all"
                />
                <div className="absolute right-3 top-3 px-2 py-0.5 bg-slate-200 dark:bg-[#333] rounded text-[9px] font-mono text-slate-500">.js</div>
            </div>
        </div>

        {currentTemplateData.requiresTexture && (
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Texture Asset</label>
                <label className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-[#1e1e1e] border border-dashed border-slate-300 dark:border-[#444] rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-[#252526] transition-colors group">
                    <div className="w-12 h-12 bg-white dark:bg-[#252526] rounded-lg border border-slate-200 dark:border-[#333] flex items-center justify-center overflow-hidden">
                        {textureData ? (
                            <img src={textureData} className="w-full h-full object-contain pixelated" />
                        ) : (
                            <Upload className="w-5 h-5 text-slate-300 group-hover:text-[#007acc] transition-colors" />
                        )}
                    </div>
                    <div className="flex-1">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#007acc]">
                            {textureData ? 'Change Texture' : 'Upload PNG'}
                        </span>
                        <p className="text-[9px] text-slate-400">Max 32x32 recommended</p>
                    </div>
                    <input type="file" accept="image/png" className="hidden" onChange={handleTextureUpload} />
                </label>
            </div>
        )}

        <button 
            onClick={handleCreate}
            disabled={!internalName}
            className="w-full py-3 bg-[#007acc] hover:bg-[#0062a3] disabled:bg-slate-300 dark:disabled:bg-[#333] disabled:text-slate-400 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
            <Wand2 className="w-4 h-4" />
            Create Script
        </button>
      </div>
    );
  };

  if (showCodePreview && currentTemplateData) {
      return (
          <div className="absolute inset-0 bg-white dark:bg-[#1e1e1e] z-50 flex flex-col animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 dark:border-[#333] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-[#007acc]" />
                      <span className="text-xs font-bold dark:text-white">Code Preview: {currentTemplateData.label}</span>
                  </div>
                  <button onClick={() => setShowCodePreview(false)} className="text-xs text-slate-500 font-bold hover:text-slate-900 dark:hover:text-white">CLOSE</button>
              </div>
              <div className="flex-1 p-4 overflow-auto bg-slate-50 dark:bg-[#1e1e1e] font-mono text-[10px] text-slate-600 dark:text-slate-300 whitespace-pre">
                  {currentTemplateData.getCode(internalName || 'MyItem')}
              </div>
          </div>
      );
  }

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'px-1' : 'max-w-4xl mx-auto p-8 w-full'}`}>
      {!isMobile && (
         <div className="mb-8 flex items-center gap-4">
             <div className="p-3 bg-[#007acc] rounded-xl shadow-lg shadow-blue-500/20">
                 <Terminal className="w-6 h-6 text-white" />
             </div>
             <div>
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">New {activeCategory}</h2>
                 <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    Location: {activeFolder || 'Root'}
                 </p>
             </div>
         </div>
      )}

      {!isMobile && selectedTemplate ? (
          renderForm()
      ) : (
          <>
            {isMobile && <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Select Template</h3>}
            {renderTemplateList()}
            {isMobile && selectedTemplate && (
                <>
                    <div className="h-px bg-slate-200 dark:bg-[#333] my-6" />
                    {renderForm()}
                </>
            )}
          </>
      )}
    </div>
  );
};

export default CreationPanel;