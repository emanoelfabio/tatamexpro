
import React from 'react';
import { PRESETS as DEFAULT_PRESETS } from '../constants';
import { WorkoutConfig, Screen } from '../types';

interface PresetsProps {
  onBack: () => void;
  onSelect: (config: WorkoutConfig) => void;
  onEdit?: (config: WorkoutConfig) => void;
  customPresets?: WorkoutConfig[];
  onDeletePreset?: (id: string) => void;
  onNavigate?: (screen: Screen) => void;
}

const Presets: React.FC<PresetsProps> = ({ onBack, onSelect, onEdit, customPresets = [], onDeletePreset, onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full animate-in slide-in-from-right duration-300 bg-tatame-white dark:bg-tatame-black">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-tatame-black dark:hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight ml-2">Preparação</h2>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-12 pb-10">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-tatame-gold">Customização</h3>
          <button 
            onClick={() => onNavigate && onNavigate('CONFIG')}
            className="w-full text-left p-6 bg-zinc-100 dark:bg-zinc-900 border-2 border-dashed border-zinc-300 dark:border-zinc-800 hover:border-tatame-red rounded-2xl transition-all group active:scale-[0.98] shadow-sm max-w-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-2xl group-hover:rotate-45 transition-transform shadow-sm">⚙️</div>
                <div>
                  <span className="block text-[10px] uppercase font-black tracking-widest text-tatame-red">Modo Avançado</span>
                  <span className="block text-xl font-bold text-tatame-black dark:text-tatame-white uppercase tracking-tighter mt-1">Criar Drill Personalizado</span>
                </div>
              </div>
              <svg className="w-6 h-6 text-zinc-400 group-hover:text-tatame-red transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
        </div>

        {customPresets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-tatame-red">Seus Aquecimentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customPresets.map((preset) => (
                <div key={preset.id} className="relative group flex items-center bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 hover:border-tatame-red/50 rounded-2xl transition-all shadow-sm">
                  <button onClick={() => onSelect(preset)} className="flex-1 text-left p-5 transition-all active:scale-[0.99]">
                    <div className="font-bold text-lg mb-2 text-tatame-black dark:text-tatame-white">{preset.name}</div>
                    <div className="flex space-x-3">
                      <span className="text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">{preset.workTime}s / {preset.restTime}s</span>
                      <span className="text-[10px] font-black uppercase bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">{preset.rounds} Rounds</span>
                    </div>
                  </button>
                  <div className="flex items-center pr-3 space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button onClick={(e) => { e.stopPropagation(); onEdit(preset); }} className="p-2 text-zinc-400 hover:text-tatame-black dark:hover:text-white"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    )}
                    {onDeletePreset && (
                      <button onClick={(e) => { e.stopPropagation(); onDeletePreset(preset.id!); }} className="p-2 text-zinc-400 hover:text-tatame-red"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Padrão Conceito</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEFAULT_PRESETS.map((preset) => (
              <button key={preset.id} onClick={() => onSelect(preset)} className="w-full text-left p-6 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-800 hover:border-tatame-red rounded-2xl transition-all group active:scale-98 shadow-sm flex flex-col justify-between h-full">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{preset.emoji}</span>
                    <span className="text-xl font-bold group-hover:text-tatame-red transition-colors text-tatame-black dark:text-tatame-white">{preset.name}</span>
                  </div>
                  <p className="text-zinc-500 text-sm leading-snug">{preset.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  <div className="text-[10px] font-bold uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{preset.workTime}s Treino</div>
                  <div className="text-[10px] font-bold uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{preset.restTime}s Descanso</div>
                  <div className="text-[10px] font-bold uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">{preset.rounds} Rounds</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presets;
