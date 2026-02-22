import React, { useState, useEffect, useMemo } from 'react';

interface ClassRecord {
  id: string;
  date: string;
  className: string;
  modality: string;
  planName?: string;
  studentsPresent: string[];
  techniques: string[];
  notes?: string;
  duration: number;
}

interface ClassHistoryProps {
  onBack: () => void;
}

const ClassHistory: React.FC<ClassHistoryProps> = ({ onBack }) => {
  const [records, setRecords] = useState<ClassRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterClass, setFilterClass] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  useEffect(() => {
    const saved = localStorage.getItem('tatamex_class_history');
    if (saved) {
      setRecords(JSON.parse(saved));
    } else {
      // Histórico de exemplo
      const exampleRecords: ClassRecord[] = [
        {
          id: '1',
          date: '2024-02-15',
          className: 'Adulto Avançado',
          modality: 'Jiu-Jitsu',
          planName: 'Técnica de Finalização',
          studentsPresent: ['João S.', 'Pedro R.', 'Carlos M.', 'Lucas A.', 'Bruno K.'],
          techniques: ['Triângulo', 'Mata-leão', 'Americana'],
          notes: 'Bons progresso no triângulo. Atenção ao detalhes.',
          duration: 60
        },
        {
          id: '2',
          date: '2024-02-14',
          className: 'Juvenil',
          modality: 'Jiu-Jitsu',
          planName: 'Aquecimento Jiu-Jitsu',
          studentsPresent: ['Marcos T.', 'Felipe L.', 'Gustavo S.'],
          techniques: ['Raspagem básica', 'Guarda fechada'],
          duration: 50
        },
        {
          id: '3',
          date: '2024-02-13',
          className: 'Competição',
          modality: 'MMA',
          planName: 'Treino Luta',
          studentsPresent: ['Rafael B.', 'Diego F.', 'Thiago H.'],
          techniques: ['Double leg', 'Ground and pound', 'Defesa de costas'],
          notes: 'Intensidade alta. Todos aplicados.',
          duration: 90
        },
        {
          id: '4',
          date: '2024-02-12',
          className: 'Kids',
          modality: 'Jiu-Jitsu',
          planName: 'Treino Kids',
          studentsPresent: ['Enzo R.', 'Luiz F.', 'Sophia M.', 'Lucas B.'],
          techniques: ['Chave de ombro', 'Rolar cobra'],
          duration: 45
        },
        {
          id: '5',
          date: '2024-02-11',
          className: 'Female',
          modality: 'Jiu-Jitsu',
          planName: 'Técnica de Finalização',
          studentsPresent: ['Ana Paula', 'Carla S.', 'Mariana L.'],
          techniques: ['Triângulo', 'Kimura', 'Arm lock'],
          duration: 60
        },
      ];
      setRecords(exampleRecords);
      localStorage.setItem('tatamex_class_history', JSON.stringify(exampleRecords));
    }
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const date = new Date(r.date);
      const matchesMonth = date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
      const matchesClass = filterClass === 'all' || r.className === filterClass;
      const matchesPlan = filterPlan === 'all' || r.planName === filterPlan;
      return matchesMonth && matchesClass && matchesPlan;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, selectedMonth, selectedYear, filterClass, filterPlan]);

  const uniqueClasses = [...new Set(records.map(r => r.className))];
  const uniquePlans = [...new Set(records.map(r => r.planName).filter(Boolean))];

  const stats = useMemo(() => {
    const totalClasses = filteredRecords.length;
    const totalStudents = filteredRecords.reduce((acc, r) => acc + r.studentsPresent.length, 0);
    const totalMinutes = filteredRecords.reduce((acc, r) => acc + r.duration, 0);
    const avgStudents = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;
    return { totalClasses, totalStudents, totalMinutes, avgStudents };
  }, [filteredRecords]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
  };

  const handleMonthChange = (offset: number) => {
    let newMonth = selectedMonth + offset;
    let newYear = selectedYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    else if (newMonth > 11) { newMonth = 0; newYear++; }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const saveRecord = (newRecord: ClassRecord) => {
    const updated = [...records, { ...newRecord, id: `record_${Date.now()}` }];
    setRecords(updated);
    localStorage.setItem('tatamex_class_history', JSON.stringify(updated));
  };

  const deleteRecord = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
      const updated = records.filter(r => r.id !== id);
      setRecords(updated);
      localStorage.setItem('tatamex_class_history', JSON.stringify(updated));
    }
  };

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
            📜 Histórico de Aulas
          </h2>
        </div>
      </div>

      {/* Seletor de Mês */}
      <div className="flex items-center justify-between mb-4 bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800">
        <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
          <svg className="w-5 h-5 text-tatame-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="font-black uppercase text-tatame-black dark:text-tatame-white">
          {new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
          <svg className="w-5 h-5 text-tatame-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <select 
          value={filterClass} 
          onChange={(e) => setFilterClass(e.target.value)}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-bold uppercase text-tatame-black dark:text-white outline-none"
        >
          <option value="all">Todas as Turmas</option>
          {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          value={filterPlan} 
          onChange={(e) => setFilterPlan(e.target.value)}
          className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs font-bold uppercase text-tatame-black dark:text-white outline-none"
        >
          <option value="all">Todos os Planos</option>
          {uniquePlans.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {/* Estatísticas do Período */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
          <span className="block text-xl font-black text-tatame-red">{stats.totalClasses}</span>
          <span className="text-[8px] uppercase text-zinc-500">Aulas</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
          <span className="block text-xl font-black text-tatame-black dark:text-white">{stats.totalStudents}</span>
          <span className="text-[8px] uppercase text-zinc-500">Presenças</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
          <span className="block text-xl font-black text-tatame-gold">{stats.avgStudents}</span>
          <span className="text-[8px] uppercase text-zinc-500">Média</span>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
          <span className="block text-xl font-black text-tatame-black dark:text-white">{Math.floor(stats.totalMinutes / 60)}h</span>
          <span className="text-[8px] uppercase text-zinc-500">Treino</span>
        </div>
      </div>

      {/* Lista de Aulas */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {filteredRecords.length > 0 ? (
          <div className="space-y-3">
            {filteredRecords.map(record => (
              <div key={record.id} className="bg-white dark:bg-zinc-900 rounded-xl p-4 border-2 border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-black text-tatame-black dark:text-tatame-white">{record.className}</h4>
                      <span className="px-2 py-0.5 bg-tatame-gold/20 text-tatame-gold text-[8px] font-bold uppercase rounded-full">
                        {record.modality}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">{formatDate(record.date)}</span>
                  </div>
                  <button onClick={() => deleteRecord(record.id)} className="p-1 text-zinc-300 hover:text-tatame-red">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {record.planName && (
                  <div className="mb-2 text-xs font-bold text-tatame-red">
                    📋 {record.planName}
                  </div>
                )}

                <div className="mb-2">
                  <span className="text-[8px] uppercase text-zinc-500 font-bold">Técnicas:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {record.techniques.map((tech, i) => (
                      <span key={i} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[9px] text-zinc-600 dark:text-zinc-400">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-[8px] uppercase text-zinc-500 font-bold">Presentes ({record.studentsPresent.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {record.studentsPresent.slice(0, 5).map((student, i) => (
                      <span key={i} className="px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full text-[9px]">
                        {student}
                      </span>
                    ))}
                    {record.studentsPresent.length > 5 && (
                      <span className="px-2 py-0.5 text-zinc-400 text-[9px]">+{record.studentsPresent.length - 5}</span>
                    )}
                  </div>
                </div>

                {record.notes && (
                  <div className="mt-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <span className="text-[9px] text-zinc-500">📝 {record.notes}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 opacity-30">
            <span className="text-4xl mb-4 block">📜</span>
            <p className="font-bold uppercase tracking-widest text-xs">Nenhuma aula neste período</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassHistory;
