import React, { useState, useEffect } from 'react';
import { Screen } from '../types';

interface Activity {
  id: string;
  name: string;
  duration: number; // em minutos
  objectives: string;
  isFavorite: boolean;
}

interface LessonPlan {
  id: string;
  name: string;
  modality: string;
  activities: Activity[];
  createdAt: string;
  isFavorite: boolean;
}

interface LessonBuilderProps {
  onBack: () => void;
  onStartLesson: (plan: LessonPlan) => void;
}

const MODALITIES = ['Jiu-Jitsu', 'MMA', 'Judô', 'Luta Livre', 'Artes Marciais', 'Funcional', 'Kids'];

const LessonBuilder: React.FC<LessonBuilderProps> = ({ onBack, onStartLesson }) => {
  const [plans, setPlans] = useState<LessonPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<LessonPlan | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanModality, setNewPlanModality] = useState('Jiu-Jitsu');

  useEffect(() => {
    const saved = localStorage.getItem('tatamex_lesson_plans');
    if (saved) {
      setPlans(JSON.parse(saved));
    } else {
      // Planos de exemplo
      const examplePlans: LessonPlan[] = [
        {
          id: '1',
          name: 'Aquecimento Jiu-Jitsu',
          modality: 'Jiu-Jitsu',
          isFavorite: true,
          createdAt: new Date().toISOString(),
          activities: [
            { id: 'a1', name: 'Polichinelo', duration: 2, objectives: 'Elevar frequência cardíaca', isFavorite: false },
            { id: 'a2', name: 'Agachamento', duration: 3, objectives: 'Aquecimento membros inferiores', isFavorite: false },
            { id: 'a3', name: 'Shrimps', duration: 5, objectives: 'Movimento básico de defesa', isFavorite: false },
            { id: 'a4', name: 'Raspagem básica', duration: 5, objectives: 'Praticar raspagem da guarda', isFavorite: false },
          ]
        },
        {
          id: '2',
          name: 'Técnica de Finalização',
          modality: 'Jiu-Jitsu',
          isFavorite: true,
          createdAt: new Date().toISOString(),
          activities: [
            { id: 'a1', name: 'Mata-leão', duration: 10, objectives: 'Dominar a finalização', isFavorite: false },
            { id: 'a2', name: 'Triângulo', duration: 10, objectives: 'Posição e strangulamento', isFavorite: false },
            { id: 'a3', name: 'Americana', duration: 10, objectives: 'Controle e finalização', isFavorite: false },
          ]
        },
        {
          id: '3',
          name: 'Treino Kids',
          modality: 'Kids',
          isFavorite: false,
          createdAt: new Date().toISOString(),
          activities: [
            { id: 'a1', name: 'Jogos coordenativos', duration: 5, objectives: 'Desenvolvimento motor', isFavorite: false },
            { id: 'a2', name: 'Rolar cobra', duration: 3, objectives: 'Movimento básico', isFavorite: false },
            { id: 'a3', name: 'Chave de ombro', duration: 7, objectives: 'Primeira finalização', isFavorite: false },
            { id: 'a4', name: 'Luta orientada', duration: 10, objectives: 'Aplicar técnicas aprendidas', isFavorite: false },
          ]
        }
      ];
      setPlans(examplePlans);
      localStorage.setItem('tatamex_lesson_plans', JSON.stringify(examplePlans));
    }
  }, []);

  const savePlans = (newPlans: LessonPlan[]) => {
    setPlans(newPlans);
    localStorage.setItem('tatamex_lesson_plans', JSON.stringify(newPlans));
  };

  const createPlan = () => {
    if (!newPlanName.trim()) return;
    const newPlan: LessonPlan = {
      id: `plan_${Date.now()}`,
      name: newPlanName.trim(),
      modality: newPlanModality,
      activities: [],
      createdAt: new Date().toISOString(),
      isFavorite: false
    };
    savePlans([...plans, newPlan]);
    setNewPlanName('');
    setShowCreateModal(false);
    setSelectedPlan(newPlan);
  };

  const addActivity = (planId: string, activity: Activity) => {
    const newPlans = plans.map(p => {
      if (p.id === planId) {
        return { ...p, activities: [...p.activities, activity] };
      }
      return p;
    });
    savePlans(newPlans);
    setEditingActivity(null);
  };

  const updateActivity = (planId: string, activity: Activity) => {
    const newPlans = plans.map(p => {
      if (p.id === planId) {
        const newActivities = p.activities.map(a => a.id === activity.id ? activity : a);
        return { ...p, activities: newActivities };
      }
      return p;
    });
    savePlans(newPlans);
    setEditingActivity(null);
  };

  const deleteActivity = (planId: string, activityId: string) => {
    const newPlans = plans.map(p => {
      if (p.id === planId) {
        return { ...p, activities: p.activities.filter(a => a.id !== activityId) };
      }
      return p;
    });
    savePlans(newPlans);
  };

  const togglePlanFavorite = (planId: string) => {
    const newPlans = plans.map(p => {
      if (p.id === planId) {
        return { ...p, isFavorite: !p.isFavorite };
      }
      return p;
    });
    savePlans(newPlans);
  };

  const deletePlan = (planId: string) => {
    if (confirm('Tem certeza que deseja excluir este plano?')) {
      savePlans(plans.filter(p => p.id !== planId));
      if (selectedPlan?.id === planId) setSelectedPlan(null);
    }
  };

  const getTotalDuration = (activities: Activity[]) => {
    return activities.reduce((acc, a) => acc + a.duration, 0);
  };

  const favoritePlans = plans.filter(p => p.isFavorite);
  const otherPlans = plans.filter(p => !p.isFavorite);

  const ActivityEditor = ({ planId }: { planId: string }) => {
    const [name, setName] = useState(editingActivity?.name || '');
    const [duration, setDuration] = useState(editingActivity?.duration || 5);
    const [objectives, setObjectives] = useState(editingActivity?.objectives || '');

    const handleSave = () => {
      if (!name.trim()) return;
      if (editingActivity?.id) {
        updateActivity(planId, { ...editingActivity, name, duration, objectives });
      } else {
        addActivity(planId, {
          id: `act_${Date.now()}`,
          name,
          duration,
          objectives,
          isFavorite: false
        });
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-black uppercase text-tatame-black dark:text-tatame-white">
            {editingActivity ? 'Editar Atividade' : 'Nova Atividade'}
          </h3>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Nome da Atividade</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
              placeholder="Ex: Aquecimento, Técnica, Luta..."
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Duração (minutos)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Objetivos</label>
            <textarea
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red h-20 resize-none"
              placeholder="O que o aluno deve aprender nesta atividade..."
            />
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => setEditingActivity(null)}
              className="flex-1 py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl font-bold uppercase text-xs text-tatame-black dark:text-white"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-3 bg-tatame-red rounded-xl font-bold uppercase text-xs text-white"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (selectedPlan) {
    const totalDuration = getTotalDuration(selectedPlan.activities);
    return (
      <div className="flex-1 flex flex-col p-4 lg:p-6 max-w-5xl mx-auto w-full animate-in slide-in-from-right duration-300 overflow-hidden bg-tatame-white dark:bg-tatame-black">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => setSelectedPlan(null)} className="p-2 -ml-2 text-zinc-400 hover:text-tatame-red transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight text-tatame-black dark:text-tatame-white">{selectedPlan.name}</h2>
              <span className="text-xs font-bold text-zinc-500 uppercase">{selectedPlan.modality} • {totalDuration}min total</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => togglePlanFavorite(selectedPlan.id)}
              className={`p-2 rounded-lg transition-colors ${selectedPlan.isFavorite ? 'text-tatame-gold' : 'text-zinc-300'}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
            <button 
              onClick={() => onStartLesson(selectedPlan)}
              className="bg-tatame-red text-white px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-lg"
            >
              Iniciar Aula
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          <div className="space-y-3">
            {selectedPlan.activities.map((activity, index) => (
              <div key={activity.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border-2 border-zinc-100 dark:border-zinc-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-tatame-red text-white flex items-center justify-center font-black text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-tatame-black dark:text-tatame-white">{activity.name}</h4>
                      <p className="text-xs text-zinc-500">{activity.duration}min</p>
                      {activity.objectives && (
                        <p className="text-xs text-tatame-gold mt-1">🎯 {activity.objectives}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => setEditingActivity(activity)}
                      className="p-2 text-zinc-400 hover:text-tatame-gold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => deleteActivity(selectedPlan.id, activity.id)}
                      className="p-2 text-zinc-400 hover:text-tatame-red"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button 
              onClick={() => setEditingActivity({ id: '', name: '', duration: 5, objectives: '', isFavorite: false } as Activity)}
              className="w-full py-4 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-400 font-bold text-sm hover:border-tatame-red hover:text-tatame-red transition-colors"
            >
              + Adicionar Atividade
            </button>
          </div>
        </div>

        {editingActivity && <ActivityEditor planId={selectedPlan.id} />}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-6 max-w-5xl mx-auto w-full animate-in slide-in-from-right duration-300 overflow-hidden bg-tatame-white dark:bg-tatame-black">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-tatame-red transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tight ml-2 text-tatame-black dark:text-tatame-white">
            📋 Biblioteca de Planos
          </h2>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-tatame-red text-white px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-lg active:scale-95 transition-transform"
        >
          + Novo Plano
        </button>
      </div>

      {/* Favoritos */}
      {favoritePlans.length > 0 && (
        <div className="mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-tatame-gold mb-3">⭐ Favoritos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {favoritePlans.map(plan => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className="bg-white dark:bg-zinc-900 rounded-xl p-4 border-2 border-tatame-gold/30 text-left hover:border-tatame-gold transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-tatame-black dark:text-tatame-white">{plan.name}</h4>
                    <span className="text-[10px] text-zinc-500 uppercase">{plan.modality}</span>
                  </div>
                  <span className="text-xs font-bold text-tatame-gold">{getTotalDuration(plan.activities)}min</span>
                </div>
                <div className="mt-2 text-[10px] text-zinc-400">{plan.activities.length} atividades</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Todos os Planos */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-tatame-red mb-3">Todos os Planos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {otherPlans.map(plan => (
            <div
              key={plan.id}
              className="bg-white dark:bg-zinc-900 rounded-xl p-4 border-2 border-zinc-100 dark:border-zinc-800 hover:border-tatame-red/30 transition-all"
            >
              <div className="flex justify-between items-start">
                <button onClick={() => setSelectedPlan(plan)} className="text-left flex-1">
                  <h4 className="font-black text-tatame-black dark:text-tatame-white">{plan.name}</h4>
                  <span className="text-[10px] text-zinc-500 uppercase">{plan.modality}</span>
                </button>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => togglePlanFavorite(plan.id)}
                    className="p-1 text-zinc-300 hover:text-tatame-gold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => deletePlan(plan.id)}
                    className="p-1 text-zinc-300 hover:text-tatame-red"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-zinc-400">
                <span>{plan.activities.length} atividades</span>
                <span className="font-bold text-tatame-black dark:text-white">{getTotalDuration(plan.activities)}min</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Criar Plano */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-black uppercase text-tatame-black dark:text-tatame-white">Criar Novo Plano</h3>
            <div>
              <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Nome do Plano</label>
              <input
                type="text"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
                placeholder="Ex: Aula de Técnicas"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Modalidade</label>
              <select
                value={newPlanModality}
                onChange={(e) => setNewPlanModality(e.target.value)}
                className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
              >
                {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl font-bold uppercase text-xs text-tatame-black dark:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={createPlan}
                className="flex-1 py-3 bg-tatame-red rounded-xl font-bold uppercase text-xs text-white"
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonBuilder;
