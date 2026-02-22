import React, { useState, useEffect } from 'react';

interface Student {
  id: string;
  fullName: string;
  displayName: string;
  email: string;
  phone: string;
  belt: string;
  classId: string;
  className: string;
  pin: string;
  createdAt: string;
}

interface Contract {
  id: string;
  studentId: string;
  title: string;
  description: string;
  status: 'pending' | 'signed' | 'expired';
  signedAt?: string;
  createdAt: string;
}

interface AttendanceRecord {
  [dateKey: string]: string[];
}

interface GraduationRecord {
  id: string;
  studentId: string;
  belt: string;
  achievedAt: string;
  notes?: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  priority: 'normal' | 'important' | 'urgent';
}

interface StudentAppProps {
  onBack: () => void;
}

const BELT_COLORS: Record<string, string> = {
  'Branca': '#f5f5f5',
  'Amarela': '#facc15',
  'Laranja': '#fb923c',
  'Verde': '#22c55e',
  'Azul': '#3b82f6',
  'Roxa': '#a855f7',
  'Marrom': '#92400e',
  'Preta': '#171717',
};

const StudentApp: React.FC<StudentAppProps> = ({ onBack }) => {
  const [view, setView] = useState<'login' | 'register' | 'dashboard'>('login');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [graduations, setGraduations] = useState<GraduationRecord[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'contracts' | 'graduation' | 'attendance' | 'notices'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    belt: 'Branca',
    classId: '',
    pin: '',
    confirmPin: '',
  });
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [signatureConfirmed, setSignatureConfirmed] = useState(false);

  useEffect(() => {
    const storedStudents = localStorage.getItem('tatamex_students');
    const storedContracts = localStorage.getItem('tatamex_contracts');
    const storedAttendance = localStorage.getItem('tatamex_attendance');
    const storedGraduations = localStorage.getItem('tatamex_graduations');
    const storedNotices = localStorage.getItem('tatamex_notices');
    const currentStudentId = localStorage.getItem('tatamex_current_student');

    if (storedStudents) setStudents(JSON.parse(storedStudents));
    if (storedContracts) setContracts(JSON.parse(storedContracts));
    if (storedAttendance) setAttendance(JSON.parse(storedAttendance));
    if (storedGraduations) setGraduations(JSON.parse(storedGraduations));
    if (storedNotices) setNotices(JSON.parse(storedNotices));

    if (currentStudentId && storedStudents) {
      const student = JSON.parse(storedStudents).find((s: Student) => s.id === currentStudentId);
      if (student) {
        setCurrentStudent(student);
        setView('dashboard');
      }
    }

    if (!storedNotices) {
      const defaultNotices: Notice[] = [
        { id: '1', title: 'Bem-vindo ao TatameX!', content: 'Agora você pode acompanhar seu progresso, ver seus contratos e ficar por dentro dos avisos da academia.', createdAt: new Date().toISOString(), priority: 'important' },
        { id: '2', title: 'Horários de Feriado', content: 'A academia funcionará em horário especial durante os feriados.', createdAt: new Date().toISOString(), priority: 'normal' },
      ];
      setNotices(defaultNotices);
      localStorage.setItem('tatamex_notices', JSON.stringify(defaultNotices));
    }
  }, []);

  const generateId = () => `student_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleLogin = () => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      const student = students.find(s => s.pin === pinInput);
      if (student) {
        setCurrentStudent(student);
        localStorage.setItem('tatamex_current_student', student.id);
        setView('dashboard');
        setPinInput('');
      } else {
        setError('PIN não encontrado. Verifique e tente novamente.');
      }
      setLoading(false);
    }, 500);
  };

  const handleRegister = () => {
    setLoading(true);
    setError('');
    if (!registerForm.fullName || !registerForm.pin || !registerForm.confirmPin) {
      setError('Preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }
    if (registerForm.pin !== registerForm.confirmPin) {
      setError('Os PINs não conferem.');
      setLoading(false);
      return;
    }
    if (registerForm.pin.length < 4) {
      setError('O PIN deve ter pelo menos 4 dígitos.');
      setLoading(false);
      return;
    }
    if (students.some(s => s.pin === registerForm.pin)) {
      setError('Este PIN já está em uso. Escolha outro.');
      setLoading(false);
      return;
    }

    const newStudent: Student = {
      id: generateId(),
      fullName: registerForm.fullName,
      displayName: registerForm.fullName.split(' ')[0],
      email: registerForm.email,
      phone: registerForm.phone,
      belt: registerForm.belt,
      classId: registerForm.classId || 'default',
      className: registerForm.classId ? 'Turma ' + registerForm.classId : 'Turma Principal',
      pin: registerForm.pin,
      createdAt: new Date().toISOString(),
    };

    const updatedStudents = [...students, newStudent];
    setStudents(updatedStudents);
    localStorage.setItem('tatamex_students', JSON.stringify(updatedStudents));

    setCurrentStudent(newStudent);
    localStorage.setItem('tatamex_current_student', newStudent.id);
    setView('dashboard');

    const newContract: Contract = {
      id: generateId(),
      studentId: newStudent.id,
      title: 'Termo de Responsabilidade',
      description: 'TERMO DE RESPONSABILIDADE\n\nDeclaro, para os devidos fins, estar ciente de que a presente matrícula nesta academia, devidamente aceita e homologada pelo professor responsável, obriga-me a cumprir as seguintes cláusulas:\n\nI - Na assinatura do presente termo, declaro-me apta para a prática das aulas de arte marcial, não havendo qualquer impedimento de ordem médica, física ou legal para a realização das atividades.\n\nII - Declaro-me ciente quanto aos riscos da minha integridade física inerente à natureza da atividade esportiva praticada. Em caso de lesão ou contusões de qualquer espécie, assumo integral responsabilidade sobre os danos, isentando o professor responsável.\n\nIII - Outorgo à academia todo direito de uso das minhas imagens e sons capturados durante as aulas, Campeonatos ou qualquer outro evento referente a arte marcial para uso publicitário e divulgação, bem como para matérias em veículos de comunicação a serem feitas em qualquer tempo sem nenhuma compensação financeira, sendo desnecessária para tanto qualquer outra autorização verbal ou escrita, de acordo com o artigo 20 do Código Civil Brasileiro e demais dispositivos legais aplicáveis à espécie.\n\nEstou ciente de que ao assinar com um (aceito) essa ficha de matrícula, concedo o uso do direito da minha imagem à academia por um período de 100 (cem) anos, podendo a mesma cedê-la a outros veículos de comunicação.',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const updatedContracts = [...contracts, newContract];
    setContracts(updatedContracts);
    localStorage.setItem('tatamex_contracts', JSON.stringify(updatedContracts));

    const initialGraduation: GraduationRecord = {
      id: generateId(),
      studentId: newStudent.id,
      belt: 'Branca',
      achievedAt: new Date().toISOString(),
      notes: 'Faixa inicial',
    };

    const updatedGraduations = [...graduations, initialGraduation];
    setGraduations(updatedGraduations);
    localStorage.setItem('tatamex_graduations', JSON.stringify(updatedGraduations));

    setLoading(false);
    setRegisterForm({ fullName: '', email: '', phone: '', belt: 'Branca', classId: '', pin: '', confirmPin: '' });
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    localStorage.removeItem('tatamex_current_student');
    setView('login');
    setActiveTab('profile');
  };

  const handleSignContract = () => {
    if (!currentStudent || !selectedContract) return;
    const updatedContracts = contracts.map(c => 
      c.id === selectedContract.id ? { ...c, status: 'signed' as const, signedAt: new Date().toISOString() } : c
    );
    setContracts(updatedContracts);
    localStorage.setItem('tatamex_contracts', JSON.stringify(updatedContracts));
    setSelectedContract(null);
    setSignatureConfirmed(false);
  };

  const studentContracts = currentStudent ? contracts.filter(c => c.studentId === currentStudent.id) : [];
  const studentGraduations = currentStudent ? graduations.filter(g => g.studentId === currentStudent.id) : [];

  const getAttendanceStats = () => {
    const allDates = Object.keys(attendance);
    let totalPresences = 0;
    allDates.forEach(date => {
      if (attendance[date] && attendance[date].includes(currentStudent?.id || '')) {
        totalPresences++;
      }
    });
    return { total: totalPresences, lastMonth: totalPresences, streak: Math.min(totalPresences, 7) };
  };

  const renderLogin = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', paddingTop: '40px' }}>
      <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, boxShadow: '0 8px 32px rgba(239,68,68,0.3)' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-10 h-10">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 24, fontWeight: 800, color: '#e5e7eb', marginBottom: 8, textAlign: 'center' }}>App do Aluno</h2>
      <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>Acesse com seu PIN de aluno</p>
      <div style={{ width: '100%', maxWidth: 280, background: 'rgba(17,24,39,0.8)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
        <input
          type="text"
          placeholder="Seu PIN"
          value={pinInput}
          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
          style={{ width: '100%', padding: '16px 20px', fontSize: 24, fontWeight: 700, textAlign: 'center', letterSpacing: '0.3em', background: 'rgba(2,6,23,0.8)', border: '2px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#e5e7eb', outline: 'none', fontFamily: 'monospace' }}
        />
        {error ? <p style={{ color: '#ef4444', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</p> : null}
        <button onClick={handleLogin} disabled={loading || pinInput.length < 4} style={{ width: '100%', marginTop: 20, padding: '14px 24px', fontSize: 15, fontWeight: 700, background: loading ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', borderRadius: 12, color: '#fff', cursor: loading || pinInput.length < 4 ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 24 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ padding: '0 16px', color: '#64748b', fontSize: 12 }}>ou</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>
        <button onClick={() => { setError(''); setView('register'); }} style={{ width: '100%', marginTop: 20, padding: '14px 24px', fontSize: 15, fontWeight: 600, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, color: '#e5e7eb', cursor: 'pointer' }}>
          Primeiro acesso? Cadastre-se
        </button>
      </div>
    </div>
  );

  const renderRegister = () => (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto', padding: '20px' }}>
      <div style={{ background: 'rgba(17,24,39,0.8)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 18, fontWeight: 700, color: '#e5e7eb', marginBottom: 20, textAlign: 'center' }}>Cadastro de Aluno</h3>
        {error ? <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, color: '#ef4444', fontSize: 13 }}>{error}</div> : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Nome Completo *</label>
            <input type="text" value={registerForm.fullName} onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })} placeholder="Seu nome completo" style={{ width: '100%', padding: '12px 16px', fontSize: 14, background: 'rgba(2,6,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e5e7eb', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Email</label>
            <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} placeholder="seu@email.com" style={{ width: '100%', padding: '12px 16px', fontSize: 14, background: 'rgba(2,6,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e5e7eb', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Telefone</label>
            <input type="tel" value={registerForm.phone} onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })} placeholder="(00) 00000-0000" style={{ width: '100%', padding: '12px 16px', fontSize: 14, background: 'rgba(2,6,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e5e7eb', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Faixa Atual</label>
            <select value={registerForm.belt} onChange={(e) => setRegisterForm({ ...registerForm, belt: e.target.value })} style={{ width: '100%', padding: '12px 16px', fontSize: 14, background: 'rgba(2,6,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e5e7eb', outline: 'none' }}>
              {Object.keys(BELT_COLORS).map(belt => <option key={belt} value={belt} style={{ background: '#0f172a' }}>{belt}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Código da Turma</label>
            <input type="text" value={registerForm.classId} onChange={(e) => setRegisterForm({ ...registerForm, classId: e.target.value })} placeholder="Código fornecido pela academia" style={{ width: '100%', padding: '12px 16px', fontSize: 14, background: 'rgba(2,6,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e5e7eb', outline: 'none' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>PIN de Acesso *</label>
              <input type="password" value={registerForm.pin} onChange={(e) => setRegisterForm({ ...registerForm, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="4-6 dígitos" maxLength={6} style={{ width: '100%', padding: '12px 16px', fontSize: 14, letterSpacing: '0.2em', background: 'rgba(2,6,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e5e7eb', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>Confirmar PIN *</label>
              <input type="password" value={registerForm.confirmPin} onChange={(e) => setRegisterForm({ ...registerForm, confirmPin: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="Confirme" maxLength={6} style={{ width: '100%', padding: '12px 16px', fontSize: 14, letterSpacing: '0.2em', background: 'rgba(2,6,23,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e5e7eb', outline: 'none' }} />
            </div>
          </div>
          <button onClick={handleRegister} disabled={loading} style={{ width: '100%', padding: '14px 24px', fontSize: 15, fontWeight: 700, background: loading ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', borderRadius: 12, color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>
          <button onClick={() => { setError(''); setView('login'); }} style={{ width: '100%', padding: 12, fontSize: 14, background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>← Voltar para login</button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const stats = getAttendanceStats();
    const beltColors = BELT_COLORS;
    const currentBelt = currentStudent?.belt || 'Branca';
    const beltKeys = Object.keys(beltColors);
    const currentBeltIndex = beltKeys.indexOf(currentBelt);
    const nextBelt = beltKeys[currentBeltIndex + 1];
    const progress = Math.min(100, (stats.total / 20) * 100);

    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        <div style={{ display: 'flex', padding: '0 16px', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.08)', overflowX: 'auto' }}>
          <button onClick={() => setActiveTab('profile')} style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, background: 'transparent', border: 'none', borderBottom: activeTab === 'profile' ? '2px solid #ef4444' : '2px solid transparent', color: activeTab === 'profile' ? '#ef4444' : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>👤 Perfil</button>
          <button onClick={() => setActiveTab('contracts')} style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, background: 'transparent', border: 'none', borderBottom: activeTab === 'contracts' ? '2px solid #ef4444' : '2px solid transparent', color: activeTab === 'contracts' ? '#ef4444' : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>📄 Contratos</button>
          <button onClick={() => setActiveTab('graduation')} style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, background: 'transparent', border: 'none', borderBottom: activeTab === 'graduation' ? '2px solid #ef4444' : '2px solid transparent', color: activeTab === 'graduation' ? '#ef4444' : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>🥋 Graduação</button>
          <button onClick={() => setActiveTab('attendance')} style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, background: 'transparent', border: 'none', borderBottom: activeTab === 'attendance' ? '2px solid #ef4444' : '2px solid transparent', color: activeTab === 'attendance' ? '#ef4444' : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>✅ Presenças</button>
          <button onClick={() => setActiveTab('notices')} style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, background: 'transparent', border: 'none', borderBottom: activeTab === 'notices' ? '2px solid #ef4444' : '2px solid transparent', color: activeTab === 'notices' ? '#ef4444' : '#64748b', cursor: 'pointer', whiteSpace: 'nowrap' }}>📢 Avisos</button>
        </div>
        <div style={{ padding: 20 }}>
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'rgba(17,24,39,0.8)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: beltColors[currentBelt], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 32, fontWeight: 700, color: currentBelt === 'Preta' ? '#fff' : '#1f2937', boxShadow: '0 4px 20px ' + beltColors[currentBelt] + '40' }}>
                  {currentStudent?.fullName?.charAt(0).toUpperCase()}
                </div>
                <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 20, fontWeight: 700, color: '#e5e7eb', marginBottom: 4 }}>{currentStudent?.fullName}</h3>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 12 }}>{currentStudent?.className}</p>
                <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: beltColors[currentBelt] + '20', border: '1px solid ' + beltColors[currentBelt] + '60', color: beltColors[currentBelt], fontSize: 13, fontWeight: 600 }}>Faixa {currentStudent?.belt}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(17,24,39,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Email</p>
                  <p style={{ color: '#e5e7eb', fontSize: 13 }}>{currentStudent?.email || 'Não informado'}</p>
                </div>
                <div style={{ background: 'rgba(17,24,39,0.6)', borderRadius: 12, padding: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>Telefone</p>
                  <p style={{ color: '#e5e7eb', fontSize: 13 }}>{currentStudent?.phone || 'Não informado'}</p>
                </div>
              </div>
              <button onClick={handleLogout} style={{ width: '100%', padding: '14px 24px', fontSize: 14, fontWeight: 600, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, color: '#ef4444', cursor: 'pointer' }}>Sair da Conta</button>
            </div>
          )}
          {activeTab === 'contracts' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {studentContracts.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}><p>Nenhum contrato encontrado.</p></div> : studentContracts.map(contract => (
                <div key={contract.id} onClick={() => setSelectedContract(contract)} style={{ background: 'rgba(17,24,39,0.8)', borderRadius: 12, padding: 16, border: contract.status === 'signed' ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div><h4 style={{ color: '#e5e7eb', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{contract.title}</h4><p style={{ color: '#64748b', fontSize: 12 }}>Criado em {new Date(contract.createdAt).toLocaleDateString('pt-BR')}</p></div>
                    <span style={{ padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: contract.status === 'signed' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)', color: contract.status === 'signed' ? '#22c55e' : '#f59e0b' }}>{contract.status === 'signed' ? 'ASSINADO' : 'PENDENTE'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeTab === 'graduation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ background: 'rgba(17,24,39,0.8)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: beltColors[currentBelt], display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 40, color: currentBelt === 'Preta' ? '#fff' : '#1f2937', boxShadow: '0 8px 32px ' + beltColors[currentBelt] + '40' }}>🥋</div>
                <h3 style={{ fontFamily: 'Orbitron, sans-serif', fontSize: 22, fontWeight: 700, color: '#e5e7eb', marginBottom: 4 }}>{currentStudent?.belt}</h3>
                {nextBelt ? <p style={{ color: '#64748b', fontSize: 13 }}>Próxima: <span style={{ color: '#f59e0b' }}>{nextBelt}</span></p> : null}
                <div style={{ marginTop: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span style={{ color: '#64748b', fontSize: 12 }}>Progresso</span><span style={{ color: '#e5e7eb', fontSize: 12, fontWeight: 600 }}>{Math.round(progress)}%</span></div>
                  <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: progress + '%', height: '100%', background: 'linear-gradient(90deg, #ef4444, #f59e0b)', borderRadius: 4 }} /></div>
                  <p style={{ color: '#64748b', fontSize: 11, marginTop: 8 }}>Complete {20 - stats.total} treinos para a próxima faixa</p>
                </div>
              </div>
              <h4 style={{ color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>HISTÓRICO DE GRADUAÇÕES</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {studentGraduations.map((g, i) => (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: 'rgba(17,24,39,0.6)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: beltColors[g.belt], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{i === studentGraduations.length - 1 ? '⭐' : '✓'}</div>
                    <div><p style={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600 }}>Faixa {g.belt}</p><p style={{ color: '#64748b', fontSize: 11 }}>{new Date(g.achievedAt).toLocaleDateString('pt-BR')}</p></div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(17,24,39,0.8)', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid rgba(239,68,68,0.2)' }}><p style={{ color: '#ef4444', fontSize: 24, fontWeight: 700 }}>{stats.total}</p><p style={{ color: '#64748b', fontSize: 11 }}>Total</p></div>
                <div style={{ background: 'rgba(17,24,39,0.8)', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid rgba(245,158,11,0.2)' }}><p style={{ color: '#f59e0b', fontSize: 24, fontWeight: 700 }}>{stats.lastMonth}</p><p style={{ color: '#64748b', fontSize: 11 }}>Este Mês</p></div>
                <div style={{ background: 'rgba(17,24,39,0.8)', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid rgba(34,197,94,0.2)' }}><p style={{ color: '#22c55e', fontSize: 24, fontWeight: 700 }}>{stats.streak}</p><p style={{ color: '#64748b', fontSize: 11 }}>Sequência</p></div>
              </div>
              <div style={{ background: 'rgba(17,24,39,0.6)', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}><p style={{ color: '#64748b', fontSize: 13 }}>Suas presenças são registradas automaticamente pela academia.</p><p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>Total de {stats.total} treinos registrados.</p></div>
            </div>
          )}
          {activeTab === 'notices' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {notices.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}><p>Nenhum aviso no momento.</p></div> : notices.map(notice => (
                <div key={notice.id} style={{ background: notice.priority === 'urgent' ? 'rgba(239,68,68,0.1)' : notice.priority === 'important' ? 'rgba(245,158,11,0.1)' : 'rgba(17,24,39,0.8)', borderRadius: 12, padding: 16, border: notice.priority === 'urgent' ? '1px solid rgba(239,68,68,0.3)' : notice.priority === 'important' ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <h4 style={{ color: '#e5e7eb', fontSize: 15, fontWeight: 600 }}>{notice.title}</h4>
                    {notice.priority !== 'normal' ? <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: 10, fontWeight: 600, background: notice.priority === 'urgent' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)', color: notice.priority === 'urgent' ? '#ef4444' : '#f59e0b' }}>{notice.priority === 'urgent' ? 'URGENTE' : 'IMPORTANTE'}</span> : null}
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>{notice.content}</p>
                  <p style={{ color: '#64748b', fontSize: 11, marginTop: 12 }}>{new Date(notice.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (selectedContract) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
        <div style={{ background: 'rgba(15, 23, 42, 0.97)', backdropFilter: 'blur(20px)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => { setSelectedContract(null); setSignatureConfirmed(false); }} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 700, fontSize: 16, color: '#e5e7eb' }}>Detalhes do Contrato</h2>
        </div>
        <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
          <div style={{ background: 'rgba(17,24,39,0.8)', borderRadius: 16, padding: 24, border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ color: '#e5e7eb', fontSize: 18, fontWeight: 700 }}>{selectedContract.title}</h3>
              <span style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: selectedContract.status === 'signed' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)', color: selectedContract.status === 'signed' ? '#22c55e' : '#f59e0b' }}>{selectedContract.status === 'signed' ? 'ASSINADO' : 'PENDENTE'}</span>
            </div>
            <div style={{ background: 'rgba(2,6,23,0.6)', borderRadius: 12, padding: 20, marginBottom: 20, maxHeight: 300, overflow: 'auto' }}>
              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.8 }}>{selectedContract.description}</p>
              <p style={{ color: '#64748b', fontSize: 13, marginTop: 20, fontStyle: 'italic' }}>Documento criado em {new Date(selectedContract.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            {selectedContract.status === 'pending' && (
              <div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 16, background: 'rgba(2,6,23,0.6)', borderRadius: 12, cursor: 'pointer', marginBottom: 16 }}>
                  <input type="checkbox" checked={signatureConfirmed} onChange={(e) => setSignatureConfirmed(e.target.checked)} style={{ marginTop: 4 }} />
                  <span style={{ color: '#94a3b8', fontSize: 13 }}>Eu, <strong style={{ color: '#e5e7eb' }}>{currentStudent?.fullName}</strong>, declaro que li e aceito os termos deste contrato conforme a Lei 14.063/2020 sobre assinatura digital.</span>
                </label>
                <button onClick={handleSignContract} disabled={!signatureConfirmed} style={{ width: '100%', padding: '16px 24px', fontSize: 15, fontWeight: 700, background: signatureConfirmed ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(100,100,100,0.3)', border: 'none', borderRadius: 12, color: '#fff', cursor: signatureConfirmed ? 'pointer' : 'not-allowed' }}>✍️ Assinar Digitalmente</button>
              </div>
            )}
            {selectedContract.status === 'signed' && selectedContract.signedAt && (
              <div style={{ padding: 16, background: 'rgba(34,197,94,0.1)', borderRadius: 12, border: '1px solid rgba(34,197,94,0.3)', textAlign: 'center' }}>
                <p style={{ color: '#22c55e', fontSize: 14, fontWeight: 600 }}>✓ Documento assinado em {new Date(selectedContract.signedAt).toLocaleDateString('pt-BR')}</p>
                <p style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>Assinatura digital com validade jurídica</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <div style={{ background: 'rgba(15, 23, 42, 0.97)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        {view !== 'login' ? (
          <button onClick={view === 'dashboard' ? onBack : () => setView('login')} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
        ) : <div style={{ width: 36 }} />}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: '#ef4444', textTransform: 'uppercase' }}>Portal</div>
          <h2 style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: 800, fontSize: 18, color: '#e5e7eb', letterSpacing: '-0.01em', lineHeight: 1 }}>{view === 'login' ? 'App do Aluno' : view === 'register' ? 'Cadastro' : currentStudent?.fullName}</h2>
        </div>
        {view === 'dashboard' ? <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', background: 'rgba(34,197,94,0.1)', borderRadius: 20, border: '1px solid rgba(34,197,94,0.2)' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /><span style={{ color: '#22c55e', fontSize: 11, fontWeight: 600 }}>ONLINE</span></div> : null}
      </div>
      {view === 'login' ? renderLogin() : view === 'register' ? renderRegister() : renderDashboard()}
    </div>
  );
};

export default StudentApp;
