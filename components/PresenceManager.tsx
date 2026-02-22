
import React, { useState, useEffect, useMemo, useRef } from 'react';

declare var html2canvas: any;

interface Class {
  id: string;
  name: string;
}

interface Student {
  id: string;
  fullName: string;
  displayName: string;
  classId: string;
}

interface AttendanceRecord {
  [dateKey: string]: string[];
}

interface PaymentRecord {
  [studentId: string]: {
    [yearMonthKey: string]: {
      paid: boolean;
      value?: string;
      obs?: string;
    };
  };
}

interface PresenceManagerProps {
  onBack: () => void;
  initialClassId?: string | null;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

const numberToWords = (amount: number): string => {
  if (amount === 0) return "Zero reais";
  const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
  if (amount === 100) return "Cem reais";
  let words = "";
  if (amount >= 100) { words += hundreds[Math.floor(amount / 100)] + (amount % 100 > 0 ? " e " : ""); amount %= 100; }
  if (amount >= 20) { words += tens[Math.floor(amount / 10)] + (amount % 10 > 0 ? " e " : ""); amount %= 10; } 
  else if (amount >= 10) { words += teens[amount - 10]; amount = 0; }
  if (amount > 0) words += units[amount];
  return (words + " reais").toUpperCase();
};

const PresenceManager: React.FC<PresenceManagerProps> = ({ onBack, initialClassId }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [payments, setPayments] = useState<PaymentRecord>({});
  const [classInput, setClassInput] = useState("");
  const [studentInput, setStudentInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  
  // Estados de Edição
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'class' | 'student'; name: string } | null>(null);
  const [showClearPaymentConfirm, setShowClearPaymentConfirm] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptValue, setReceiptValue] = useState("150");
  const [receiptObs, setReceiptObs] = useState("Pagamento via PIX. Excelente treino!");
  const [isExporting, setIsExporting] = useState(false);
  const [historyMonthFilter, setHistoryMonthFilter] = useState(new Date().getMonth());
  const [historyYearFilter, setHistoryYearFilter] = useState(new Date().getFullYear());
  
  const studentInputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedClasses = localStorage.getItem('tatamex_classes');
    const savedStudents = localStorage.getItem('tatamex_students');
    const savedAttendance = localStorage.getItem('tatamex_attendance');
    const savedPayments = localStorage.getItem('tatamex_payments');

    // Sincronizar turmas do MyClasses com o PresenceManager
    const myClassesRaw = localStorage.getItem('tatamex_my_classes');
    let mergedClasses: Class[] = savedClasses ? JSON.parse(savedClasses) : [];
    let mergedStudents: Student[] = savedStudents ? JSON.parse(savedStudents) : [];

    if (myClassesRaw) {
      const myClasses = JSON.parse(myClassesRaw) as Array<{
        id: string; name: string; modality: string;
        students: { id: string; name: string }[];
      }>;
      myClasses.forEach(mc => {
        // Adicionar turma se não existir
        if (!mergedClasses.find(c => c.id === mc.id)) {
          mergedClasses.push({ id: mc.id, name: `${mc.name} (${mc.modality})` });
        }
        // Adicionar alunos se não existirem
        mc.students.forEach(s => {
          if (!mergedStudents.find(st => st.id === s.id)) {
            mergedStudents.push({
              id: s.id,
              fullName: s.name.toUpperCase(),
              displayName: s.name,
              classId: mc.id,
            });
          }
        });
      });
    }

    setClasses(mergedClasses);
    setStudents(mergedStudents);
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));
    if (savedPayments) setPayments(JSON.parse(savedPayments));

    // Pré-selecionar turma se initialClassId foi passado
    if (initialClassId) {
      setSelectedClassId(initialClassId);
    }
  }, [initialClassId]);

  useEffect(() => {
    localStorage.setItem('tatamex_classes', JSON.stringify(classes));
    localStorage.setItem('tatamex_students', JSON.stringify(students));
    localStorage.setItem('tatamex_attendance', JSON.stringify(attendance));
    localStorage.setItem('tatamex_payments', JSON.stringify(payments));
  }, [classes, students, attendance, payments]);

  const processName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) return parts[0].toUpperCase();
    return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`.toUpperCase();
  };

  const addClass = () => {
    if (!classInput.trim()) return;
    const newClass: Class = { id: `cls_${Date.now()}`, name: classInput.trim().toUpperCase() };
    setClasses(prev => [...prev, newClass]);
    setClassInput("");
  };

  const confirmDeletion = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'class') {
      setClasses(prev => prev.filter(c => c.id !== itemToDelete.id));
      setStudents(prev => prev.filter(s => s.classId !== itemToDelete.id));
      if (selectedClassId === itemToDelete.id) setSelectedClassId(null);
    } else {
      setStudents(prev => prev.filter(s => s.id !== itemToDelete.id));
    }
    setItemToDelete(null);
  };

  const saveEditClass = () => {
    if (!editName.trim() || !editingClassId) return;
    setClasses(prev => prev.map(c => c.id === editingClassId ? { ...c, name: editName.trim().toUpperCase() } : c));
    setEditingClassId(null);
    setEditName("");
  };

  const saveEditStudent = () => {
    if (!editName.trim() || !editingStudentId) return;
    setStudents(prev => prev.map(s => s.id === editingStudentId ? { 
      ...s, 
      fullName: editName.trim().toUpperCase(),
      displayName: processName(editName)
    } : s));
    setEditingStudentId(null);
    setEditName("");
  };

  const addStudent = () => {
    if (!studentInput.trim() || !selectedClassId) return;
    const newStudent: Student = { 
      id: `std_${Date.now()}`, 
      fullName: studentInput.trim().toUpperCase(), 
      displayName: processName(studentInput), 
      classId: selectedClassId 
    };
    setStudents(prev => [newStudent, ...prev]);
    setStudentInput("");
  };

  const dateKey = `${selectedYear}-${selectedMonth + 1}-${selectedDay}`;

  const togglePresence = (studentId: string) => {
    const currentList = attendance[dateKey] || [];
    let newList = currentList.includes(studentId) ? currentList.filter(id => id !== studentId) : [...currentList, studentId];
    setAttendance(prev => ({ ...prev, [dateKey]: newList }));
  };

  const isPresent = (studentId: string) => (attendance[dateKey] || []).includes(studentId);

  // Verifica se o aluno pagou no mês atualmente selecionado no calendário
  const hasPaidCurrentMonth = (studentId: string) => {
    const ymKey = `${selectedYear}-${selectedMonth + 1}`;
    return payments[studentId]?.[ymKey]?.paid || false;
  };

  const { daysInMonth, firstDayOfWeek } = useMemo(() => ({
    daysInMonth: new Date(selectedYear, selectedMonth + 1, 0).getDate(),
    firstDayOfWeek: new Date(selectedYear, selectedMonth, 1).getDay()
  }), [selectedMonth, selectedYear]);

  const handleMonthChange = (offset: number) => {
    let newMonth = selectedMonth + offset;
    let newYear = selectedYear;
    if (newMonth < 0) { newMonth = 11; newYear--; }
    else if (newMonth > 11) { newMonth = 0; newYear++; }
    setSelectedMonth(newMonth); setSelectedYear(newYear); setSelectedDay(1);
  };

  const filteredStudents = useMemo(() => students.filter(s => s.classId === selectedClassId), [students, selectedClassId]);
  const selectedStudent = students.find(s => s.id === viewingHistoryId);

  const studentHistory = useMemo(() => {
    if (!viewingHistoryId) return [];
    const days = Object.keys(attendance).filter(dateStr => {
        const [y, m] = dateStr.split('-').map(Number);
        return y === historyYearFilter && (m - 1) === historyMonthFilter;
    }).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    return days.map(dateStr => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return { date: `${d.toString().padStart(2, '0')}/${m.toString().padStart(2, '0')}/${y}`, present: attendance[dateStr].includes(viewingHistoryId) };
    }).reverse();
  }, [viewingHistoryId, attendance, historyMonthFilter, historyYearFilter]);

  const currentYMKey = `${historyYearFilter}-${historyMonthFilter + 1}`;
  const paymentInfo = viewingHistoryId ? (payments[viewingHistoryId]?.[currentYMKey] || { paid: false }) : { paid: false };

  const handleTogglePayment = () => {
    if (!viewingHistoryId) return;
    const info = payments[viewingHistoryId]?.[currentYMKey];
    if (info && info.paid) {
      setReceiptValue(info.value || "150");
      setReceiptObs(info.obs || "Pagamento via PIX. Excelente treino!");
    } else {
      setReceiptValue("150");
      setReceiptObs("Pagamento via PIX. Excelente treino!");
    }
    setShowReceiptModal(true);
  };

  const quickConfirmPayment = () => {
    if (!viewingHistoryId) return;
    setPayments(prev => ({ 
      ...prev, 
      [viewingHistoryId]: { 
        ...(prev[viewingHistoryId] || {}), 
        [currentYMKey]: { 
          paid: true, 
          value: "150", 
          obs: `Pagamento de ${MONTH_NAMES[historyMonthFilter]} confirmado manualmente.` 
        } 
      } 
    }));
  };

  const confirmPayment = () => {
    if (!viewingHistoryId) return;
    setPayments(prev => ({ 
      ...prev, 
      [viewingHistoryId]: { 
        ...(prev[viewingHistoryId] || {}), 
        [currentYMKey]: { paid: true, value: receiptValue, obs: receiptObs } 
      } 
    }));
    setShowReceiptModal(false);
  };

  const handleClearPayment = () => {
    setShowClearPaymentConfirm(true);
  };

  const executeClearPayment = () => {
    if (!viewingHistoryId) return;
    setPayments(prev => {
      const studentPayments = { ...(prev[viewingHistoryId] || {}) };
      delete studentPayments[currentYMKey];
      return { ...prev, [viewingHistoryId]: studentPayments };
    });
    setReceiptValue("150");
    setReceiptObs("Pagamento via PIX. Excelente treino!");
    setShowClearPaymentConfirm(false);
    setShowReceiptModal(false);
  };

  const exportReceiptAsImage = async () => {
    if (!receiptRef.current || isExporting) return;
    setIsExporting(true);
    try {
      window.scrollTo(0, 0);
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: 800 });
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `Recibo_${selectedStudent?.displayName}.png`;
      link.click();
    } catch (err) { console.error(err); alert("Erro ao gerar imagem."); } finally { setIsExporting(false); }
  };

  return (
    <div className="flex-1 flex flex-col p-4 max-w-7xl mx-auto w-full overflow-hidden bg-tatame-white dark:bg-tatame-black animate-in slide-in-from-right duration-300">
      
      {/* HEADER COMPARTILHADO */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-tatame-red transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
          <h2 className="text-xl font-black uppercase tracking-tight ml-2">Gestão de Alunos</h2>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row lg:space-x-8 min-h-0">
        
        {/* COLUNA ESQUERDA: CALENDÁRIO E TURMAS */}
        <div className="w-full lg:w-80 flex flex-col space-y-4 flex-shrink-0">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => handleMonthChange(-1)} className="p-2 text-tatame-red"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg></button>
              <span className="text-sm font-black uppercase">{MONTH_NAMES[selectedMonth]} {selectedYear}</span>
              <button onClick={() => handleMonthChange(1)} className="p-2 text-tatame-red"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></button>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {WEEK_DAYS.map((wd, i) => <div key={`wd-${i}`} className="text-center text-[9px] font-black text-zinc-400">{wd}</div>)}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={i} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <button key={day} onClick={() => setSelectedDay(day)} className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all ${selectedDay === day ? 'bg-tatame-red text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>{day}</button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex-1 overflow-hidden flex flex-col">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-tatame-red mb-4">Turmas Registradas</h3>
            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 pb-2 mb-4">
               <input type="text" value={classInput} onChange={(e) => setClassInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addClass()} className="flex-1 bg-transparent outline-none font-bold text-sm uppercase text-tatame-black dark:text-white" placeholder="Nova Turma..." />
               <button onClick={addClass} className="p-1 text-[#00695C] hover:scale-110 transition-transform"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
              {classes.map(cls => (
                <button key={cls.id} onClick={() => setSelectedClassId(cls.id)} className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center justify-between ${selectedClassId === cls.id ? 'bg-tatame-red/10 border-tatame-red text-tatame-red' : 'bg-zinc-50 dark:bg-zinc-950 border-transparent text-zinc-600'}`}>
                  <span className="font-bold text-xs uppercase truncate">{cls.name}</span>
                  <div className="flex items-center space-x-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingClassId(cls.id); setEditName(cls.name); }} className="p-1 opacity-50 hover:opacity-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                    <button onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: cls.id, type: 'class', name: cls.name }); }} className="p-1 opacity-50 hover:opacity-100"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: ALUNOS DA TURMA */}
        <div className="flex-1 mt-6 lg:mt-0 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col min-h-[400px]">
          {selectedClassId ? (
            <div className="flex-1 flex flex-col p-6 min-h-0 animate-in fade-in duration-500">
               <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                 <div>
                   <h3 className="text-2xl font-black uppercase tracking-tight">{classes.find(c => c.id === selectedClassId)?.name}</h3>
                   <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Lista de Chamada &bull; {selectedDay}/{selectedMonth+1}</span>
                 </div>
                 
                 <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl w-full md:w-auto shadow-inner">
                   <input 
                     ref={studentInputRef} 
                     type="text" 
                     placeholder="Novo Aluno..." 
                     value={studentInput} 
                     onChange={(e) => setStudentInput(e.target.value)} 
                     onKeyDown={(e) => e.key === 'Enter' && addStudent()} 
                     className="flex-1 bg-transparent border-none px-4 py-2 text-sm font-bold uppercase outline-none focus:ring-0 text-tatame-black dark:text-white" 
                   />
                   <button 
                     onClick={addStudent} 
                     className="bg-tatame-red text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform flex-shrink-0"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
                   </button>
                 </div>
               </div>

               <div className="flex-1 overflow-y-auto no-scrollbar pr-1">
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                   {filteredStudents.map(student => (
                     <div key={student.id} className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${isPresent(student.id) ? 'bg-green-500/10 border-green-500/40' : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800'}`}>
                       <div className="flex-1 truncate mr-2 cursor-pointer" onClick={() => {
                         setHistoryMonthFilter(selectedMonth);
                         setHistoryYearFilter(selectedYear);
                         setViewingHistoryId(student.id);
                       }}>
                         <div className="flex items-center space-x-1">
                           <span className={`block font-black text-sm truncate ${isPresent(student.id) ? 'text-green-600' : 'text-tatame-black dark:text-white'}`}>{student.displayName}</span>
                           {/* ÍCONE DE PAGAMENTO CONFIRMADO */}
                           {hasPaidCurrentMonth(student.id) && (
                             <span className="text-tatame-gold drop-shadow-sm flex-shrink-0" title="Pagamento Confirmado">
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                 <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                               </svg>
                             </span>
                           )}
                         </div>
                         <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Perfil & Histórico</span>
                       </div>
                       <div className="flex items-center space-x-1">
                         <button onClick={() => togglePresence(student.id)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isPresent(student.id) ? 'bg-green-500 text-white shadow-lg' : 'bg-white dark:bg-zinc-800 text-zinc-300'}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg></button>
                         <button onClick={(e) => { e.stopPropagation(); setEditingStudentId(student.id); setEditName(student.fullName); }} className="p-2 text-zinc-300 hover:text-tatame-gold"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                         <button onClick={(e) => { e.stopPropagation(); setItemToDelete({ id: student.id, type: 'student', name: student.fullName }); }} className="p-2 text-zinc-300 hover:text-tatame-red"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                       </div>
                     </div>
                   ))}
                 </div>
                 {filteredStudents.length === 0 && (
                   <div className="py-20 text-center opacity-30 flex flex-col items-center">
                     <span className="text-4xl mb-4">🥋</span>
                     <p className="font-bold uppercase tracking-widest text-[10px]">Nenhum aluno cadastrado nesta turma</p>
                   </div>
                 )}
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30">
               <svg className="w-24 h-24 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
               <p className="font-bold uppercase tracking-widest text-sm text-center">Selecione ou crie uma turma ao lado<br/>para gerenciar os alunos</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL HISTÓRICO */}
      {viewingHistoryId && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-[100] flex items-center justify-center p-4">
           <div className="bg-white dark:bg-zinc-950 w-full max-w-2xl h-[90vh] rounded-[2.5rem] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
             <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
               <button onClick={() => setViewingHistoryId(null)} className="p-2 -ml-2 text-zinc-400 hover:text-tatame-red transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
               <div className="text-center flex-1">
                 <h2 className="text-2xl font-black uppercase tracking-tight text-tatame-black dark:text-white">{selectedStudent.fullName}</h2>
                 <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Relatório Financeiro & Chamada</span>
               </div>
               <div className="w-10" />
             </div>
             <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl flex flex-col">
                     <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2">Total de Aulas</span>
                     <span className="text-3xl font-black text-tatame-black dark:text-white">{studentHistory.filter(h => h.present).length}</span>
                   </div>
                   <button onClick={handleTogglePayment} className={`p-4 rounded-2xl flex flex-col justify-center items-center transition-all ${paymentInfo.paid ? 'bg-green-500 text-white shadow-lg' : 'bg-tatame-red/10 border-2 border-dashed border-tatame-red/30 text-tatame-red'}`}>
                     <span className="text-[9px] font-black uppercase tracking-widest mb-1">{paymentInfo.paid ? 'Mensalidade Paga' : 'Pendente'}</span>
                     <span className="text-lg font-black uppercase tracking-tighter">Recibo Digital</span>
                   </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Presença no Período</h4>
                    {!paymentInfo.paid && (
                      <button 
                        onClick={quickConfirmPayment}
                        className="text-[9px] font-black uppercase bg-tatame-red text-white px-3 py-1.5 rounded-lg shadow-sm active:scale-95 transition-all flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        <span>Confirmar Pagamento do Mês</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {studentHistory.map((item, idx) => (
                      <div key={idx} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl flex justify-between items-center animate-in fade-in duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                        <span className="font-bold text-sm text-tatame-black dark:text-white">{item.date}</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.present ? 'text-green-500' : 'text-tatame-red'}`}>{item.present ? 'Presente' : 'Ausente'}</span>
                      </div>
                    ))}
                    {studentHistory.length === 0 && (
                      <p className="text-center py-4 text-[10px] font-bold uppercase opacity-30 text-zinc-500">Nenhum registro para este período</p>
                    )}
                  </div>
                </div>
             </div>
           </div>
        </div>
      )}

      {/* MODAL RECIBO */}
      {showReceiptModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-[200] flex flex-col items-center p-0 lg:p-10 overflow-y-auto no-scrollbar animate-in fade-in duration-300">
           <div className="w-full max-w-4xl flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-10 pb-20">
              <div className="w-full lg:w-80 space-y-6 p-6 lg:p-0">
                 <button onClick={() => setShowReceiptModal(false)} className="bg-white/10 p-3 rounded-full text-white mb-6 transition-colors hover:bg-white/20"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
                 <div className="bg-zinc-900 p-6 rounded-3xl border border-zinc-800 space-y-4">
                    <div>
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Valor</label>
                      <input type="number" value={receiptValue} onChange={(e) => setReceiptValue(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white font-black outline-none focus:border-tatame-red" />
                    </div>
                    <div>
                      <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest mb-1 block">Obs</label>
                      <textarea value={receiptObs} onChange={(e) => setReceiptObs(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white text-xs outline-none focus:border-tatame-red" rows={3} />
                    </div>
                    <button onClick={exportReceiptAsImage} disabled={isExporting} className="w-full py-4 bg-green-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">{isExporting ? 'Processando...' : 'Exportar PNG'}</button>
                    <button onClick={confirmPayment} className="w-full py-4 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Salvar no App</button>
                    {paymentInfo.paid && (
                      <button onClick={handleClearPayment} className="w-full py-4 bg-tatame-red/10 border border-tatame-red/30 text-tatame-red rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Limpar Registro</button>
                    )}
                 </div>
              </div>

              <div className="flex-1 bg-white p-2 rounded-[2rem] shadow-2xl overflow-hidden hidden md:block">
                 <div ref={receiptRef} className="bg-white text-black p-12 font-serif min-h-[800px]">
                    <div className="flex justify-between items-start mb-16 border-b-4 border-black pb-8">
                       <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-4xl font-black rotate-3">X</div>
                          <div>
                            <h1 className="text-2xl font-black uppercase leading-none">TatameX Performance</h1>
                            <p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 mt-1">Training OS</p>
                          </div>
                       </div>
                       <div className="text-right">
                         <div className="text-2xl font-black leading-none mb-1 text-black">RECIBO</div>
                         <div className="text-[9px] font-bold uppercase opacity-50 tracking-widest text-black">Digital Generated</div>
                       </div>
                    </div>
                    <div className="space-y-12 text-xl text-black">
                       <div className="flex flex-col space-y-1">
                         <span className="font-black text-[9px] uppercase tracking-widest text-zinc-500">Recebido de:</span>
                         <div className="border-b border-zinc-200 pb-2 uppercase font-black text-2xl tracking-tight text-black">{selectedStudent?.fullName}</div>
                       </div>
                       <div className="flex flex-col space-y-1">
                         <span className="font-black text-[9px] uppercase tracking-widest text-zinc-500">A quantia de:</span>
                         <div className="border-b border-zinc-200 pb-2 italic font-bold capitalize text-black">{numberToWords(parseInt(receiptValue) || 0)}</div>
                       </div>
                       <div className="flex flex-col space-y-1">
                         <span className="font-black text-[9px] uppercase tracking-widest text-zinc-500">Referente à:</span>
                         <div className="border-b border-zinc-200 pb-2 font-black uppercase text-black">Jiu-jitsu &bull; {MONTH_NAMES[historyMonthFilter]} {historyYearFilter}</div>
                       </div>
                    </div>
                    <table className="w-full mt-20 border-collapse text-black">
                       <thead><tr className="bg-zinc-100 uppercase font-black text-[10px] tracking-widest border-y border-black"><th className="p-4 text-left">Descrição</th><th className="p-4 text-right">Total</th></tr></thead>
                       <tbody>
                         <tr className="font-bold border-b border-zinc-200"><td className="p-6 uppercase text-xs">Mensalidade Técnica Profissional</td><td className="p-6 text-right font-mono">R$ {parseInt(receiptValue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>
                         <tr className="bg-zinc-100 font-black text-xl"><td className="p-6 text-right uppercase">Total Geral</td><td className="p-6 text-right font-mono text-tatame-red">R$ {parseInt(receiptValue).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td></tr>
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL EDITAR / EXCLUIR */}
      {(editingClassId || editingStudentId || itemToDelete) && !showClearPaymentConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-[300] animate-in fade-in duration-200">
           {itemToDelete ? (
              <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-tatame-red/10 rounded-full flex items-center justify-center text-tatame-red mx-auto"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-tatame-black dark:text-white">Confirmar Exclusão</h3>
                  <p className="text-xs text-zinc-500 font-medium leading-relaxed">Deseja remover o registro de <span className="font-black text-tatame-black dark:text-white">"{itemToDelete.name}"</span>? Esta ação é irreversível.</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <button onClick={confirmDeletion} className="w-full py-4 bg-tatame-red text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-transform">Excluir Permanente</button>
                  <button onClick={() => setItemToDelete(null)} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancelar</button>
                </div>
              </div>
           ) : (
              <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
                <h3 className="text-xl font-black uppercase tracking-tight text-tatame-black dark:text-white">Editar Registro</h3>
                <input 
                  autoFocus 
                  type="text" 
                  value={editName} 
                  onChange={(e) => setEditName(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && (editingClassId ? saveEditClass() : saveEditStudent())} 
                  className="w-full bg-zinc-100 dark:bg-zinc-950 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-4 font-bold uppercase outline-none focus:border-tatame-red text-tatame-black dark:text-white" 
                />
                <div className="flex flex-col space-y-2">
                  <button onClick={editingClassId ? saveEditClass : saveEditStudent} className="w-full py-4 bg-tatame-red text-white rounded-xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">Salvar Alteração</button>
                  <button onClick={() => { setEditingClassId(null); setEditingStudentId(null); setEditName(""); }} className="w-full py-4 bg-transparent text-zinc-500 font-black uppercase text-[10px]">Cancelar</button>
                </div>
              </div>
           )}
        </div>
      )}

      {/* MODAL ESTORNO CONFIRMATION */}
      {showClearPaymentConfirm && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-[300] animate-in fade-in duration-200">
           <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-3xl p-8 space-y-6 shadow-2xl border-2 border-tatame-red/20 animate-in zoom-in-95">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-tatame-red/10 rounded-full flex items-center justify-center text-tatame-red mx-auto"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
                <h3 className="text-xl font-black uppercase tracking-tight text-tatame-black dark:text-white">Estornar Pagamento</h3>
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">Você está prestes a apagar o registro de pagamento de <span className="font-black text-tatame-black dark:text-white">{MONTH_NAMES[historyMonthFilter]}</span>. Esta ação é irreversível.</p>
              </div>
              <div className="flex flex-col space-y-2">
                <button onClick={executeClearPayment} className="w-full py-4 bg-tatame-red text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-transform">Confirmar Estorno</button>
                <button onClick={() => setShowClearPaymentConfirm(false)} className="w-full py-4 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-xl font-black uppercase text-[10px] tracking-widest">Manter Registro</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PresenceManager;
