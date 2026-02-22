import React, { useState, useEffect, useMemo } from 'react';

interface ClassData {
  id: string;
  name: string;
  modality: string;
  schedule: { day: number; time: string }[];
  students: { id: string; name: string }[];
  notes?: string;
}

interface MyClassesProps {
  onBack: () => void;
  onManagePresence: (classId?: string) => void;
}

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MODALITIES = ['Jiu-Jitsu', 'MMA', 'Judô', 'Luta Livre', 'Artes Marciais', 'Kids', 'Female', 'Competição'];

const MyClasses: React.FC<MyClassesProps> = ({ onBack, onManagePresence }) => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassData | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tatamex_my_classes');
    if (saved) {
      setClasses(JSON.parse(saved));
    } else {
      // Turmas de exemplo
      const exampleClasses: ClassData[] = [
        {
          id: '1',
          name: 'Juvenil',
          modality: 'Jiu-Jitsu',
          schedule: [
            { day: 1, time: '08:00' },
            { day: 3, time: '08:00' },
            { day: 5, time: '08:00' }
          ],
          students: [
            { id: 's1', name: 'Enzo R.' },
            { id: 's2', name: 'Luiz F.' },
            { id: 's3', name: 'Sophia M.' },
            { id: 's4', name: 'Lucas B.' }
          ],
          notes: 'Turma kids entre 7-12 anos. Foco em coordenação motora e divertimento.'
        },
        {
          id: '2',
          name: 'Adulto Iniciante',
          modality: 'Jiu-Jitsu',
          schedule: [
            { day: 2, time: '09:00' },
            { day: 4, time: '09:00' },
            { day: 6, time: '09:00' }
          ],
          students: [
            { id: 's5', name: 'Carlos M.' },
            { id: 's6', name: 'Roberto S.' },
            { id: 's7', name: 'Marcos T.' }
          ],
          notes: 'Iniciantes com até 1 ano de prática. Técnicas básicas.'
        },
        {
          id: '3',
          name: 'Adulto Avançado',
          modality: 'Jiu-Jitsu',
          schedule: [
            { day: 1, time: '10:00' },
            { day: 2, time: '10:00' },
            { day: 3, time: '10:00' },
            { day: 4, time: '10:00' },
            { day: 5, time: '10:00' }
          ],
          students: [
            { id: 's8', name: 'João S.' },
            { id: 's9', name: 'Pedro R.' },
            { id: 's10', name: 'Bruno K.' },
            { id: 's11', name: 'Lucas A.' },
            { id: 's12', name: 'Rafael B.' }
          ],
          notes: 'Turma de competição. Alta intensidade.'
        },
        {
          id: '4',
          name: 'Female',
          modality: 'Jiu-Jitsu',
          schedule: [
            { day: 2, time: '16:00' },
            { day: 4, time: '16:00' }
          ],
          students: [
            { id: 's13', name: 'Ana Paula' },
            { id: 's14', name: 'Carla S.' },
            { id: 's15', name: 'Mariana L.' }
          ],
          notes: 'Apenas mulheres. Ambiente seguro e acolhedor.'
        },
        {
          id: '5',
          name: 'Competição',
          modality: 'MMA',
          schedule: [
            { day: 1, time: '19:00' },
            { day: 3, time: '19:00' },
            { day: 5, time: '19:00' }
          ],
          students: [
            { id: 's16', name: 'Diego F.' },
            { id: 's17', name: 'Thiago H.' }
          ],
          notes: 'Preparação para competições de MMA.'
        },
      ];
      setClasses(exampleClasses);
      localStorage.setItem('tatamex_my_classes', JSON.stringify(exampleClasses));
    }
  }, []);

  const saveClasses = (newClasses: ClassData[]) => {
    setClasses(newClasses);
    localStorage.setItem('tatamex_my_classes', JSON.stringify(newClasses));
  };

  const createClass = () => {
    const newClass: ClassData = {
      id: '',
      name: '',
      modality: 'Jiu-Jitsu',
      schedule: [],
      students: []
    };
    setEditingClass(newClass);
    setShowEditModal(true);
  };

  const editClass = (cls: ClassData) => {
    setEditingClass(cls);
    setShowEditModal(true);
  };

  const saveClass = (savedClass: ClassData) => {
    const classWithId = { ...savedClass, id: savedClass.id || `class_${Date.now()}` };
    if (savedClass.id) {
      saveClasses(classes.map(c => c.id === savedClass.id ? classWithId : c));
    } else {
      saveClasses([...classes, classWithId]);
    }
    setShowEditModal(false);
    setEditingClass(null);
  };

  const deleteClass = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      saveClasses(classes.filter(c => c.id !== id));
      if (selectedClass?.id === id) setSelectedClass(null);
    }
  };

  const totalStudents = classes.reduce((acc, c) => acc + c.students.length, 0);
  const totalClassesPerWeek = classes.reduce((acc, c) => acc + c.schedule.length, 0);

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
            👥 Minhas Turmas
          </h2>
        </div>
        <button 
          onClick={createClass}
          className="bg-tatame-red text-white px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-lg"
        >
          + Nova Turma
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center">
          <span className="block text-2xl font-black text-tatame-black dark:text-white">{classes.length}</span>
          <span className="text-[10px] uppercase text-zinc-500">Turmas</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center">
          <span className="block text-2xl font-black text-tatame-black dark:text-white">{totalStudents}</span>
          <span className="text-[10px] uppercase text-zinc-500">Alunos</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center">
          <span className="block text-2xl font-black text-tatame-red">{totalClassesPerWeek}</span>
          <span className="text-[10px] uppercase text-zinc-500">Aulas/Semana</span>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map(cls => (
            <div 
              key={cls.id}
              onClick={() => setSelectedClass(cls)}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border-2 border-zinc-100 dark:border-zinc-800 hover:border-tatame-red/30 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-black text-lg text-tatame-black dark:text-tatame-white">{cls.name}</h4>
                    <span className="px-2 py-0.5 bg-tatame-gold/20 text-tatame-gold text-[8px] font-bold uppercase rounded-full">
                      {cls.modality}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 uppercase font-bold">{cls.students.length} alunos</span>
                </div>
                <div className="flex space-x-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); editClass(cls); }}
                    className="p-2 text-zinc-400 hover:text-tatame-gold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteClass(cls.id); }}
                    className="p-2 text-zinc-400 hover:text-tatame-red"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Horários */}
              <div className="flex flex-wrap gap-1 mb-3">
                {cls.schedule.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold text-zinc-600 dark:text-zinc-400">
                    {DAYS[s.day].substring(0, 3)} {s.time}
                  </span>
                ))}
              </div>

              {/* Alunos (primeiros 4) */}
              <div className="flex flex-wrap gap-1">
                {cls.students.slice(0, 4).map(s => (
                  <span key={s.id} className="px-2 py-0.5 bg-tatame-red/10 text-tatame-red rounded-full text-[9px]">
                    {s.name}
                  </span>
                ))}
                {cls.students.length > 4 && (
                  <span className="px-2 py-0.5 text-zinc-400 text-[9px]">+{cls.students.length - 4}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {classes.length === 0 && (
          <div className="text-center py-12 opacity-30">
            <span className="text-4xl mb-4 block">👥</span>
            <p className="font-bold uppercase tracking-widest text-xs">Nenhuma turma cadastrada</p>
          </div>
        )}
      </div>

      {/* Modal Detalhes da Turma */}
      {selectedClass && !showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setSelectedClass(null)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black uppercase text-tatame-black dark:text-tatame-white">{selectedClass.name}</h3>
                <span className="text-xs font-bold text-tatame-gold uppercase">{selectedClass.modality}</span>
              </div>
              <button onClick={() => setSelectedClass(null)} className="text-zinc-400 hover:text-tatame-red">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Horários Completos */}
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-2">📅 Horários</span>
              <div className="grid grid-cols-2 gap-2">
                {selectedClass.schedule.map((s, i) => (
                  <div key={i} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-2 text-center">
                    <span className="block font-bold text-sm text-tatame-black dark:text-white">{DAYS[s.day]}</span>
                    <span className="text-xs text-zinc-500">{s.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de Alunos */}
            <div className="mb-4">
              <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-2">👥 Alunos ({selectedClass.students.length})</span>
              <div className="flex flex-wrap gap-2">
                {selectedClass.students.map(s => (
                  <span key={s.id} className="px-3 py-1 bg-tatame-red/10 text-tatame-red rounded-full text-sm font-bold">
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Notas */}
            {selectedClass.notes && (
              <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block mb-1">📝 Observações</span>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{selectedClass.notes}</p>
              </div>
            )}

            <button
              onClick={() => { setSelectedClass(null); onManagePresence(selectedClass.id); }}
              className="w-full py-3 bg-tatame-red text-white rounded-xl font-bold uppercase text-sm"
            >
              📋 Gerenciar Presença desta Turma
            </button>
          </div>
        </div>
      )}

      {/* Modal Editar/Criar Turma */}
      {showEditModal && editingClass && (
        <ClassEditor 
          cls={editingClass} 
          onSave={saveClass} 
          onClose={() => { setShowEditModal(false); setEditingClass(null); }} 
        />
      )}
    </div>
  );
};

interface ClassEditorProps {
  cls: ClassData;
  onSave: (cls: ClassData) => void;
  onClose: () => void;
}

const ClassEditor: React.FC<ClassEditorProps> = ({ cls, onSave, onClose }) => {
  const [name, setName] = useState(cls.name);
  const [modality, setModality] = useState(cls.modality);
  const [schedule, setSchedule] = useState(cls.schedule);
  const [notes, setNotes] = useState(cls.notes || '');

  const addSchedule = () => {
    setSchedule([...schedule, { day: 1, time: '09:00' }]);
  };

  const updateSchedule = (index: number, field: 'day' | 'time', value: number | string) => {
    const newSchedule = [...schedule];
    newSchedule[index] = { ...newSchedule[index], [field]: value };
    setSchedule(newSchedule);
  };

  const removeSchedule = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      ...cls,
      name: name.trim(),
      modality,
      schedule,
      notes: notes.trim() || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-[60]" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-black uppercase text-tatame-black dark:text-tatame-white">
          {cls.id ? 'Editar Turma' : 'Nova Turma'}
        </h3>
        
        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Nome da Turma</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
            placeholder="Ex: Adulto Avançado"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Modalidade</label>
          <select 
            value={modality} 
            onChange={(e) => setModality(e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
          >
            {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold uppercase text-zinc-500">Horários</label>
            <button onClick={addSchedule} className="text-xs text-tatame-red font-bold">+ Adicionar</button>
          </div>
          <div className="space-y-2">
            {schedule.map((s, i) => (
              <div key={i} className="flex space-x-2">
                <select 
                  value={s.day} 
                  onChange={(e) => updateSchedule(i, 'day', parseInt(e.target.value))}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-xs font-bold text-tatame-black dark:text-white outline-none"
                >
                  {DAYS.map((d, idx) => <option key={idx} value={idx}>{d}</option>)}
                </select>
                <input 
                  type="time" 
                  value={s.time}
                  onChange={(e) => updateSchedule(i, 'time', e.target.value)}
                  className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-xs font-bold text-tatame-black dark:text-white outline-none"
                />
                <button onClick={() => removeSchedule(i)} className="p-2 text-zinc-400 hover:text-tatame-red">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Observações</label>
          <textarea 
            value={notes} 
            onChange={(e) => setNotes(e.target.value)} 
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red h-20 resize-none"
            placeholder="Notas sobre a turma..."
          />
        </div>
        
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl font-bold uppercase text-xs text-tatame-black dark:text-white">
            Cancelar
          </button>
          <button onClick={handleSave} className="flex-1 py-3 bg-tatame-red rounded-xl font-bold uppercase text-xs text-white">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyClasses;
