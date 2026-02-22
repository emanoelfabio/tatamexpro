
import React, { useState, useEffect } from 'react';
import { WorkoutConfig } from '../types';
import { PRESETS as DEFAULT_PRESETS } from '../constants';

interface ConfigProps {
  onBack: () => void;
  onStart: (config: WorkoutConfig) => void;
  onSavePreset: (config: WorkoutConfig, name: string) => void;
  initialValues: WorkoutConfig;
  customPresets: WorkoutConfig[];
}

const Config: React.FC<ConfigProps> = ({ onBack, onStart, onSavePreset, initialValues, customPresets }) => {
  const [config, setConfig] = useState<WorkoutConfig>(initialValues);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState(config.name);

  useEffect(() => {
    setConfig(prev => {
      const newRoundNames = [...prev.roundNames];
      if (newRoundNames.length < prev.rounds) {
        for (let i = newRoundNames.length; i < prev.rounds; i++) {
          newRoundNames.push(`Round ${i + 1}`);
        }
      } else if (newRoundNames.length > prev.rounds) {
        newRoundNames.splice(prev.rounds);
      }
      if (JSON.stringify(newRoundNames) !== JSON.stringify(prev.roundNames)) {
        return { ...prev, roundNames: newRoundNames };
      }
      return prev;
    });
  }, [config.rounds]);

  const handleToggle = (key: keyof Pick<WorkoutConfig, 'useSound' | 'useVibration'>) => {
    setConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: keyof WorkoutConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleRoundNameChange = (index: number, name: string) => {
    const newNames = [...config.roundNames];
    newNames[index] = name;
    setConfig(prev => ({ ...prev, roundNames: newNames }));
  };

  const handleSaveClick = () => {
    setPresetNameInput(config.name);
    setShowSaveModal(true);
  };

  const confirmSave = () => {
    if (presetNameInput.trim()) {
      onSavePreset(config, presetNameInput.trim());
      setShowSaveModal(false);
      setConfig(prev => ({ ...prev, name: presetNameInput.trim() }));
    }
  };

  const loadPreset = (preset: WorkoutConfig) => {
    setConfig({ ...preset });
    setShowLoadModal(false);
  };

  const isEditingCustom = config.id && config.id.startsWith('custom_');

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full animate-in slide-in-from-right duration-300 bg-tatame-white dark:bg-tatame-black">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-tatame-black dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-2xl font-black uppercase tracking-tight ml-2">Configurar</h2>
        </div>
        
        <div className="flex space-x-2">
          <button onClick={() => setShowLoadModal(true)} className="text-[10px] font-bold uppercase tracking-widest bg-zinc-200 dark:bg-zinc-800 px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 text-zinc-700 dark:text-zinc-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            <span>Carregar</span>
          </button>
          <button onClick={handleSaveClick} className={`text-[10px] font-bold uppercase tracking-widest px-3 py-2 rounded-lg transition-colors flex items-center space-x-1 ${isEditingCustom ? 'bg-tatame-red/20 text-tatame-red border border-tatame-red/50' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            <span>{isEditingCustom ? 'Atualizar' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 lg:grid lg:grid-cols-2 lg:gap-8 overflow-y-auto no-scrollbar pb-32">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Título da Sessão</label>
            <input type="text" value={config.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-tatame-black dark:text-tatame-white outline-none focus:border-tatame-red" />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Quantidade de Rounds</label>
            <div className="flex items-center space-x-4">
              <button onClick={() => handleChange('rounds', Math.max(1, config.rounds - 1))} className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl font-bold text-tatame-black dark:text-tatame-white">-</button>
              <span className="text-3xl font-black w-12 text-center text-tatame-black dark:text-tatame-white">{config.rounds}</span>
              <button onClick={() => handleChange('rounds', Math.min(20, config.rounds + 1))} className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xl font-bold text-tatame-black dark:text-tatame-white">+</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Treino (seg)</label>
              <input type="number" value={config.workTime} onChange={(e) => handleChange('workTime', parseInt(e.target.value) || 0)} className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-tatame-black dark:text-tatame-white outline-none focus:border-tatame-red" />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Descanso (seg)</label>
              <input type="number" value={config.restTime} onChange={(e) => handleChange('restTime', parseInt(e.target.value) || 0)} className="w-full bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-tatame-black dark:text-tatame-white outline-none focus:border-tatame-red" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => handleToggle('useSound')} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${config.useSound ? 'bg-tatame-red/10 border-tatame-red' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
               <span className="text-xl">🔊</span>
               <div className={`w-10 h-6 rounded-full relative ${config.useSound ? 'bg-tatame-red' : 'bg-zinc-300 dark:bg-zinc-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.useSound ? 'left-5' : 'left-1'}`} /></div>
             </button>
             <button onClick={() => handleToggle('useVibration')} className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-colors ${config.useVibration ? 'bg-tatame-red/10 border-tatame-red' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'}`}>
               <span className="text-xl">📳</span>
               <div className={`w-10 h-6 rounded-full relative ${config.useVibration ? 'bg-tatame-red' : 'bg-zinc-300 dark:bg-zinc-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${config.useVibration ? 'left-5' : 'left-1'}`} /></div>
             </button>
          </div>
        </div>

        <div className="mt-8 lg:mt-0 space-y-3 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-900 shadow-inner max-h-[400px] lg:max-h-full overflow-y-auto no-scrollbar">
          <label className="text-xs uppercase font-bold text-tatame-red tracking-wider sticky top-0 bg-white dark:bg-zinc-950 py-2">Exercícios por Round</label>
          <div className="space-y-2">
            {config.roundNames.map((name, index) => (
              <div key={index} className="flex items-center space-x-3 animate-in fade-in duration-300">
                <span className="text-zinc-400 font-bold text-sm w-6">{index + 1}º</span>
                <input type="text" value={name} onChange={(e) => handleRoundNameChange(index, e.target.value)} className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-tatame-black dark:text-tatame-white outline-none focus:border-tatame-red" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-tatame-white dark:from-tatame-black via-tatame-white dark:via-tatame-black to-transparent z-10 flex justify-center">
        <button onClick={() => onStart(config)} className="w-full max-w-lg py-5 bg-tatame-red hover:bg-[#b5181f] active:scale-95 transition-all rounded-2xl text-xl font-black uppercase tracking-widest text-white shadow-2xl">
          Iniciar HIIT
        </button>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 w-full max-w-sm rounded-3xl p-8 space-y-6 shadow-2xl">
            <h3 className="text-2xl font-black uppercase tracking-tight text-tatame-black dark:text-tatame-white">Salvar Aquecimento</h3>
            <input autoFocus type="text" value={presetNameInput} onChange={(e) => setPresetNameInput(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4 focus:border-tatame-red outline-none text-tatame-black dark:text-tatame-white" placeholder="Nome do preset..." />
            <div className="flex space-x-3">
              <button onClick={() => setShowSaveModal(false)} className="flex-1 py-4 bg-zinc-200 dark:bg-zinc-800 rounded-xl font-bold uppercase text-xs tracking-widest">Cancelar</button>
              <button onClick={confirmSave} className="flex-1 py-4 bg-tatame-red rounded-xl font-bold uppercase text-xs tracking-widest text-white">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-black uppercase tracking-tight">Escolher Aquecimento</h3>
              <button onClick={() => setShowLoadModal(false)} className="p-2 text-zinc-400 hover:text-tatame-black dark:hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Seus Aquecimentos</div>
              {customPresets.map(p => (
                <button key={p.id} onClick={() => loadPreset(p)} className="w-full text-left p-4 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
                  <div className="font-bold">{p.name}</div>
                  <div className="text-[10px] opacity-50 uppercase font-black">{p.rounds} Rounds • {p.workTime}s/{p.restTime}s</div>
                </button>
              ))}
              <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-4 mb-1">Padrão Conceito</div>
              {DEFAULT_PRESETS.map(p => (
                <button key={p.id} onClick={() => loadPreset(p)} className="w-full text-left p-4 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors">
                  <div className="font-bold">{p.emoji} {p.name}</div>
                  <div className="text-[10px] opacity-50 uppercase font-black">{p.rounds} Rounds • {p.workTime}s/{p.restTime}s</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Config;
