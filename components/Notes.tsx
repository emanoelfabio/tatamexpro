import React, { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  category: 'aluno' | 'turma' | 'técnica' | 'geral';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotesProps {
  onBack: () => void;
}

const CATEGORIES = [
  { value: 'aluno', label: 'Aluno', icon: '👤' },
  { value: 'turma', label: 'Turma', icon: '👥' },
  { value: 'técnica', label: 'Técnica', icon: '🦾' },
  { value: 'geral', label: 'Geral', icon: '📝' }
];

const Notes: React.FC<NotesProps> = ({ onBack }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('tatamex_notes');
    if (saved) {
      setNotes(JSON.parse(saved));
    } else {
      const exampleNotes: Note[] = [
        {
          id: '1',
          title: 'João Silva - Progresso',
          content: 'João está evoluindo bem no triângulo. Precisa trabalhar mais a flexibilidade e a transição para a posição de cima. Na próxima semana focar em defesa de costa.',
          category: 'aluno',
          tags: ['joão', 'triângulo', 'progresso'],
          createdAt: '2024-02-10T10:00:00',
          updatedAt: '2024-02-10T10:00:00'
        },
        {
          id: '2',
          title: 'Adulto Avançado - Observações',
          content: 'Turma muito competitiva. Precisa equilibrar mais o tempo entre técnica e sparring. Alguns alunos estão fatigando rápido na parte final.',
          category: 'turma',
          tags: ['adulto', 'avançado', 'competitivo'],
          createdAt: '2024-02-08T14:30:00',
          updatedAt: '2024-02-08T14:30:00'
        },
        {
          id: '3',
          title: 'Triângulo - Detalhes',
          content: 'Para um triângulo eficiente: 1) Perna de cima precisa passar a cabeça 2) Joelhos devem estar alinhados 3) Usar o quadril para fechar o ângulo.',
          category: 'técnica',
          tags: ['triângulo', 'detalhes', 'strangulamento'],
          createdAt: '2024-02-05T09:15:00',
          updatedAt: '2024-02-05T09:15:00'
        },
        {
          id: '4',
          title: 'Metodologia de Ensino',
          content: 'Sempre iniciar com demonstração visual, depois explicar os fundamentos, deixar praticar e corrigir individualmente. Manter energia alta durante toda a aula.',
          category: 'geral',
          tags: ['metodologia', 'ensino', 'dicas'],
          createdAt: '2024-01-20T11:00:00',
          updatedAt: '2024-01-20T11:00:00'
        },
      ];
      setNotes(exampleNotes);
      localStorage.setItem('tatamex_notes', JSON.stringify(exampleNotes));
    }
  }, []);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem('tatamex_notes', JSON.stringify(newNotes));
  };

  const filteredNotes = notes.filter(n => {
    const matchesCategory = selectedCategory === 'all' || n.category === selectedCategory;
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          n.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const createNote = () => {
    const newNote: Note = {
      id: '',
      title: '',
      content: '',
      category: 'geral',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingNote(newNote);
    setShowEditModal(true);
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setShowEditModal(true);
  };

  const saveNote = (savedNote: Note) => {
    const noteWithId = { ...savedNote, id: savedNote.id || `note_${Date.now()}`, updatedAt: new Date().toISOString() };
    if (savedNote.id) {
      saveNotes(notes.map(n => n.id === savedNote.id ? noteWithId : n));
    } else {
      saveNotes([noteWithId, ...notes]);
    }
    setShowEditModal(false);
    setEditingNote(null);
  };

  const deleteNote = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta anotação?')) {
      saveNotes(notes.filter(n => n.id !== id));
      setSelectedNote(null);
    }
  };

  const getCategoryInfo = (category: string) => CATEGORIES.find(c => c.value === category) || CATEGORIES[3];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const notesByCategory = CATEGORIES.slice(1).map(cat => ({
    ...cat,
    count: notes.filter(n => n.category === cat.value).length
  }));

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
            📝 Anotações Pessoais
          </h2>
        </div>
        <button 
          onClick={createNote}
          className="bg-tatame-red text-white px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-lg"
        >
          + Nova Anotação
        </button>
      </div>

      {/* Estatísticas por Categoria */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {notesByCategory.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(selectedCategory === cat.value ? 'all' : cat.value)}
            className={`bg-white dark:bg-zinc-900 rounded-xl p-3 border-2 text-center transition-all ${
              selectedCategory === cat.value ? 'border-tatame-red' : 'border-zinc-100 dark:border-zinc-800'
            }`}
          >
            <span className="text-lg block mb-1">{cat.icon}</span>
            <span className="block text-xs font-bold uppercase text-tatame-black dark:text-tatame-white">{cat.label}</span>
            <span className="text-[10px] text-zinc-500">{cat.count}</span>
          </button>
        ))}
      </div>

      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar anotações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
        />
      </div>

      {/* Lista de Anotações */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {filteredNotes.length > 0 ? (
          <div className="space-y-3">
            {filteredNotes.map(note => {
              const catInfo = getCategoryInfo(note.category);
              return (
                <div 
                  key={note.id} 
                  onClick={() => setSelectedNote(note)}
                  className="bg-white dark:bg-zinc-900 rounded-xl p-4 border-2 border-zinc-100 dark:border-zinc-800 hover:border-tatame-red/30 transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{catInfo.icon}</span>
                      <h4 className="font-black text-tatame-black dark:text-tatame-white">{note.title}</h4>
                    </div>
                    <span className="text-[10px] text-zinc-500">{formatDate(note.updatedAt)}</span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{note.content}</p>
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-tatame-gold/10 text-tatame-gold text-[8px] font-bold uppercase rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 opacity-30">
            <span className="text-4xl mb-4 block">📝</span>
            <p className="font-bold uppercase tracking-widest text-xs">Nenhuma anotação encontrada</p>
          </div>
        )}
      </div>

      {/* Modal Visualizar Anotação */}
      {selectedNote && !showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setSelectedNote(null)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getCategoryInfo(selectedNote.category).icon}</span>
                <h3 className="text-lg font-black uppercase text-tatame-black dark:text-tatame-white">{selectedNote.title}</h3>
              </div>
              <button onClick={() => setSelectedNote(null)} className="text-zinc-400 hover:text-tatame-red">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 whitespace-pre-wrap">{selectedNote.content}</p>

            <div className="flex flex-wrap gap-1 mb-4">
              {selectedNote.tags.map((tag, i) => (
                <span key={i} className="px-2 py-0.5 bg-tatame-gold/10 text-tatame-gold text-[10px] font-bold uppercase rounded-full">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="text-[10px] text-zinc-500 mb-4">
              Criado: {formatDate(selectedNote.createdAt)} • Atualizado: {formatDate(selectedNote.updatedAt)}
            </div>

            <div className="flex space-x-3">
              <button 
                onClick={() => { setSelectedNote(null); editNote(selectedNote); }}
                className="flex-1 py-3 bg-tatame-gold text-black rounded-xl font-bold uppercase text-xs"
              >
                ✏️ Editar
              </button>
              <button 
                onClick={() => deleteNote(selectedNote.id)}
                className="px-4 py-3 bg-tatame-red/10 text-tatame-red rounded-xl font-bold uppercase text-xs"
              >
                🗑️ Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar/Criar Anotação */}
      {showEditModal && editingNote && (
        <NoteEditor 
          note={editingNote} 
          onSave={saveNote} 
          onClose={() => { setShowEditModal(false); setEditingNote(null); }} 
        />
      )}
    </div>
  );
};

interface NoteEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onSave, onClose }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [category, setCategory] = useState(note.category);
  const [tagsInput, setTagsInput] = useState(note.tags.join(', '));

  const handleSave = () => {
    if (!title.trim()) return;
    const tags = tagsInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    onSave({
      ...note,
      title: title.trim(),
      content: content.trim(),
      category: category as any,
      tags
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-[60]" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-black uppercase text-tatame-black dark:text-tatame-white">
          {note.id ? 'Editar Anotação' : 'Nova Anotação'}
        </h3>
        
        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Título</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
            placeholder="Ex: Observações sobre o João"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Categoria</label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.slice(1).map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value as any)}
                className={`py-2 rounded-lg text-xs font-bold uppercase transition-colors ${
                  category === cat.value ? 'bg-tatame-red text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                }`}
              >
                {cat.icon}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Conteúdo</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red h-32 resize-none"
            placeholder="Escreva suas observações..."
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Tags (separadas por vírgula)</label>
          <input 
            type="text" 
            value={tagsInput} 
            onChange={(e) => setTagsInput(e.target.value)} 
            className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
            placeholder="Ex: joão, progresso, triângulo"
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

export default Notes;
