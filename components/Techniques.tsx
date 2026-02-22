import React, { useState, useEffect } from 'react';

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

interface TechniquesProps {
  onBack: () => void;
}

const CATEGORIES = [
  'Posição',
  'Passagem de Guarda',
  'Raspagem',
  'Finalização',
  'Defesa',
  'Transição',
  'Controle',
  'Strangulamento',
  'Imobilização'
];

const MODALITIES = ['Jiu-Jitsu', 'MMA', 'Judô', 'Luta Livre'];

const Techniques: React.FC<TechniquesProps> = ({ onBack }) => {
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModality, setSelectedModality] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('tatamex_techniques');
    if (saved) {
      setTechniques(JSON.parse(saved));
    } else {
      // Banco de técnicas de exemplo
      const exampleTechniques: Technique[] = [
        { id: '1', name: 'Guarda Fechada', description: 'Posição clássica de controle no Jiu-Jitsu onde o praticante envolve as pernas ao redor do oponente.', category: 'Posição', modality: 'Jiu-Jitsu', difficulty: 'Iniciante', isFavorite: true },
        { id: '2', name: 'Passagem de Guarda Spider', description: 'Técnica de passagem utilizando os cotovelos dentro da guarda do oponente.', category: 'Passagem de Guarda', modality: 'Jiu-Jitsu', difficulty: 'Intermediário', isFavorite: false },
        { id: '3', name: 'Triângulo', description: 'Finalização utilizando as pernas para estrangular o oponente em forma de triângulo.', category: 'Strangulamento', modality: 'Jiu-Jitsu', difficulty: 'Intermediário', videoUrl: 'https://youtube.com', isFavorite: true },
        { id: '4', name: 'Mata-leão', description: 'Uma das finalizações mais poderosas, estrangulamento com as pernas ao redor do pescoço.', category: 'Strangulamento', modality: 'Jiu-Jitsu', difficulty: 'Iniciante', isFavorite: true },
        { id: '5', name: 'Americana', description: 'Finalização que visa a articulação do ombro através de alavanca.', category: 'Finalização', modality: 'Jiu-Jitsu', difficulty: 'Iniciante', isFavorite: false },
        { id: '6', name: 'Kimura', description: 'Finalização clássica que utiliza o braço do oponente para alavancar o ombro.', category: 'Finalização', modality: 'Jiu-Jitsu', difficulty: 'Iniciante', isFavorite: false },
        { id: '7', name: 'Raspagem X', description: 'Técnica de raspagem utilizando as pernas em formato de X para desestabilizar.', category: 'Raspagem', modality: 'Jiu-Jitsu', difficulty: 'Intermediário', isFavorite: false },
        { id: '8', name: 'Omoplata', description: 'Finalização que estrangula utilizando o ombro e o antebraço ao redor do pescoço.', category: 'Strangulamento', modality: 'Jiu-Jitsu', difficulty: 'Avançado', isFavorite: false },
        { id: '9', name: 'Arm Lock', description: 'Finalização que visa a articulação do cotovelo.', category: 'Finalização', modality: 'MMA', difficulty: 'Iniciante', isFavorite: false },
        { id: '10', name: 'Guarda de Borboleta', description: 'Posição de guarda com as pernas entre as do oponente e tornozelos cruzados.', category: 'Posição', modality: 'Jiu-Jitsu', difficulty: 'Iniciante', isFavorite: false },
        { id: '11', name: 'Raspagem de Lapela', description: 'Utilização da lapela do kimono para executar a raspagem.', category: 'Raspagem', modality: 'Jiu-Jitsu', difficulty: 'Intermediário', isFavorite: false },
        { id: '12', name: 'Choke Tríplice', description: 'Estrangulamento utilizando ambas as lapelas em movimento de tesoura.', category: 'Strangulamento', modality: 'Judô', difficulty: 'Avançado', isFavorite: false },
      ];
      setTechniques(exampleTechniques);
      localStorage.setItem('tatamex_techniques', JSON.stringify(exampleTechniques));
    }
  }, []);

  const saveTechniques = (newTechniques: Technique[]) => {
    setTechniques(newTechniques);
    localStorage.setItem('tatamex_techniques', JSON.stringify(newTechniques));
  };

  const toggleFavorite = (id: string) => {
    const newTechniques = techniques.map(t => 
      t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
    );
    saveTechniques(newTechniques);
  };

  const deleteTechnique = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta técnica?')) {
      saveTechniques(techniques.filter(t => t.id !== id));
      setSelectedTechnique(null);
    }
  };

  const filteredTechniques = techniques.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesModality = selectedModality === 'all' || t.modality === selectedModality;
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesModality && matchesSearch;
  });

  const favoriteTechniques = techniques.filter(t => t.isFavorite);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'text-green-500 bg-green-500/10';
      case 'Intermediário': return 'text-tatame-gold bg-tatame-gold/10';
      case 'Avançado': return 'text-tatame-red bg-tatame-red/10';
      default: return 'text-zinc-500 bg-zinc-500/10';
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
            🦾 Banco de Técnicas
          </h2>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-tatame-red text-white px-4 py-2 rounded-xl text-xs font-bold uppercase shadow-lg"
        >
          + Nova Técnica
        </button>
      </div>

      {/* Busca */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar técnica..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-tatame-black dark:text-white outline-none focus:border-tatame-red"
        />
      </div>

      {/* Filtros */}
      <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-colors ${
            selectedCategory === 'all' ? 'bg-tatame-red text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}
        >
          Todas
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-colors ${
              selectedCategory === cat ? 'bg-tatame-red text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex space-x-2 mb-4 overflow-x-auto no-scrollbar pb-2">
        {MODALITIES.map(mod => (
          <button
            key={mod}
            onClick={() => setSelectedModality(mod)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase whitespace-nowrap transition-colors ${
              selectedModality === mod ? 'bg-tatame-gold text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
            }`}
          >
            {mod}
          </button>
        ))}
      </div>

      {/* Técnicas Favoritas */}
      {favoriteTechniques.length > 0 && !searchTerm && selectedCategory === 'all' && (
        <div className="mb-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-tatame-gold mb-3">⭐ Favoritas</h3>
          <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-2">
            {favoriteTechniques.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTechnique(t)}
                className="flex-shrink-0 bg-white dark:bg-zinc-900 rounded-xl p-3 border-2 border-tatame-gold/30 min-w-[150px]"
              >
                <div className="font-bold text-sm text-tatame-black dark:text-tatame-white truncate">{t.name}</div>
                <div className="text-[10px] text-zinc-500">{t.category}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Técnicas */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredTechniques.map(technique => (
            <div
              key={technique.id}
              onClick={() => setSelectedTechnique(technique)}
              className="bg-white dark:bg-zinc-900 rounded-xl p-4 border-2 border-zinc-100 dark:border-zinc-800 hover:border-tatame-red/30 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-black text-tatame-black dark:text-tatame-white">{technique.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{technique.description}</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(technique.id); }}
                  className={`p-1 ${technique.isFavorite ? 'text-tatame-gold' : 'text-zinc-300'}`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center space-x-2 mt-3">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${getDifficultyColor(technique.difficulty)}`}>
                  {technique.difficulty}
                </span>
                <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[8px] font-bold uppercase text-zinc-500">
                  {technique.modality}
                </span>
                <span className="px-2 py-0.5 bg-tatame-red/10 rounded-full text-[8px] font-bold uppercase text-tatame-red">
                  {technique.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredTechniques.length === 0 && (
          <div className="text-center py-12 opacity-30">
            <span className="text-4xl mb-4 block">🦾</span>
            <p className="font-bold uppercase tracking-widest text-xs">Nenhuma técnica encontrada</p>
          </div>
        )}
      </div>

      {/* Modal Detalhes da Técnica */}
      {selectedTechnique && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setSelectedTechnique(null)}>
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-2xl p-6 animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-black uppercase text-tatame-black dark:text-tatame-white">{selectedTechnique.name}</h3>
              <button onClick={() => setSelectedTechnique(null)} className="text-zinc-400 hover:text-tatame-red">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getDifficultyColor(selectedTechnique.difficulty)}`}>
                {selectedTechnique.difficulty}
              </span>
              <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold uppercase text-zinc-500">
                {selectedTechnique.modality}
              </span>
              <span className="px-3 py-1 bg-tatame-red/10 rounded-full text-xs font-bold uppercase text-tatame-red">
                {selectedTechnique.category}
              </span>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">{selectedTechnique.description}</p>

            {selectedTechnique.videoUrl && (
              <a 
                href={selectedTechnique.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-tatame-red text-white py-3 rounded-xl font-bold uppercase text-sm mb-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Ver Vídeo</span>
              </a>
            )}

            <div className="flex space-x-3">
              <button 
                onClick={() => toggleFavorite(selectedTechnique.id)}
                className={`flex-1 py-3 rounded-xl font-bold uppercase text-xs ${selectedTechnique.isFavorite ? 'bg-tatame-gold text-black' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
              >
                {selectedTechnique.isFavorite ? '⭐ Favorito' : '☆ Favoritar'}
              </button>
              <button 
                onClick={() => deleteTechnique(selectedTechnique.id)}
                className="px-4 py-3 bg-tatame-red/10 text-tatame-red rounded-xl font-bold uppercase text-xs"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Técnica */}
      {showAddModal && <AddTechniqueModal onClose={() => setShowAddModal(false)} onSave={(t) => {
        saveTechniques([...techniques, { ...t, id: `tech_${Date.now()}` }]);
        setShowAddModal(false);
      }} />}
    </div>
  );
};

interface AddTechniqueModalProps {
  onClose: () => void;
  onSave: (technique: Technique) => void;
}

const AddTechniqueModal: React.FC<AddTechniqueModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [modality, setModality] = useState(MODALITIES[0]);
  const [difficulty, setDifficulty] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Iniciante');
  const [videoUrl, setVideoUrl] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: '',
      name: name.trim(),
      description: description.trim(),
      category,
      modality,
      difficulty,
      videoUrl: videoUrl.trim() || undefined,
      isFavorite: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 z-[60]" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-black uppercase text-tatame-black dark:text-tatame-white">Nova Técnica</h3>
        
        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Nome</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red" placeholder="Ex: Triângulo" />
        </div>
        
        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Descrição</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red h-20 resize-none" placeholder="Descreva a técnica..." />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Categoria</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Modalidade</label>
            <select value={modality} onChange={(e) => setModality(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red">
              {MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        
        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">Dificuldade</label>
          <div className="flex space-x-2">
            {(['Iniciante', 'Intermediário', 'Avançado'] as const).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${difficulty === d ? 'bg-tatame-red text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                {d}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="text-xs font-bold uppercase text-zinc-500 mb-1 block">URL do Vídeo (opcional)</label>
          <input type="url" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 text-tatame-black dark:text-white outline-none focus:border-tatame-red" placeholder="https://youtube.com/..." />
        </div>
        
        <div className="flex space-x-3 pt-2">
          <button onClick={onClose} className="flex-1 py-3 bg-zinc-200 dark:bg-zinc-800 rounded-xl font-bold uppercase text-xs text-tatame-black dark:text-white">Cancelar</button>
          <button onClick={handleSave} className="flex-1 py-3 bg-tatame-red rounded-xl font-bold uppercase text-xs text-white">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default Techniques;
