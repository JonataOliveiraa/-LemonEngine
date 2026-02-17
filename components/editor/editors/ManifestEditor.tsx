import React, { useState } from 'react';
import { Workspace, Author } from '../../../types';
import { useEditorStore } from '../../../store';
import { Code, User, Globe, RefreshCw, Plus, Trash2, Upload, Link as LinkIcon, ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface Props {
  workspace: Workspace;
  type: 'settings' | 'id';
}

const ManifestEditor: React.FC<Props> = ({ workspace }) => {
  const { updateWorkspace } = useEditorStore();
  
  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [newAuthor, setNewAuthor] = useState<Author>({
      name: '',
      file: '', 
      icon_height: 70,
      color: '#007acc',
      link: ''
  });

  const handleUpdate = (field: keyof Workspace, value: any) => {
    updateWorkspace(workspace.id, { [field]: value });
  };

  const handleRegenerateGuid = () => {
    const newGuid = uuidv4();
    handleUpdate('settingsGuid', newGuid);
    toast.success("New GUID Generated");
  };

  const handleAuthorChange = (index: number, field: keyof Author, value: any) => {
    const updatedAuthors = [...workspace.authors];
    updatedAuthors[index] = { ...updatedAuthors[index], [field]: value };
    handleUpdate('authors', updatedAuthors);
  };

  const handleRemoveAuthor = (index: number) => {
    const updatedAuthors = workspace.authors.filter((_, i) => i !== index);
    handleUpdate('authors', updatedAuthors);
  };

  const handleAddAuthor = () => {
    if (!newAuthor.name) return toast.error("Author name required");
    handleUpdate('authors', [...workspace.authors, newAuthor]);
    setNewAuthor({ name: '', file: '', icon_height: 70, color: '#007acc', link: '' });
    setIsAddingAuthor(false);
    toast.success("Author added");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isWorkspaceIcon: boolean, authorIndex?: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isWorkspaceIcon) {
            handleUpdate('icon', result);
            toast.success("Mod Icon Updated");
        } else if (authorIndex !== undefined) {
            handleAuthorChange(authorIndex, 'file', result);
        } else {
            setNewAuthor(prev => ({ ...prev, file: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const settingsJson = {
    packStructureVersion: 30,
    title: workspace.name,
    guid: workspace.settingsGuid,
    authors: workspace.authors.map(a => ({
        name: a.name,
        file: a.file ? "avatar.png" : "",
        icon_height: a.icon_height,
        color: a.color,
        link: a.link
    })),
    version: workspace.version
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 p-4 md:p-8 h-auto lg:h-full flex flex-col">
      
      {/* HEADER: Mod Identity */}
      <div className="bg-slate-50 dark:bg-[#252526] p-6 rounded-2xl border border-slate-200 dark:border-[#333] shadow-sm flex flex-col md:flex-row items-center gap-6 shrink-0">
        <div className="relative group shrink-0">
            <div className="w-24 h-24 bg-white dark:bg-[#1e1e1e] rounded-2xl border-2 border-dashed border-slate-300 dark:border-[#444] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#007acc] transition-colors shadow-inner">
                {workspace.icon ? (
                    <img src={workspace.icon} className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon className="w-8 h-8 text-slate-300" />
                )}
                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, true)} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#007acc] p-1.5 rounded-lg shadow-lg pointer-events-none">
                <Upload className="w-3 h-3 text-white" />
            </div>
        </div>
        
        <div className="flex-1 w-full space-y-4">
            <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mod Title</label>
                <input 
                    value={workspace.name}
                    onChange={(e) => handleUpdate('name', e.target.value)}
                    className="w-full bg-transparent text-2xl md:text-3xl font-black text-slate-900 dark:text-white border-b-2 border-transparent focus:border-[#007acc] outline-none transition-all placeholder:text-slate-300"
                    placeholder="My Awesome Mod"
                />
            </div>
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[150px]">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal ID (Unique)</label>
                    <input 
                        value={workspace.internalId}
                        onChange={(e) => handleUpdate('internalId', e.target.value.replace(/\s+/g, ''))}
                        className="w-full bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 shadow-sm focus:border-[#007acc] outline-none"
                    />
                </div>
                <div className="w-24">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Version</label>
                    <input 
                        type="number"
                        value={workspace.version}
                        onChange={(e) => handleUpdate('version', parseInt(e.target.value))}
                        className="w-full bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-lg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 text-center shadow-sm focus:border-[#007acc] outline-none"
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:flex-1 lg:min-h-0">
          
          {/* LEFT COLUMN: Settings & Logic */}
          <div className="flex flex-col gap-8 lg:min-h-0">
              {/* GUID Section */}
              <section className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-xl overflow-hidden shrink-0">
                  <div className="p-4 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333] flex justify-between items-center">
                      <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <Globe className="w-4 h-4" /> Global Unique ID
                      </h3>
                      <button onClick={handleRegenerateGuid} className="flex items-center gap-1 text-[10px] font-bold text-[#007acc] hover:underline">
                          <RefreshCw className="w-3 h-3" /> Regenerate
                      </button>
                  </div>
                  <div className="p-6">
                      <div className="bg-slate-100 dark:bg-[#252526] p-3 rounded-lg font-mono text-xs text-slate-500 break-all border border-slate-200 dark:border-[#333] select-all flex items-center justify-between group">
                          <span>{workspace.settingsGuid}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 italic">Unique identifier for mod browser & save compatibility.</p>
                  </div>
              </section>

              {/* AUTHORS Section */}
              <section className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-xl overflow-hidden flex flex-col lg:flex-1 lg:min-h-0">
                  <div className="p-4 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333] flex justify-between items-center shrink-0">
                      <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-600 dark:text-slate-300">
                          <User className="w-4 h-4" /> Authors ({workspace.authors.length})
                      </h3>
                      <button 
                        onClick={() => setIsAddingAuthor(!isAddingAuthor)} 
                        className={`p-1.5 rounded-lg transition-colors ${isAddingAuthor ? 'bg-rose-100 text-rose-500' : 'bg-slate-200 dark:bg-[#333] text-slate-500 hover:text-[#007acc]'}`}
                      >
                          {isAddingAuthor ? <Trash2 className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      </button>
                  </div>
                  
                  <div className="p-4 space-y-4 lg:flex-1 flex flex-col lg:min-h-0">
                      {/* ADD AUTHOR FORM - FIXED */}
                      {isAddingAuthor && (
                          <div className="p-4 bg-slate-50 dark:bg-[#252526] rounded-xl border-2 border-dashed border-slate-200 dark:border-[#333] space-y-3 animate-in fade-in slide-in-from-top-2 shrink-0">
                              <div className="flex gap-3">
                                  {/* Avatar Wrapper */}
                                  <div className="relative w-10 h-10 shrink-0 bg-white dark:bg-[#333] rounded-full overflow-hidden border border-slate-200 dark:border-[#444] group cursor-pointer hover:border-[#007acc]">
                                      {newAuthor.file ? <img src={newAuthor.file} className="w-full h-full object-cover" /> : <User className="w-5 h-5 m-auto mt-2 text-slate-300" />}
                                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, false)} />
                                  </div>
                                  
                                  {/* Inputs Wrapper - ADICIONADO min-w-0 para evitar estouro em Flex */}
                                  <div className="flex-1 space-y-2 min-w-0">
                                      <input 
                                        placeholder="Author Name" 
                                        className="w-full bg-white dark:bg-[#1e1e1e] px-2 py-1.5 rounded text-xs font-bold border border-slate-200 dark:border-[#444] focus:border-[#007acc] outline-none"
                                        value={newAuthor.name}
                                        onChange={e => setNewAuthor({...newAuthor, name: e.target.value})}
                                      />
                                      <div className="flex items-center gap-2">
                                          {/* Custom Color Picker */}
                                          <div className="relative group/picker shrink-0" title="Author Color">
                                              <div 
                                                className="w-6 h-6 rounded-full border border-slate-200 dark:border-[#444] shadow-sm cursor-pointer" 
                                                style={{ backgroundColor: newAuthor.color }} 
                                              />
                                              <input 
                                                type="color" 
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                                                value={newAuthor.color} 
                                                onChange={e => setNewAuthor({...newAuthor, color: e.target.value})} 
                                              />
                                          </div>
                                          
                                          {/* Link Input - Corrigido: flex-1 + min-w-0 remove necessidade de w-[80%] */}
                                          <input 
                                            placeholder="Link (Discord/Site)" 
                                            className="flex-1 min-w-0 bg-white dark:bg-[#1e1e1e] px-2 py-1.5 rounded text-xs border border-slate-200 dark:border-[#444] focus:border-[#007acc] outline-none text-slate-500"
                                            value={newAuthor.link}
                                            onChange={e => setNewAuthor({...newAuthor, link: e.target.value})}
                                          />
                                      </div>
                                  </div>
                              </div>
                              <button onClick={handleAddAuthor} className="w-full py-2 bg-[#007acc] text-white text-[10px] font-black uppercase rounded-lg hover:bg-[#0062a3] transition-colors shadow-sm">Add Author</button>
                          </div>
                      )}

                      {/* AUTHORS LIST */}
                      <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 lg:max-h-[none] max-h-[300px]">
                          {workspace.authors.map((author, idx) => (
                              <div key={idx} className="group flex items-start gap-3 p-3 bg-slate-50 dark:bg-[#252526] rounded-xl border border-slate-100 dark:border-[#333] hover:border-[#007acc] transition-all shadow-sm">
                                  <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-[#444] cursor-pointer hover:opacity-80">
                                      {author.file ? <img src={author.file} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-200 dark:bg-[#333] flex items-center justify-center text-[10px] font-bold text-slate-500">{author.name[0]?.toUpperCase()}</div>}
                                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, false, idx)} />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0 space-y-2">
                                      {/* Top Row: Name */}
                                      <div className="flex items-center">
                                          <input 
                                            value={author.name} 
                                            onChange={(e) => handleAuthorChange(idx, 'name', e.target.value)}
                                            className="bg-transparent font-bold text-sm text-slate-800 dark:text-white outline-none w-full border-b border-transparent focus:border-slate-200 hover:border-slate-200 transition-colors py-0.5"
                                            placeholder="Name"
                                          />
                                      </div>

                                      {/* Bottom Row: Color & Link */}
                                      <div className="flex items-center gap-2">
                                          <div className="relative shrink-0" title="Change Color">
                                              <div 
                                                className="w-4 h-4 rounded-full border border-slate-300 dark:border-[#555] shadow-sm cursor-pointer" 
                                                style={{ backgroundColor: author.color }} 
                                              />
                                              <input 
                                                type="color" 
                                                value={author.color} 
                                                onChange={(e) => handleAuthorChange(idx, 'color', e.target.value)} 
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                              />
                                          </div>
                                          
                                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                              <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                              <input 
                                                value={author.link}
                                                onChange={(e) => handleAuthorChange(idx, 'link', e.target.value)}
                                                className="bg-transparent text-[10px] text-slate-500 w-full outline-none border-b border-transparent focus:border-slate-200 hover:border-slate-200 transition-colors py-0.5"
                                                placeholder="https://..."
                                              />
                                          </div>
                                      </div>
                                  </div>

                                  <button onClick={() => handleRemoveAuthor(idx)} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          ))}
                          {workspace.authors.length === 0 && !isAddingAuthor && (
                              <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-xl">
                                  <User className="w-8 h-8 mb-2 opacity-50" />
                                  <p className="text-[10px] italic">No authors yet.</p>
                              </div>
                          )}
                      </div>
                  </div>
              </section>
          </div>

          {/* RIGHT COLUMN: JSON Preview */}
          <div className="flex flex-col h-full bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-xl overflow-hidden shadow-lg min-h-[400px]">
            <div className="p-4 bg-[#252526] border-b border-[#333] flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-[#007acc]" />
                  <span className="text-xs font-black text-white uppercase tracking-widest">Settings.json</span>
               </div>
               <button 
                onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(settingsJson, null, 4));
                    toast.success("JSON copied!");
                }}
                className="text-[9px] font-bold uppercase text-slate-400 hover:text-white transition-colors bg-[#333] px-2 py-1 rounded"
               >
                   Copy
               </button>
            </div>
            <div className="flex-1 p-6 overflow-auto custom-scrollbar bg-[#1e1e1e]">
              <pre className="font-mono text-[10px] sm:text-xs text-[#abb2bf] leading-relaxed whitespace-pre-wrap">
                {JSON.stringify(settingsJson, null, 4)}
              </pre>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ManifestEditor;