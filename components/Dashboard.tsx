import React, { useState, useEffect, useMemo } from 'react';

interface DashboardProps {
  onBack: () => void;
}

interface ClassRecord {
  id: string;
  date: string;
  className: string;
  modality: string;
  studentsPresent: string[];
  techniques: string[];
}

interface AttendanceRecord {
  [dateKey: string]: string[];
}

interface Student {
  id: string;
  classId: string;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [classHistory, setClassHistory] = useState<ClassRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord>({});
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  useEffect(() => {
    // Carregar dados
    const savedHistory = localStorage.getItem('tatamex_class_history');
    if (savedHistory) setClassHistory(JSON.parse(savedHistory));

    const savedAttendance = localStorage.getItem('tatamex_attendance');
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance));

    const savedStudents = localStorage.getItem('tatamex_students');
    if (savedStudents) setStudents(JSON.parse(savedStudents));
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getTime() - (selectedPeriod * 24 * 60 * 60 * 1000));
    
    // Filtrar aulas do período
    const periodClasses = classHistory.filter(c => new Date(c.date) >= startDate);
    
    // Total de aulas
    const totalClasses = periodClasses.length;
    
    // Total de alunos únicos
    const allStudents = new Set<string>();
    Object.values(attendance).forEach(list => list.forEach(id => allStudents.add(id)));
    const totalStudents = students.length;
    
    // Presenças únicas no período
    const uniquePresences = new Set<string>();
    Object.entries(attendance).forEach(([date, list]) => {
      if (new Date(date) >= startDate) {
        list.forEach(id => uniquePresences.add(id));
      }
    });
    const uniqueStudentsPresent = uniquePresences.size;
    
    // Frequência média
    const totalPresences = Object.entries(attendance)
      .filter(([date]) => new Date(date) >= startDate)
      .reduce((acc, [_, list]) => acc + list.length, 0);
    const frequencyAvg = totalStudents > 0 ? Math.round((totalPresences / totalStudents) * 100 / (selectedPeriod / 30)) : 0;
    
    // Técnicas mais usadas
    const techniqueCount: { [key: string]: number } = {};
    periodClasses.forEach(c => {
      c.techniques.forEach(t => {
        techniqueCount[t] = (techniqueCount[t] || 0) + 1;
      });
    });
    const topTechniques = Object.entries(techniqueCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tech, count]) => ({ tech, count }));
    
    // Aulas por mês (evolução)
    const monthlyStats: { [key: string]: number } = {};
    periodClasses.forEach(c => {
      const month = c.date.substring(0, 7);
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });
    const monthlyEvolution = Object.entries(monthlyStats)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short' }),
        count
      }));
    
    // Turmas mais ativas
    const classCount: { [key: string]: number } = {};
    periodClasses.forEach(c => {
      classCount[c.className] = (classCount[c.className] || 0) + 1;
    });
    const topClasses = Object.entries(classCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([className, count]) => ({ className, count }));
    
    return {
      totalClasses,
      totalStudents,
      uniqueStudentsPresent,
      frequencyAvg,
      topTechniques,
      monthlyEvolution,
      topClasses
    };
  }, [classHistory, attendance, students, selectedPeriod]);

  const getMaxValue = (arr: { count: number }[]) => Math.max(...arr.map(a => a.count), 1);

  const metricCards = [
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      ),
      label: 'Aulas Ministradas',
      value: stats.totalClasses,
      sub: `Últimos ${selectedPeriod}d`,
      accent: '#ef4444',
      accentBg: 'rgba(239,68,68,0.1)',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
      label: 'Total de Alunos',
      value: stats.totalStudents,
      sub: 'Cadastrados',
      accent: '#60a5fa',
      accentBg: 'rgba(96,165,250,0.1)',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
      label: 'Alunos Ativos',
      value: stats.uniqueStudentsPresent,
      sub: 'Presentes no período',
      accent: '#22c55e',
      accentBg: 'rgba(34,197,94,0.1)',
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
      ),
      label: 'Frequência Média',
      value: `${stats.frequencyAvg}%`,
      sub: 'Taxa de presença',
      accent: '#f59e0b',
      accentBg: 'rgba(245,158,11,0.1)',
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#94a3b8',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
              (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)';
              (e.currentTarget as HTMLButtonElement).style.color = '#94a3b8';
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', color: '#ef4444', textTransform: 'uppercase' }}>
              Análise
            </div>
            <h2 style={{
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 800,
              fontSize: 18,
              color: '#e5e7eb',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}>
              Insights & Estatísticas
            </h2>
          </div>
        </div>
        
        {/* Seletor de Período */}
        <div style={{
          display: 'flex',
          gap: 4,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 10,
          padding: 4,
        }}>
          {[7, 30, 90].map(days => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              style={{
                padding: '5px 12px',
                borderRadius: 7,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: selectedPeriod === days ? '#ef4444' : 'transparent',
                color: selectedPeriod === days ? 'white' : '#64748b',
                border: 'none',
                boxShadow: selectedPeriod === days ? '0 0 10px rgba(239,68,68,0.4)' : 'none',
              }}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar" style={{ padding: '20px 16px 80px' }}>
        
        {/* Cards de Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {metricCards.map((card, i) => (
            <div
              key={i}
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${card.accentBg}`,
                borderRadius: 14,
                padding: '16px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Top accent */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`,
              }}/>
              
              <div className="flex items-center justify-between mb-3">
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 9,
                  background: card.accentBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: card.accent,
                }}>
                  {card.icon}
                </div>
                <div style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: card.accent,
                  textTransform: 'uppercase',
                  opacity: 0.8,
                }}>
                  {card.sub}
                </div>
              </div>
              
              <div style={{
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 800,
                fontSize: 28,
                color: '#e5e7eb',
                lineHeight: 1,
                marginBottom: 4,
              }}>
                {card.value}
              </div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Evolução Mensal */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: '20px',
          marginBottom: 16,
        }}>
          <div className="flex items-center gap-2 mb-5">
            <div style={{
              width: 3,
              height: 16,
              background: '#ef4444',
              borderRadius: 2,
              boxShadow: '0 0 8px rgba(239,68,68,0.6)',
            }}/>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Evolução de Aulas
            </h3>
          </div>
          {stats.monthlyEvolution.length > 0 ? (
            <div className="flex items-end gap-2" style={{ height: 120 }}>
              {stats.monthlyEvolution.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div style={{
                    width: '100%',
                    height: `${(item.count / getMaxValue(stats.monthlyEvolution)) * 100}%`,
                    background: 'linear-gradient(180deg, #ef4444, rgba(239,68,68,0.4))',
                    borderRadius: '4px 4px 0 0',
                    transition: 'all 0.5s ease',
                    boxShadow: '0 0 10px rgba(239,68,68,0.2)',
                    minHeight: 4,
                  }}/>
                  <span style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569', fontSize: 13 }}>
              Sem dados suficientes
            </div>
          )}
        </div>

        {/* Técnicas Mais Usadas */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: '20px',
          marginBottom: 16,
        }}>
          <div className="flex items-center gap-2 mb-5">
            <div style={{
              width: 3,
              height: 16,
              background: '#f59e0b',
              borderRadius: 2,
              boxShadow: '0 0 8px rgba(245,158,11,0.6)',
            }}/>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Técnicas Mais Usadas
            </h3>
          </div>
          {stats.topTechniques.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.topTechniques.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#ef4444',
                      flexShrink: 0,
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>{item.tech}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 80,
                      height: 4,
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(item.count / getMaxValue(stats.topTechniques)) * 100}%`,
                        background: 'linear-gradient(90deg, #ef4444, #f97316)',
                        borderRadius: 2,
                      }}/>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', minWidth: 24, textAlign: 'right' }}>
                      {item.count}x
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569', fontSize: 13 }}>
              Nenhuma técnica registrada
            </div>
          )}
        </div>

        {/* Turmas Mais Ativas */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 14,
          padding: '20px',
          marginBottom: 16,
        }}>
          <div className="flex items-center gap-2 mb-5">
            <div style={{
              width: 3,
              height: 16,
              background: '#22c55e',
              borderRadius: 2,
              boxShadow: '0 0 8px rgba(34,197,94,0.6)',
            }}/>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Turmas Mais Ativas
            </h3>
          </div>
          {stats.topClasses.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {stats.topClasses.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 7,
                      background: 'rgba(34,197,94,0.1)',
                      border: '1px solid rgba(34,197,94,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 800,
                      color: '#22c55e',
                      flexShrink: 0,
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e7eb' }}>{item.className}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div style={{
                      width: 80,
                      height: 4,
                      background: 'rgba(255,255,255,0.06)',
                      borderRadius: 2,
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${(item.count / getMaxValue(stats.topClasses)) * 100}%`,
                        background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                        borderRadius: 2,
                      }}/>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', minWidth: 24, textAlign: 'right' }}>
                      {item.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#475569', fontSize: 13 }}>
              Nenhuma aula registrada
            </div>
          )}
        </div>

        {/* Insights */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(220,38,38,0.06) 100%)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 14,
          padding: '20px',
        }}>
          <div className="flex items-center gap-2 mb-4">
            <div style={{
              width: 3,
              height: 16,
              background: '#ef4444',
              borderRadius: 2,
              boxShadow: '0 0 8px rgba(239,68,68,0.6)',
            }}/>
            <h3 style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#ef4444', textTransform: 'uppercase' }}>
              Insights
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stats.totalClasses > 0 && stats.frequencyAvg < 50 && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                <span style={{ fontSize: 12, color: '#e5e7eb', lineHeight: 1.5 }}>
                  Frequência abaixo de 50%. Considere estratégias para aumentar a presença dos alunos.
                </span>
              </div>
            )}
            {stats.topTechniques.length > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>🎯</span>
                <span style={{ fontSize: 12, color: '#e5e7eb', lineHeight: 1.5 }}>
                  Sua técnica mais usada é <strong style={{ color: '#ef4444' }}>{stats.topTechniques[0]?.tech}</strong>. Continue evoluindo!
                </span>
              </div>
            )}
            {stats.totalClasses > 0 && stats.frequencyAvg >= 70 && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                background: 'rgba(34,197,94,0.08)',
                border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>🏆</span>
                <span style={{ fontSize: 12, color: '#e5e7eb', lineHeight: 1.5 }}>
                  Excelente! Sua academia tem uma média de frequência de <strong style={{ color: '#22c55e' }}>{stats.frequencyAvg}%</strong>!
                </span>
              </div>
            )}
            {stats.totalClasses === 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: '10px 12px',
                background: 'rgba(96,165,250,0.08)',
                border: '1px solid rgba(96,165,250,0.2)',
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>📝</span>
                <span style={{ fontSize: 12, color: '#e5e7eb', lineHeight: 1.5 }}>
                  Comece a registrar suas aulas para obter insights personalizados.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
