
import React from 'react';
import { ModEntity, EntityType } from '../../types';
import { useEditorStore } from '../../store';
// Added missing Ghost and Target icons from lucide-react
import { Zap, ShieldCheck, Swords, Sword, FileSearch, CheckCircle2, AlertCircle, FolderTree, X, Code2, Heart, Shield, FileText, Ghost, Target } from 'lucide-react';

interface Props {
  entity?: ModEntity;
}

const PropertiesPanel: React.FC<Props> = ({ entity }) => {
  const { setPropertiesOpen } = useEditorStore();

  const getImageSrc = (texture?: string) => {
    if (!texture) return null;
    if (texture.startsWith('assets/') || texture.startsWith('/') || texture.startsWith('http')) return texture;
    return `data:image/png;base64,${texture}`;
  };

  const isHealthy = entity && entity.internalName !== '';
  const hooksList = entity ? Object.keys(entity.hooks) : [];

  const renderTypeStats = () => {
    if (!entity) return null;
    if (entity.type === EntityType.ITEM) {
        return (
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Damage</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{entity.properties.damage || 0}</p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[8px] font-black text-slate-400 uppercase">Use Time</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{entity.properties.useTime || 0}</p>
                </div>
            </div>
        );
    }
    if (entity.type === EntityType.NPC) {
        return (
            <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-800">
                    <div className="flex items-center gap-1.5 mb-1 text-emerald-600 dark:text-emerald-400">
                        <Heart className="w-3 h-3" />
                        <p className="text-[8px] font-black uppercase">Life</p>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{entity.properties.lifeMax || 200}</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="flex items-center gap-1.5 mb-1 text-blue-600 dark:text-blue-400">
                        <Shield className="w-3 h-3" />
                        <p className="text-[8px] font-black uppercase">Armor</p>
                    </div>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{entity.properties.defense || 0}</p>
                </div>
            </div>
        );
    }
    return null;
  };

  const getBaseClass = () => {
    switch(entity?.type) {
      case EntityType.NPC: return 'ModNPC';
      case EntityType.PROJECTILE: return 'ModProjectile';
      case EntityType.BLANK: return 'Module';
      default: return 'ModItem';
    }
  };

  const getEntityIcon = () => {
    switch(entity?.type) {
      case EntityType.NPC: return <Ghost className="w-6 h-6 text-slate-200 dark:text-slate-700" />;
      case EntityType.PROJECTILE: return <Target className="w-6 h-6 text-slate-200 dark:text-slate-700" />;
      case EntityType.BLANK: return <FileText className="w-6 h-6 text-slate-200 dark:text-slate-700" />;
      default: return <Sword className="w-6 h-6 text-slate-200 dark:text-slate-700" />;
    }
  };

  return (
    <aside className="h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden z-[55] relative shadow-xl animate-in slide-in-from-right duration-300 transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
        <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          Entity Inspector
        </h3>
        <button onClick={() => setPropertiesOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X className="w-4 h-4" /></button>
      </div>

      {entity ? (
        <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${isHealthy ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-400'}`}>
              {isHealthy ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-[9px] font-black uppercase tracking-widest">{entity.type} MODULE</span>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4 shadow-inner">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                 {entity.texture ? (
                   <img src={getImageSrc(entity.texture) || ''} className="w-10 h-10 object-contain pixelated" alt="Icon" />
                 ) : ( getEntityIcon() )}
              </div>
              <div className="text-center">
                <h4 className="font-black text-slate-900 dark:text-white text-sm tracking-tighter">{entity.displayName}</h4>
                <p className="text-[8px] text-slate-400 dark:text-slate-500 font-mono font-bold mt-1 uppercase bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-700 inline-block tracking-tighter">
                    {entity.internalName}
                </p>
              </div>
            </div>

            {renderTypeStats()}

            <div className="space-y-4">
               <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                 <FolderTree className="w-3.5 h-3.5 opacity-60" /> Inheritance Tree
               </h5>
               <div className="space-y-1 font-mono text-[10px] font-bold">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600 opacity-50">Terraria.{entity.type === EntityType.NPC ? 'NPC' : 'Item'}</div>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 opacity-70 ml-3 border-l border-slate-100 pl-3">TL.{getBaseClass()}</div>
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white ml-6 border-l border-slate-200 dark:border-slate-700 pl-3">{entity.internalName}</div>
               </div>
            </div>

            <div className="space-y-3">
               <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                 <ShieldCheck className="w-3.5 h-3.5 opacity-60" /> Logic State
               </h5>
               <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                      <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-slate-200">
                        {entity.type === EntityType.BLANK ? 'Execution()' : 'SetDefaults()'}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  {hooksList.map(hook => (
                    <div key={hook} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 rounded-xl shadow-sm">
                        <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Code2 className="w-3 h-3 opacity-50" />{hook}()</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-300 dark:text-slate-700 space-y-5">
          <Swords className="w-10 h-10 opacity-20" />
          <p className="text-[10px] font-black uppercase tracking-widest">Focus Entity to Inspect</p>
        </div>
      )}
    </aside>
  );
};

export default PropertiesPanel;
