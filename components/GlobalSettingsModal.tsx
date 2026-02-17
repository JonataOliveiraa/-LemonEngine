import React, { useState } from 'react';
import { useEditorStore } from '@/store';
import { X, Moon, Sun, User, Settings as SettingsIcon, Monitor, Save, Smartphone, AlignLeft, Type } from 'lucide-react';

const GlobalSettingsModal: React.FC = () => {
  const { 
    isGlobalSettingsOpen, 
    setGlobalSettingsOpen, 
    theme, 
    setTheme, 
    userProfile, 
    setUserProfile 
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'general' | 'editor'>('general');

  if (!isGlobalSettingsOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-[#333] animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] md:max-h-[80vh]">
        
        {/* Header */}
        <div className="p-4 md:p-5 border-b border-slate-200 dark:border-[#333] flex justify-between items-center bg-slate-50 dark:bg-[#252526] shrink-0">
          <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-slate-800 dark:text-white">
            <SettingsIcon className="w-4 h-4" /> Configuration
          </h2>
          <button 
            onClick={() => setGlobalSettingsOpen(false)} 
            className="p-2 hover:bg-slate-200 dark:hover:bg-[#333] rounded-full transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Layout: Coluna no Mobile, Linha no Desktop */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            
            {/* Sidebar / Tabs */}
            <aside className="w-full md:w-48 bg-slate-50 dark:bg-[#252526] border-b md:border-b-0 md:border-r border-slate-200 dark:border-[#333] p-2 md:p-3 flex md:flex-col gap-2 shrink-0 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`flex-1 md:flex-none text-center md:text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'general' ? 'bg-[#007acc] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-[#333]'}`}
                >
                    General
                </button>
                <button 
                    onClick={() => setActiveTab('editor')}
                    className={`flex-1 md:flex-none text-center md:text-left px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all whitespace-nowrap ${activeTab === 'editor' ? 'bg-[#007acc] text-white shadow-md' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-[#333]'}`}
                >
                    Editor
                </button>
            </aside>

            {/* Content Area */}
            <main className="flex-1 p-5 md:p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-[#1e1e1e]">
                
                {/* --- GENERAL SETTINGS --- */}
                {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3.5 h-3.5" /> Identity
                            </h3>
                            <input 
                                type="text" 
                                value={userProfile.name}
                                onChange={(e) => setUserProfile({ name: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-[#252526] border border-slate-200 dark:border-[#333] rounded-lg px-4 py-3 text-sm font-bold focus:border-[#007acc] outline-none text-slate-900 dark:text-white transition-colors"
                                placeholder="Author Name"
                            />
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-[#333]" />

                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Sun className="w-3.5 h-3.5" /> Theme
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => setTheme('light')}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'bg-[#007acc]/10 border-[#007acc] text-[#007acc]' : 'bg-slate-50 dark:bg-[#252526] border-transparent text-slate-400'}`}
                                >
                                    <Sun className="w-4 h-4" /> Light
                                </button>
                                <button 
                                    onClick={() => setTheme('dark')}
                                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'bg-[#007acc]/10 border-[#007acc] text-[#007acc]' : 'bg-slate-50 dark:bg-[#252526] border-transparent text-slate-400'}`}
                                >
                                    <Moon className="w-4 h-4" /> Dark
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- EDITOR SETTINGS --- */}
                {activeTab === 'editor' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        {/* Font Size */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Monitor className="w-3.5 h-3.5" /> Font Size ({userProfile.editorFontSize}px)
                            </label>
                            <div className="flex items-center gap-4">
                                <span className="text-xs font-bold text-slate-400">10px</span>
                                <input 
                                    type="range" 
                                    min="10" 
                                    max="24" 
                                    step="1"
                                    value={userProfile.editorFontSize}
                                    onChange={(e) => setUserProfile({ editorFontSize: Number(e.target.value) })}
                                    className="flex-1 h-2 bg-slate-200 dark:bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#007acc]"
                                />
                                <span className="text-xs font-bold text-slate-400">24px</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 dark:bg-[#333]" />

                        {/* Toggles */}
                        <div className="space-y-4">
                            {/* Word Wrap */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#252526] rounded-xl">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-white">
                                        <AlignLeft className="w-4 h-4 text-purple-500" /> Word Wrap
                                    </div>
                                    <p className="text-[10px] text-slate-400">Break long lines</p>
                                </div>
                                <button 
                                    onClick={() => setUserProfile({ wordWrap: !userProfile.wordWrap })}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${userProfile.wordWrap ? 'bg-purple-500' : 'bg-slate-300 dark:bg-[#444]'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${userProfile.wordWrap ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>

                            {/* Auto Save */}
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#252526] rounded-xl">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-white">
                                        <Save className="w-4 h-4 text-[#007acc]" /> Auto-Save
                                    </div>
                                    <p className="text-[10px] text-slate-400">Save every 1.5s</p>
                                </div>
                                <button 
                                    onClick={() => setUserProfile({ autoSave: !userProfile.autoSave })}
                                    className={`w-10 h-6 rounded-full relative transition-colors ${userProfile.autoSave ? 'bg-[#007acc]' : 'bg-slate-300 dark:bg-[#444]'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${userProfile.autoSave ? 'left-5' : 'left-1'}`} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
      </div>
    </div>
  );
};

export default GlobalSettingsModal;