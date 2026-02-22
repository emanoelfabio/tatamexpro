
import React, { useState, useEffect, useRef } from 'react';
import { OFFICIAL_CURRICULUM } from '../constants';

interface TrainingPlanProps {
  onBack: () => void;
}

interface LessonOverride {
  [id: number]: string;
}

interface DeletedLesson {
  id: number;
  title: string;
  weekIndex: number;
}

interface Technique {
  id: string;
  name: string;
  description: string;
  category: string;
  modality: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  videoUrl?: string;
  isFavorite: boolean;
}

const TrainingPlan: React.FC<TrainingPlanProps> = ({ onBack }) => {
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [lessonOverrides, setLessonOverrides] = useState<LessonOverride>({});
  const [deletedLessons, setDeletedLessons] = useState<DeletedLesson[]>([]);
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [addedTechniques, setAddedTechniques] = useState<{lessonId: number, techniqueId: string}[]>([]);
  const [editingLesson, setEditingLesson] = useState<{ id: number, title: string } | null>(null);
  const [tempTitle, setTempTitle] = useState("");
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [showAddTechnique, setShowAddTechnique] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedProgress = localStorage.getItem('hjp_completed_lessons');
    if (savedProgress) try { setCompletedLessons(JSON.parse(savedProgress)); } catch (e) {}
    const savedOverrides = localStorage.getItem('hjp_lesson_overrides');
    if (savedOverrides) try { setLessonOverrides(JSON.parse(savedOverrides)); } catch (e) {}
    const savedDeleted = localStorage.getItem('hjp_deleted_lessons');
    if (savedDeleted) try { setDeletedLessons(JSON.parse(savedDeleted)); } catch (e) {}
    
    const savedTechniques = localStorage.getItem('tatamex_techniques');
    if (savedTechniques) try { setTechniques(JSON.parse(savedTechniques)); } catch (e) {}
    
    const savedAdded = localStorage.getItem('hjp_added_techniques');
    if (savedAdded) try { setAddedTechniques(JSON.parse(savedAdded)); } catch (e) {}
  }, []);

  const toggleLesson = (id: number) => {
    const updated = completedLessons.includes(id) ? completedLessons.filter(lid => lid !== id) : [...completedLessons, id];
    setCompletedLessons(updated);
    localStorage.setItem('hjp_completed_lessons', JSON.stringify(updated));
  };

  const saveLessonOverride = (id: number, title: string) => {
    const updated = { ...lessonOverrides, [id]: title };
    setLessonOverrides(updated);
    localStorage.setItem('hjp_lesson_overrides', JSON.stringify(updated));
    setEditingLesson(null);
  };

  const deleteLesson = (id: number, title: string, weekIndex: number) => {
    const updated = [...deletedLessons, { id, title, weekIndex }];
    setDeletedLessons(updated);
    localStorage.setItem('hjp_deleted_lessons', JSON.stringify(updated));
    setShowDeleteConfirm(null);
  };

  const restoreLesson = (lesson: DeletedLesson) => {
    const updated = deletedLessons.filter(d => d.id !== lesson.id);
    setDeletedLessons(updated);
    localStorage.setItem('hjp_deleted_lessons', JSON.stringify(updated));
  };

  const isLessonDeleted = (id: number) => deletedLessons.some(d => d.id === id);

  const addTechniqueToLesson = (lessonId: number, technique: Technique) => {
    const newAdded = [...addedTechniques, { lessonId, techniqueId: technique.id }];
    setAddedTechniques(newAdded);
    localStorage.setItem('hjp_added_techniques', JSON.stringify(newAdded));
    setShowAddTechnique(null);
  };

  const removeTechniqueFromLesson = (lessonId: number, techniqueId: string) => {
    const newAdded = addedTechniques.filter(t => !(t.lessonId === lessonId && t.techniqueId === techniqueId));
    setAddedTechniques(newAdded);
    localStorage.setItem('hjp_added_techniques', JSON.stringify(newAdded));
  };

  const getTechniquesForLesson = (lessonId: number) => {
    return addedTechniques
      .filter(t => t.lessonId === lessonId)
      .map(t => techniques.find(tech => tech.id === t.techniqueId))
      .filter(Boolean) as Technique[];
  };

  const currentWeekData = OFFICIAL_CURRICULUM[currentWeekIndex];
  const totalLessons = 60;
  const progressPercent = Math.round((completedLessons.length / totalLessons) * 100);
  
  const availableTechniques = techniques.filter(
    t => !addedTechniques.some(at => at.techniqueId === t.id)
  );

  return (
    <div className="flex-1 flex flex-col p-6 max-w-5xl mx-auto w-full animate-in slide-in-from-right duration-300 overflow-hidden bg-[#111111]">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors" title="Voltar">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-2xl font-black uppercase tracking-tight ml-2 text-[#F0F0F0]">Plano de Aula</h2>
        </div>
        <div className="text-right">
          <span className="block text-[10px] font-black text-[#D31D25] uppercase tracking-widest mb-1">Graduação</span>
          <span className="text-3xl font-black text-[#F0F0F0]">{progressPercent}%</span>
        </div>
      </div>

      <div className="w-full h-4 bg-zinc-900 rounded-full mb-8 border border-zinc-800 p-1 relative overflow-hidden">
        <div className="h-full bg-[#D31D25] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="lg:grid lg:grid-cols-12 lg:gap-8 flex-1 overflow-hidden">
        
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#1a1a1a] border border-zinc-900 rounded-2xl p-6 shadow-inner">
             <div className="text-center mb-6">
                <span className="block text-[10px] font-black text-[#D31D25] uppercase tracking-[0.3em] mb-2">Semana Atual</span>
                <span className="text-6xl font-black text-white">{currentWeekData.week} <span className="text-xl text-zinc-700">/ 20</span></span>
             </div>
             <div className="flex space-x-2">
                <button onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))} className="flex-1 py-3 bg-zinc-800 rounded-xl text-white font-bold disabled:opacity-30" disabled={currentWeekIndex === 0}>Anterior</button>
                <button onClick={() => setCurrentWeekIndex(Math.min(OFFICIAL_CURRICULUM.length - 1, currentWeekIndex + 1))} className="flex-1 py-3 bg-[#D31D25] rounded-xl text-white font-bold disabled:opacity-30" disabled={currentWeekIndex === OFFICIAL_CURRICULUM.length - 1}>Próxima</button>
             </div>
          </div>
          
          <div className="bg-[#1a1a1a] border border-zinc-900 rounded-2xl p-6 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C8A046]">⏱️ Estrutura Recomendada</h4>
            <ul className="space-y-2 text-zinc-400 text-xs font-bold uppercase">
              <li className="flex justify-between"><span>Aquecimento</span> <span>10m</span></li>
              <li className="flex justify-between"><span>Técnica</span> <span>20m</span></li>
              <li className="flex justify-between"><span>Luta / Rola</span> <span>25m</span></li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-8 overflow-y-auto no-scrollbar pb-20 mt-8 lg:mt-0">
          {deletedLessons.length > 0 && (
            <div className="mb-4 p-4 bg-red-900/20 border border-red-900 rounded-xl">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3">🗑️ Lições Excluídas</h4>
              <div className="space-y-2">
                {deletedLessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between bg-red-900/10 p-2 rounded-lg">
                    <span className="text-xs text-red-400">{lesson.title}</span>
                    <button onClick={() => restoreLesson(lesson)} className="text-xs text-red-400 hover:text-white underline">
                      Restaurar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            {currentWeekData.lessons.map((lesson) => {
              if (isLessonDeleted(lesson.id)) return null;
              const lessonTechniques = getTechniquesForLesson(lesson.id);
              return (
                <div key={lesson.id} className={`w-full flex flex-col p-6 rounded-2xl border-2 transition-all text-left group ${completedLessons.includes(lesson.id) ? 'bg-[#D31D25]/10 border-[#D31D25]' : 'bg-[#1a1a1a] border-zinc-900 hover:border-zinc-700'}`}>
                  <div className="flex items-center">
                    <button onClick={() => toggleLesson(lesson.id)} className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border-2 transition-all mr-6 ${completedLessons.includes(lesson.id) ? 'bg-[#D31D25] border-[#D31D25]' : 'border-zinc-700'}`}>
                        {completedLessons.includes(lesson.id) && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>
                    <div className="flex-1">
                      <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">Aula {lesson.id}</div>
                      <span className={`text-lg font-bold leading-tight ${completedLessons.includes(lesson.id) ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>{lessonOverrides[lesson.id] || lesson.title}</span>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button onClick={() => setShowAddTechnique(lesson.id)} className="p-2 text-zinc-600 hover:text-green-500 transition-colors" title="Adicionar técnica">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                      <button onClick={() => { setEditingLesson({ id: lesson.id, title: lessonOverrides[lesson.id] || lesson.title }); setTempTitle(lessonOverrides[lesson.id] || lesson.title); }} className="p-2 text-zinc-600 hover:text-yellow-500 transition-colors" title="Editar título">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => setShowDeleteConfirm(lesson.id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors" title="Excluir lição">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  {lessonTechniques.length > 0 && (
                    <div className="mt-3 pl-14 flex flex-wrap gap-1">
                      {lessonTechniques.map((tech) => tech && (
                        <div key={tech.id} className="flex items-center bg-green-900/20 border border-green-500/30 rounded-full px-2 py-1">
                          <span className="text-[10px] text-green-400">{tech.name}</span>
                          <button onClick={() => removeTechniqueFromLesson(lesson.id, tech.id)} className="ml-1 text-green-500 hover:text-red-400">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {editingLesson && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl p-6 space-y-4 border border-zinc-800">
            <h3 className="text-lg font-black uppercase text-white">Editar Aula</h3>
            <div>
              <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Título da Aula</label>
              <input ref={inputRef} type="text" value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white outline-none focus:border-[#D31D25]" placeholder="Digite o novo título..." />
            </div>
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setEditingLesson(null)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold uppercase text-xs text-white">Cancelar</button>
              <button onClick={() => saveLessonOverride(editingLesson.id, tempTitle)} className="flex-1 py-3 bg-[#D31D25] rounded-xl font-bold uppercase text-xs text-white">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl p-6 space-y-4 border border-red-900">
            <h3 className="text-lg font-black uppercase text-red-500">Excluir Aula?</h3>
            <p className="text-zinc-400 text-sm">Tem certeza que deseja excluir esta aula do currículo? Você pode restaurá-la depois.</p>
            <div className="flex space-x-3 pt-2">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold uppercase text-xs text-white">Cancelar</button>
              <button onClick={() => { const lesson = currentWeekData.lessons.find(l => l.id === showDeleteConfirm); if (lesson) deleteLesson(lesson.id, lesson.title, currentWeekIndex); }} className="flex-1 py-3 bg-red-600 rounded-xl font-bold uppercase text-xs text-white">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {showAddTechnique && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1a1a] w-full max-w-md rounded-2xl p-6 space-y-4 border border-green-900 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-black uppercase text-green-500">Adicionar Técnica</h3>
            <p className="text-zinc-400 text-xs">Selecione uma técnica da biblioteca para adicionar a esta aula:</p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {availableTechniques.length === 0 ? (
                <p className="text-zinc-500 text-sm text-center py-4">Todas as técnicas já foram adicionadas ou a biblioteca está vazia.</p>
              ) : (
                availableTechniques.map((tech) => (
                  <button key={tech.id} onClick={() => addTechniqueToLesson(showAddTechnique, tech)} className="w-full p-3 bg-zinc-800 rounded-xl text-left hover:bg-green-900/30 transition-colors">
                    <div className="font-bold text-white text-sm">{tech.name}</div>
                    <div className="text-[10px] text-zinc-500">{tech.category} • {tech.modality}</div>
                  </button>
                ))
              )}
            </div>
            <button onClick={() => setShowAddTechnique(null)} className="w-full py-3 bg-zinc-800 rounded-xl font-bold uppercase text-xs text-white">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingPlan;
