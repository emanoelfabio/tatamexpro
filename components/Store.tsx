
import React, { useState } from 'react';

interface StoreItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'kimonos' | 'acessorios' | 'suplementacao';
  tag?: 'mais-vendido' | 'em-promocao' | 'novo';
}

interface StoreProps {
  onBack: () => void;
}

const STORE_ITEMS: StoreItem[] = [
  { id: 'k1', name: 'Kimono Vulkan Pro White', price: 499.90, category: 'kimonos', image: '🥋', tag: 'mais-vendido' },
  { id: 'k2', name: 'Kimono Koral Light Black', price: 549.90, category: 'kimonos', image: '🥋' },
  { id: 'k3', name: 'Kimono TatameX Edition Blue', price: 620.00, category: 'kimonos', image: '🥋', tag: 'novo' },
  { id: 'a1', name: 'Faixa Preta Premium', price: 89.90, category: 'acessorios', image: '🎗️', tag: 'mais-vendido' },
  { id: 'a2', name: 'Rashguard Stealth Long', price: 159.90, category: 'acessorios', image: '👕', tag: 'em-promocao' },
  { id: 'a3', name: 'Bolsa de Treino 40L', price: 210.00, category: 'acessorios', image: '🎒' },
  { id: 's1', name: 'Whey Protein Isolate 900g', price: 189.90, category: 'suplementacao', image: '🥤' },
  { id: 's2', name: 'Creatina Monohidratada 300g', price: 99.90, category: 'suplementacao', image: '⚡', tag: 'em-promocao' },
  { id: 's3', name: 'Pre-workout Explosive', price: 129.90, category: 'suplementacao', image: '🔥', tag: 'mais-vendido' },
];

const Store: React.FC<StoreProps> = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState<'kimonos' | 'acessorios' | 'suplementacao'>('kimonos');

  const filteredItems = STORE_ITEMS.filter(item => item.category === activeCategory);

  const handleBuy = (itemName: string) => {
    const message = `Olá! Tenho interesse no produto: ${itemName}`;
    window.open(`https://wa.me/550000000000?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getTagStyle = (tag: string) => {
    switch (tag) {
      case 'mais-vendido': return 'bg-tatame-red text-white';
      case 'em-promocao': return 'bg-green-600 text-white';
      case 'novo': return 'bg-tatame-gold text-tatame-black';
      default: return 'bg-zinc-500 text-white';
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full animate-in slide-in-from-right duration-300 bg-tatame-white dark:bg-tatame-black overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-tatame-red transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg></button>
          <h2 className="text-2xl font-black uppercase tracking-tight ml-2">Marketplace</h2>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 overflow-x-auto no-scrollbar pb-2">
        {(['kimonos', 'acessorios', 'suplementacao'] as const).map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap border-2 ${activeCategory === cat ? 'bg-tatame-red border-tatame-red text-white shadow-lg' : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'}`}>{cat}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-100 dark:border-zinc-800 flex flex-col shadow-sm group animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="w-full aspect-square bg-zinc-50 dark:bg-zinc-950 rounded-2xl flex items-center justify-center text-5xl mb-4 group-hover:scale-105 transition-transform border border-zinc-100 dark:border-zinc-800">
                {item.image}
              </div>
              <div className="flex-1">
                {item.tag && (
                  <span className={`inline-block text-[7px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full mb-2 ${getTagStyle(item.tag)}`}>
                    {item.tag.replace('-', ' ')}
                  </span>
                )}
                <h3 className="text-sm font-black uppercase tracking-tighter text-tatame-black dark:text-tatame-white leading-tight mb-2 truncate">
                  {item.name}
                </h3>
                <p className="text-tatame-red font-black text-lg">
                  R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <button onClick={() => handleBuy(item.name)} className="mt-4 w-full py-3 bg-tatame-black dark:bg-tatame-white text-white dark:text-tatame-black rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md">Comprar</button>
            </div>
          ))}
        </div>
        {filteredItems.length === 0 && <div className="py-20 text-center opacity-30"><p className="font-bold uppercase text-[10px] tracking-widest">Nenhum produto encontrado</p></div>}
      </div>

      <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-tatame-gold">Equipamentos Oficiais • OSS</p>
      </div>
    </div>
  );
};

export default Store;
