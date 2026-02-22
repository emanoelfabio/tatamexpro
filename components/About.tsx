
import React from 'react';

interface AboutProps {
  onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
  return (
    <div className="flex-1 flex flex-col p-6 max-w-lg mx-auto w-full animate-in slide-in-from-right duration-300 overflow-y-auto no-scrollbar">
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tight ml-2">Sobre a Equipe</h2>
      </div>

      <div className="space-y-8">
        <div className="relative rounded-3xl overflow-hidden aspect-video">
           <img src="https://lh3.googleusercontent.com/-kvV4vd5sxjnmVQ-wyCyUiQxs3Sue1Szh5RPX3BGEYD247NTkKTfPdzvRDKLepnJ3EgYgujO6F9f3tTfDQ=s265-w265-h265" alt="Team" className="object-cover w-full h-full grayscale" />
           <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
           <div className="absolute bottom-4 left-4">
             <span className="px-3 py-1 bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">Premium Training</span>
           </div>
        </div>

        
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-red-500">Professor Fábio Sousa</h3>
          <p className="text-zinc-400 leading-relaxed italic">
            "Faixa Preta de JiuJitsu, Faixa Preta de Luta Livre Esportiva, Prajied Preto de Muay Thai"
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold text-red-500">Filosofia Academia Fábio Sousa de Artes Marciais</h3>
          <p className="text-zinc-400 leading-relaxed italic">
            "O Jiu-Jitsu não é apenas sobre técnica; é sobre o refinamento constante do caráter através da adversidade no tatame."
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-bold">Nossa História</h3>
          <p className="text-zinc-400 leading-relaxed">
            Fundada com o propósito de levar o treinamento de alta performance para todos os níveis, a Conceito Jiu-Jitsu utiliza tecnologia e metodologia moderna para formar campeões dentro e fora do tatame.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 p-4 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Instagram</span>
          </a>
          <a 
            href="mailto:contato@exemplo.com"
            className="flex items-center justify-center space-x-2 p-4 bg-zinc-900 rounded-2xl hover:bg-zinc-800 transition-colors"
          >
            <span className="text-xs font-bold uppercase tracking-widest">Contato</span>
          </a>
        </div>
      </div>

      <div className="mt-12 text-center text-zinc-600 text-[10px] uppercase tracking-[0.3em] pb-8">
        Designed for High Performance
      </div>
    </div>
  );
};

export default About;
