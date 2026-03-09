import React, { useState, useCallback } from 'react';
import { Workspace, Author } from '../../../types';
import { useEditorStore } from '../../../store';
import { Code, User, Globe, RefreshCw, Plus, Trash2, Upload, Link as LinkIcon, ImageIcon, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface Props {
  workspace: Workspace;
  // 'type' prop was unused – removed
}

const ManifestEditor: React.FC<Props> = ({ workspace }) => {
  const { updateWorkspace } = useEditorStore();

  const [isAddingAuthor, setIsAddingAuthor] = useState(false);
  const [newAuthor, setNewAuthor] = useState<Author & { avatarFilename?: string }>({
    name: '',
    file: '',          // data URL for preview
    avatarFilename: '', // actual file name to be used in manifest
    icon_height: 70,
    color: '#007acc',
    link: ''
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleUpdate = useCallback((field: keyof Workspace, value: any) => {
    updateWorkspace(workspace.id, { [field]: value });
  }, [workspace.id, updateWorkspace]);

  const handleRegenerateGuid = useCallback(() => {
    const newGuid = uuidv4();
    handleUpdate('settingsGuid', newGuid);
    toast.success('New GUID generated');
  }, [handleUpdate]);

  const handleAuthorChange = useCallback((index: number, field: keyof Author, value: any) => {
    const updatedAuthors = [...workspace.authors];
    updatedAuthors[index] = { ...updatedAuthors[index], [field]: value };
    handleUpdate('authors', updatedAuthors);
  }, [workspace.authors, handleUpdate]);

  const handleRemoveAuthor = useCallback((index: number) => {
    const updatedAuthors = workspace.authors.filter((_, i) => i !== index);
    handleUpdate('authors', updatedAuthors);
    toast.success('Author removed');
  }, [workspace.authors, handleUpdate]);

  const handleAddAuthor = useCallback(() => {
    if (!newAuthor.name.trim()) {
      toast.error('Author name is required');
      return;
    }
    // Ensure we have a filename if an image was uploaded
    const authorToAdd = {
      ...newAuthor,
      // If a file was uploaded but no filename was captured, generate one
      avatarFilename: newAuthor.avatarFilename || (newAuthor.file ? `avatar_${newAuthor.name.replace(/\s+/g, '_')}.png` : '')
    };
    handleUpdate('authors', [...workspace.authors, authorToAdd]);
    setNewAuthor({ name: '', file: '', avatarFilename: '', icon_height: 70, color: '#007acc', link: '' });
    setIsAddingAuthor(false);
    toast.success('Author added');
  }, [newAuthor, workspace.authors, handleUpdate]);

  // Unified image upload handler – stores both data URL for preview and the actual file name
  const handleImageUpload = useCallback((
    e: React.ChangeEvent<HTMLInputElement>,
    isWorkspaceIcon: boolean,
    authorIndex?: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const fileName = file.name; // e.g. "my_avatar.png"

      if (isWorkspaceIcon) {
        handleUpdate('icon', dataUrl);
        // Optionally store the icon filename if needed elsewhere
        toast.success('Mod icon updated');
      } else if (authorIndex !== undefined) {
        // Update existing author: keep data URL for preview, and store the file name separately
        const updatedAuthors = [...workspace.authors];
        updatedAuthors[authorIndex] = {
          ...updatedAuthors[authorIndex],
          file: dataUrl,
          avatarFilename: fileName
        };
        handleUpdate('authors', updatedAuthors);
        toast.success('Author avatar updated');
      } else {
        // New author being added
        setNewAuthor(prev => ({
          ...prev,
          file: dataUrl,
          avatarFilename: fileName
        }));
      }
    };
    reader.readAsDataURL(file);
  }, [workspace.authors, handleUpdate]);

  // Validate internal ID: only letters, numbers, underscore
  const handleInternalIdChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^a-zA-Z0-9_]/g, '');
    handleUpdate('internalId', sanitized);
  }, [handleUpdate]);

  // Prepare manifest JSON – now uses actual filenames instead of placeholder
  const settingsJson = {
    packStructureVersion: 30,
    title: workspace.name,
    guid: workspace.settingsGuid,
    authors: workspace.authors.map(a => ({
      name: a.name,
      file: a.avatarFilename || '', // use stored filename, fallback to empty
      icon_height: a.icon_height,
      color: a.color,
      link: a.link
    })),
    version: workspace.version
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(settingsJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'settings.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('settings.json downloaded');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24 p-4 md:p-8 h-auto lg:h-full flex flex-col">
      
      {/* HEADER: Mod Identity */}
      <div className="bg-slate-50 dark:bg-[#252526] p-6 rounded-lg border border-slate-200 dark:border-[#333] shadow-sm flex flex-col md:flex-row items-center gap-6 shrink-0">
        <div className="relative group shrink-0">
          <div className="w-24 h-24 bg-white dark:bg-[#1e1e1e] rounded-lg border-2 border-dashed border-slate-300 dark:border-[#444] flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#007acc] transition-colors shadow-inner">
            {workspace.icon ? (
              <img src={workspace.icon} alt="Mod icon" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-slate-300" />
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={(e) => handleImageUpload(e, true)}
              aria-label="Upload mod icon"
            />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-[#007acc] p-2 rounded-md shadow-lg pointer-events-none">
            <Upload className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <div className="flex-1 w-full space-y-4">
          <div>
            <label htmlFor="mod-title" className="text-[11px] font-righteous text-slate-400 uppercase tracking-widest ml-1">
              Mod Title
            </label>
            <input
              id="mod-title"
              value={workspace.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              className="w-full bg-transparent text-2xl md:text-3xl font-righteous text-slate-900 dark:text-white border-b-2 border-transparent focus:border-[#007acc] outline-none transition-all placeholder:text-slate-300 tracking-wide"
              placeholder="My Awesome Mod"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label htmlFor="internal-id" className="text-[11px] font-righteous text-slate-400 uppercase tracking-widest ml-1">
                Internal ID (alphanumeric + underscore)
              </label>
              <input
                id="internal-id"
                value={workspace.internalId}
                onChange={(e) => handleInternalIdChange(e.target.value)}
                className="w-full bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-md px-3 py-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 shadow-sm focus:border-[#007acc] outline-none"
              />
            </div>
            <div className="w-24">
              <label htmlFor="version" className="text-[11px] font-righteous text-slate-400 uppercase tracking-widest ml-1">
                Version
              </label>
              <input
                id="version"
                type="number"
                min="1"
                step="1"
                value={workspace.version}
                onChange={(e) => handleUpdate('version', parseInt(e.target.value) || 1)}
                className="w-full bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-md px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 text-center shadow-sm focus:border-[#007acc] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:flex-1 lg:min-h-0">
          
        {/* LEFT COLUMN: Settings & Logic */}
        <div className="flex flex-col gap-8 lg:min-h-0">
          {/* GUID Section */}
          <section className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-lg overflow-hidden shrink-0">
            <div className="p-4 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333] flex justify-between items-center">
              <h3 className="text-xs font-righteous uppercase tracking-widest flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Globe className="w-4 h-4" /> Global Unique ID
              </h3>
              <button
                onClick={handleRegenerateGuid}
                className="flex items-center gap-1 text-[11px] font-bold text-[#007acc] hover:underline p-2 min-h-[44px]"
                aria-label="Regenerate GUID"
              >
                <RefreshCw className="w-3 h-3" /> Regenerate
              </button>
            </div>
            <div className="p-6">
              <div className="bg-slate-100 dark:bg-[#252526] p-3 rounded-md font-mono text-xs text-slate-500 break-all border border-slate-200 dark:border-[#333] select-all flex items-center justify-between group">
                <span>{workspace.settingsGuid}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 italic">
                Unique identifier for mod browser & save compatibility.
              </p>
            </div>
          </section>

          {/* AUTHORS Section */}
          <section className="bg-white dark:bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-lg overflow-hidden flex flex-col lg:flex-1 lg:min-h-0">
            <div className="p-4 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-[#333] flex justify-between items-center shrink-0">
              <h3 className="text-xs font-righteous uppercase tracking-widest flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4" /> Authors ({workspace.authors.length})
              </h3>
              <button
                onClick={() => setIsAddingAuthor(!isAddingAuthor)}
                className={`p-2 min-h-[44px] min-w-[44px] rounded-md transition-colors ${
                  isAddingAuthor
                    ? 'bg-rose-100 text-rose-500'
                    : 'bg-slate-200 dark:bg-[#333] text-slate-500 hover:text-[#007acc]'
                }`}
                aria-label={isAddingAuthor ? 'Cancel adding author' : 'Add author'}
              >
                {isAddingAuthor ? <Trash2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </button>
            </div>

            <div className="p-4 space-y-4 lg:flex-1 flex flex-col lg:min-h-0">
              {/* ADD AUTHOR FORM */}
              {isAddingAuthor && (
                <div className="p-4 bg-slate-50 dark:bg-[#252526] rounded-lg border-2 border-dashed border-slate-200 dark:border-[#333] space-y-3 animate-in fade-in slide-in-from-top-2 shrink-0">
                  <div className="flex gap-3">
                    {/* Avatar Upload */}
                    <div className="relative w-12 h-12 shrink-0 bg-white dark:bg-[#333] rounded-full overflow-hidden border border-slate-200 dark:border-[#444] group cursor-pointer hover:border-[#007acc]">
                      {newAuthor.file ? (
                        <img src={newAuthor.file} alt="Author avatar preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 m-auto mt-3 text-slate-300" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleImageUpload(e, false)}
                        aria-label="Upload author avatar"
                      />
                    </div>

                    {/* Inputs */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <input
                        placeholder="Author Name"
                        className="w-full bg-white dark:bg-[#1e1e1e] px-3 py-2 rounded text-xs font-bold border border-slate-200 dark:border-[#444] focus:border-[#007acc] outline-none"
                        value={newAuthor.name}
                        onChange={e => setNewAuthor({ ...newAuthor, name: e.target.value })}
                      />
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Color Picker */}
                        <div className="relative group/picker shrink-0" title="Author Color">
                          <div
                            className="w-8 h-8 rounded-full border border-slate-200 dark:border-[#444] shadow-sm cursor-pointer"
                            style={{ backgroundColor: newAuthor.color }}
                          />
                          <input
                            type="color"
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            value={newAuthor.color}
                            onChange={e => setNewAuthor({ ...newAuthor, color: e.target.value })}
                            aria-label="Pick author color"
                          />
                        </div>

                        {/* Icon Height */}
                        <div className="flex items-center gap-1">
                          <label className="text-[10px] text-slate-400">Height:</label>
                          <input
                            type="number"
                            min="16"
                            max="256"
                            value={newAuthor.icon_height}
                            onChange={e => setNewAuthor({ ...newAuthor, icon_height: parseInt(e.target.value) || 70 })}
                            className="w-16 bg-white dark:bg-[#1e1e1e] px-2 py-1 rounded text-xs border border-slate-200 dark:border-[#444] focus:border-[#007acc] outline-none"
                          />
                        </div>

                        {/* Link */}
                        <input
                          placeholder="Link (Discord/Site)"
                          className="flex-1 min-w-[120px] bg-white dark:bg-[#1e1e1e] px-3 py-2 rounded text-xs border border-slate-200 dark:border-[#444] focus:border-[#007acc] outline-none text-slate-500"
                          value={newAuthor.link}
                          onChange={e => setNewAuthor({ ...newAuthor, link: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleAddAuthor}
                    className="w-full py-3 min-h-[44px] bg-[#007acc] text-white text-[11px] font-bold uppercase tracking-widest rounded-md hover:bg-[#0062a3] transition-colors shadow-sm"
                  >
                    Add Author
                  </button>
                </div>
              )}

              {/* AUTHORS LIST */}
              <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 lg:max-h-[none] max-h-[300px]">
                {workspace.authors.map((author, idx) => (
                  <div
                    key={idx}
                    className="group flex items-start gap-3 p-3 bg-slate-50 dark:bg-[#252526] rounded-lg border border-slate-100 dark:border-[#333] hover:border-[#007acc] transition-all shadow-sm"
                  >
                    {/* Avatar with upload */}
                    <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-[#444] cursor-pointer hover:opacity-80">
                      {author.file ? (
                        <img src={author.file} alt={author.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 dark:bg-[#333] flex items-center justify-center text-xs font-bold text-slate-500">
                          {author.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => handleImageUpload(e, false, idx)}
                        aria-label="Change author avatar"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Name */}
                      <input
                        value={author.name}
                        onChange={(e) => handleAuthorChange(idx, 'name', e.target.value)}
                        className="bg-transparent font-bold text-sm text-slate-800 dark:text-white outline-none w-full border-b border-transparent focus:border-slate-200 hover:border-slate-200 transition-colors py-0.5"
                        placeholder="Name"
                      />

                      {/* Color, Height, Link */}
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative shrink-0" title="Change Color">
                          <div
                            className="w-6 h-6 rounded-full border border-slate-300 dark:border-[#555] shadow-sm cursor-pointer"
                            style={{ backgroundColor: author.color }}
                          />
                          <input
                            type="color"
                            value={author.color}
                            onChange={(e) => handleAuthorChange(idx, 'color', e.target.value)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            aria-label="Change author color"
                          />
                        </div>

                        <div className="flex items-center gap-1">
                          <label className="text-[10px] text-slate-400">H:</label>
                          <input
                            type="number"
                            min="16"
                            max="256"
                            value={author.icon_height}
                            onChange={(e) => handleAuthorChange(idx, 'icon_height', parseInt(e.target.value) || 70)}
                            className="w-14 bg-transparent text-xs border-b border-transparent focus:border-slate-200 hover:border-slate-200 outline-none text-center"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <LinkIcon className="w-3 h-3 text-slate-400 shrink-0" />
                          <input
                            value={author.link}
                            onChange={(e) => handleAuthorChange(idx, 'link', e.target.value)}
                            className="bg-transparent text-[11px] text-slate-500 w-full outline-none border-b border-transparent focus:border-slate-200 hover:border-slate-200 transition-colors py-0.5"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      {/* Display filename (read-only, for reference) */}
                      {(author as any).avatarFilename && (
                        <div className="text-[9px] text-slate-400 truncate">
                          File: {(author as any).avatarFilename}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleRemoveAuthor(idx)}
                      className="opacity-0 group-hover:opacity-100 p-2 min-h-[44px] min-w-[44px] text-slate-400 hover:text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md"
                      aria-label="Remove author"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {workspace.authors.length === 0 && !isAddingAuthor && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-200 dark:border-[#333] rounded-lg">
                    <User className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-[11px] italic">No authors yet.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: JSON Preview */}
        <div className="flex flex-col h-full bg-[#1e1e1e] border border-slate-200 dark:border-[#333] rounded-lg overflow-hidden shadow-lg min-h-[400px] lg:min-h-0">
          <div className="p-4 bg-[#252526] border-b border-[#333] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-[#007acc]" />
              <span className="text-sm font-righteous text-white uppercase tracking-widest">settings.json</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={downloadJson}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-[#333] px-3 py-2 min-h-[44px] rounded-md flex items-center gap-1"
                aria-label="Download JSON"
              >
                <Download className="w-3 h-3" /> Download
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(settingsJson, null, 2));
                  toast.success('JSON copied!');
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors bg-[#333] px-3 py-2 min-h-[44px] rounded-md"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-auto custom-scrollbar bg-[#1e1e1e]">
            <pre className="font-mono text-[11px] sm:text-xs text-[#abb2bf] leading-relaxed whitespace-pre-wrap">
              {JSON.stringify(settingsJson, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManifestEditor;