
import { WorkoutConfig } from './types';

export interface Announcement {
  title: string;
  subtitle: string;
  image?: string;
  accentColor?: string;
}

export const AD_DATABASE = {
  ROUND: [
    { title: "Kimonos Premium", subtitle: "Nova coleção disponível na recepção", accentColor: "red" },
    { title: "Hydra-Pro", subtitle: "Mantenha a performance. Beba água.", accentColor: "blue" },
    { title: "Foco Total", subtitle: "Respire pelo nariz, controle o ritmo.", accentColor: "zinc" }
  ],
  REST: [
    { title: "Seminário de Verão", subtitle: "Inscrições abertas - 20/08", accentColor: "red" },
    { title: "Plano Semestral", subtitle: "Ganhe 15% de desconto. Consulte a secretaria.", accentColor: "green" },
    { title: "Recuperação Ativa", subtitle: "Solte os braços, normalize a respiração.", accentColor: "blue" }
  ],
  SLOGANS: [
    { title: "NÃO PARE!", subtitle: "A vitória exige sacrifício.", accentColor: "red" },
    { title: "A HORA É AGORA!", subtitle: "Dê o seu máximo no final!", accentColor: "red" },
    { title: "ESPÍRITO DE GUERREIRO", subtitle: "Sua mente comanda o seu corpo.", accentColor: "red" }
  ]
};

export const OFFICIAL_CURRICULUM = [
  { week: 1, lessons: [
    { id: 1, title: "Aula 1: Introdução ao Jiu-Jitsu, regras, disciplina e prevenção de conflitos" },
    { id: 2, title: "Aula 2: Movimentos básicos (rolamentos, fuga de quadril, levantada técnica)" },
    { id: 3, title: "Aula 3 (Defesa Pessoal + Finalização): Postura defensiva, empurrões e estrangulamento simples de controle" }
  ]},
  { week: 2, lessons: [
    { id: 4, title: "Aula 4: 100 kilos (1 e 2)" },
    { id: 5, title: "Aula 5: 100 kilos (3 e 4) + joelho na barriga" },
    { id: 6, title: "Aula 6 (Defesa Pessoal + Finalização): Proteção no chão + americana do 100 kilos" }
  ]},
  { week: 3, lessons: [
    { id: 7, title: "Aula 7: Montada a partir do 100 kilos" },
    { id: 8, title: "Aula 8: Saídas da montada" },
    { id: 9, title: "Aula 9 (Defesa Pessoal + Finalização): Controle na montada + arm lock da montada" }
  ]},
  { week: 4, lessons: [
    { id: 10, title: "Aula 10: Americana e arm lock da montada" },
    { id: 11, title: "Aula 11: Pegada de costas" },
    { id: 12, title: "Aula 12 (Defesa Pessoal + Finalização): Situação real na montada + mata-leão" }
  ]},
  { week: 5, lessons: [
    { id: 13, title: "Aula 13: Guarda fechada" },
    { id: 14, title: "Aula 14: Arm lock da guarda" },
    { id: 15, title: "Aula 15 (Defesa Pessoal + Finalização): Defesa de socos no solo + estrangulamento cruzado" }
  ]},
  { week: 6, lessons: [
    { id: 16, title: "Aula 16: Raspagem balão" },
    { id: 17, title: "Aula 17: Raspagem tesoura" },
    { id: 18, title: "Aula 18 (Defesa Pessoal + Finalização): Raspar e levantar + arm lock por cima" }
  ]},
  { week: 7, lessons: [
    { id: 19, title: "Aula 19: Estourada da guarda" },
    { id: 20, title: "Aula 20: Estourada em pé" },
    { id: 21, title: "Aula 21 (Defesa Pessoal + Finalização): Criar espaço e fugir + guillotine básica" }
  ]},
  { week: 8, lessons: [
    { id: 22, title: "Aula 22: Reposição de guarda" },
    { id: 23, title: "Aula 23: Revisão guarda fechada" },
    { id: 24, title: "Aula 24 (Defesa Pessoal + Finalização): Controle de agressor maior + kimura básica" }
  ]},
  { week: 9, lessons: [
    { id: 25, title: "Aula 25: Guarda aranha" },
    { id: 26, title: "Aula 26: Triângulo" },
    { id: 27, title: "Aula 27 (Defesa Pessoal + Finalização): Controle de distância + triângulo ajustado" }
  ]},
  { week: 10, lessons: [
    { id: 28, title: "Aula 28: Raspagem de gancho" },
    { id: 29, title: "Aula 29: Raspagem do bolão" },
    { id: 30, title: "Aula 30 (Defesa Pessoal + Finalização): Desequilíbrio real + estrangulamento por cima" }
  ]},
  { week: 11, lessons: [
    { id: 31, title: "Aula 31: Guarda aberta em pé" },
    { id: 32, title: "Aula 32: Guarda aberta em pé" },
    { id: 33, title: "Aula 33 (Defesa Pessoal + Finalização): Avanço agressivo + mata-leão em pé (controle)" }
  ]},
  { week: 12, lessons: [
    { id: 34, title: "Aula 34: Meia guarda" },
    { id: 35, title: "Aula 35: Raspagem de lapela" },
    { id: 36, title: "Aula 36 (Defesa Pessoal + Finalização): Defesa por baixo + estrangulamento da meia" }
  ]},
  { week: 13, lessons: [
    { id: 37, title: "Aula 37: Baiana" },
    { id: 38, title: "Aula 38: Double leg" },
    { id: 39, title: "Aula 39 (Defesa Pessoal + Finalização): Defesa de queda + guillotine defensiva" }
  ]},
  { week: 14, lessons: [
    { id: 40, title: "Aula 40: Kataguruma" },
    { id: 41, title: "Aula 41: Morote Seoi Nage" },
    { id: 42, title: "Aula 42 (Defesa Pessoal + Finalização): Desequilíbrio + arm lock em transição" }
  ]},
  { week: 15, lessons: [
    { id: 43, title: "Aula 43: Pegada de costas" },
    { id: 44, title: "Aula 44: Estrangulamento cruzado" },
    { id: 45, title: "Aula 45 (Defesa Pessoal + Finalização): Controle legal + mata-leão controlado" }
  ]},
  { week: 16, lessons: [
    { id: 46, title: "Aula 46: Saída das costas" },
    { id: 47, title: "Aula 47: Transições" },
    { id: 48, title: "Aula 48 (Defesa Pessoal + Finalização): Defesa de estrangulamento + contra-estrangulamento" }
  ]},
  { week: 17, lessons: [
    { id: 49, title: "Aula 49: Ataques da montada" },
    { id: 50, title: "Aula 50: Estrangulamentos da montada" },
    { id: 51, title: "Aula 51 (Defesa Pessoal + Finalização): Imobilização legal + ezequiel" }
  ]},
  { week: 18, lessons: [
    { id: 52, title: "Aula 52: Joelho na barriga" },
    { id: 53, title: "Aula 53: Saída do joelho na barriga" },
    { id: 54, title: "Aula 54 (Defesa Pessoal + Finalização): Criar espaço + estrangulamento do joelho" }
  ]},
  { week: 19, lessons: [
    { id: 55, title: "Aula 55: Revisão guarda fechada" },
    { id: 56, title: "Aula 56: Revisão guarda aberta" },
    { id: 57, title: "Aula 57 (Defesa Pessoal + Finalização): Cenários urbanos + finalização escolhida pelo professor" }
  ]},
  { week: 20, lessons: [
    { id: 58, title: "Aula 58: Simulado técnico" },
    { id: 59, title: "Aula 59: Avaliação prática" },
    { id: 60, title: "Aula 60 (Defesa Pessoal + Finalização): Simulação final + finalização livre controlada" }
  ]}
];

export const PRESETS: (WorkoutConfig & { emoji: string; description: string })[] = [
  {
    id: 'p1',
    name: 'Aquecimento Padrão',
    roundNames: ['Polichinelo', 'Agachamento', 'Abdominal', 'Flexão', 'Burpee'],
    workTime: 30,
    restTime: 15,
    rounds: 5,
    useSound: true,
    useVibration: true,
    emoji: '🔥',
    description: 'Ideal para elevar a temperatura corporal.'
  },
  {
    id: 'p2',
    name: 'Drill Técnico',
    roundNames: ['Passagem de Guarda', 'Raspagem de Gancho', 'Finalização Costas'],
    workTime: 120,
    restTime: 30,
    rounds: 3,
    useSound: true,
    useVibration: true,
    emoji: '🥋',
    description: 'Foco na repetição perfeita dos movimentos.'
  },
  {
    id: 'p3',
    name: 'Infantil',
    roundNames: ['Caranguejo', 'Jacaré', 'Coelho', 'Gorila', 'Urso', 'Escorpião'],
    workTime: 20,
    restTime: 20,
    rounds: 6,
    useSound: true,
    useVibration: true,
    emoji: '🧠',
    description: 'Intervalos curtos para manter o engajamento.'
  },
  {
    id: 'p4',
    name: 'Competição',
    roundNames: ['Aperte o Passo', 'Double Leg', 'Luta Solo', 'Defesa Queda', 'Explosão 1', 'Explosão 2', 'Explosão 3', 'Gás Final'],
    workTime: 60,
    restTime: 15,
    rounds: 8,
    useSound: true,
    useVibration: true,
    emoji: '🏆',
    description: 'Ritmo intenso simulando situações de luta.'
  }
];
