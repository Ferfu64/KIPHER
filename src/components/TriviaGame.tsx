import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, HelpCircle, Zap, Shield, AlertTriangle, Timer, CheckCircle, XCircle, Utensils, MousePointer2, Calculator, Globe, Laptop, ChevronRight, Trophy } from 'lucide-react';
import { audioService } from '../services/audioService';

interface Question {
  q: string;
  options: string[];
  correct: number;
}

const TRIVIA_DATABASE: Record<string, Record<string, Question[]>> = {
  ANIMALS: {
    EASY: [
      { q: "Which animal is known as the king of the jungle?", options: ["Tiger", "Lion", "Elephant", "Giraffe"], correct: 1 },
      { q: "What is a baby dog called?", options: ["Kitten", "Puppy", "Cub", "Foal"], correct: 1 },
      { q: "Which bird cannot fly?", options: ["Eagle", "Penguin", "Sparrow", "Hawk"], correct: 1 }
    ],
    MEDIUM: [
      { q: "What is the only mammal capable of true flight?", options: ["Flying Squirrel", "Bat", "Sugarglider", "Pigeon"], correct: 1 },
      { q: "A group of lions is known as what?", options: ["Pack", "Herd", "Pride", "Flock"], correct: 2 },
      { q: "What is the tallest animal in the world?", options: ["Elephant", "Giraffe", "Ostrich", "Moose"], correct: 1 }
    ],
    HARD: [
      { q: "Which animal has the highest blood pressure?", options: ["Blue Whale", "Giraffe", "Elephant", "Ant"], correct: 1 },
      { q: "What is the scientific name for the Western Gorilla?", options: ["Gorilla gorilla", "Pan troglodytes", "Pongo", "Lemur"], correct: 0 },
      { q: "How many hearts does an octopus have?", options: ["1", "2", "3", "8"], correct: 2 }
    ],
    NIGHTMARE: [
      { q: "What is the gestational period of an African Elephant?", options: ["12 months", "18 months", "22 months", "24 months"], correct: 2 },
      { q: "What is the only bird that can fly backwards?", options: ["Hummingbird", "Swift", "Swallow", "Martin"], correct: 0 },
      { q: "Which animal has the most powerful bite force in PSI?", options: ["Nile Crocodile", "Great White Shark", "Hippopotamus", "Saltwater Crocodile"], correct: 3 }
    ]
  },
  FOOD: {
    EASY: [
      { q: "What is the main ingredient in bread?", options: ["Milk", "Flour", "Eggs", "Sugar"], correct: 1 },
      { q: "Which fruit is often used to make cider?", options: ["Orange", "Apple", "Banana", "Grape"], correct: 1 },
      { q: "What color is a banana?", options: ["Red", "Blue", "Yellow", "Green"], correct: 2 }
    ],
    MEDIUM: [
      { q: "Which nut is used to make marzipan?", options: ["Walnut", "Almond", "Cashew", "Peanut"], correct: 1 },
      { q: "What is the primary ingredient in hummus?", options: ["Lentils", "Chickpeas", "Soybeans", "Black Beans"], correct: 1 },
      { q: "Saffron comes from which flower?", options: ["Rose", "Crocus", "Lily", "Tulip"], correct: 1 }
    ],
    HARD: [
      { q: "Which vitamin is only found in animal products?", options: ["Vitamin C", "Vitamin B12", "Vitamin A", "Vitamin D"], correct: 1 },
      { q: "What is the world's most expensive spice by weight?", options: ["Vanilla", "Saffron", "Cardamom", "Cinnamon"], correct: 1 },
      { q: "Scoville units measure what?", options: ["Sweetness", "Heat (Spiciness)", "Saltiness", "Acidity"], correct: 1 }
    ],
    NIGHTMARE: [
      { q: "What is 'Ceviche' marinated in?", options: ["Olive Oil", "Vinegar", "Citrus Juice", "Wine"], correct: 2 },
      { q: "Where does the 'Durian' fruit originate from?", options: ["South America", "South East Asia", "Africa", "Australia"], correct: 1 },
      { q: "What is the lethal toxin found in Fugu (Pufferfish)?", options: ["Cyanide", "Tetrodotoxin", "Arsenic", "Ricin"], correct: 1 }
    ]
  },
  MATH: {
    EASY: [
      { q: "What is 5 + 7?", options: ["10", "11", "12", "13"], correct: 2 },
      { q: "How many sides does a triangle have?", options: ["3", "4", "5", "6"], correct: 0 },
      { q: "What is 10 divided by 2?", options: ["2", "4", "5", "6"], correct: 2 }
    ],
    MEDIUM: [
      { q: "What is the square root of 144?", options: ["10", "12", "14", "16"], correct: 1 },
      { q: "What is 15% of 200?", options: ["20", "30", "40", "50"], correct: 1 },
      { q: "How many degrees are in a right angle?", options: ["45", "90", "180", "360"], correct: 1 }
    ],
    HARD: [
      { q: "What is the value of Pi to 2 decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], correct: 1 },
      { q: "What is a prime number?", options: ["Number divisible by 2", "Number with only 2 factors", "Odd number", "Large number"], correct: 1 },
      { q: "What is the derivative of x^2?", options: ["x", "2", "2x", "x^3"], correct: 2 }
    ],
    NIGHTMARE: [
      { q: "What is the sum of angles in a heptagon?", options: ["720", "900", "1080", "1260"], correct: 1 },
      { q: "What is 7 cubed?", options: ["243", "343", "443", "543"], correct: 1 },
      { q: "Which of these is NOT a Platonic solid?", options: ["Tetrahedron", "Icosahedron", "Dodecahedron", "Rhombus"], correct: 3 }
    ]
  },
  GEOGRAPHY: {
    EASY: [
      { q: "Which ocean is the largest?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], correct: 2 },
      { q: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
      { q: "Which country is also a continent?", options: ["Brazil", "Australia", "India", "Russia"], correct: 1 }
    ],
    MEDIUM: [
      { q: "What is the smallest country in the world?", options: ["Monaco", "Vatican City", "Malta", "Liechtenstein"], correct: 1 },
      { q: "Which river is the longest in the world?", options: ["Amazon", "Nile", "Mississippi", "Yangtze"], correct: 1 },
      { q: "Mount Everest is located in which mountain range?", options: ["Andes", "Rockies", "Himalayas", "Alps"], correct: 2 }
    ],
    HARD: [
      { q: "Which country has the most natural lakes?", options: ["USA", "Russia", "Canada", "China"], correct: 2 },
      { q: "What is the capital of Kazakhstan?", options: ["Almaty", "Astana", "Bishkek", "Tashkent"], correct: 1 },
      { q: "Which African country was formerly known as Abyssinia?", options: ["Nigeria", "Kenya", "Ethiopia", "Sudan"], correct: 2 }
    ],
    NIGHTMARE: [
      { q: "Which desert is the largest in the world?", options: ["Sahara", "Gobi", "Antarctic Desert", "Arabian"], correct: 2 },
      { q: "Which city is located on two continents?", options: ["Istanbul", "Cairo", "Moscow", "Jakarta"], correct: 0 },
      { q: "What is the deepest point in the world's oceans?", options: ["Java Trench", "Mariana Trench", "Tonga Trench", "Puerto Rico Trench"], correct: 1 }
    ]
  },
  TECH: {
    EASY: [
      { q: "What does HTML stand for?", options: ["Hypertext Markup Language", "High Tech Machine Language", "Hyperlink Text Mgmt Lib", "None"], correct: 0 },
      { q: "Which company created the iPhone?", options: ["Google", "Microsoft", "Apple", "Samsung"], correct: 2 }
    ],
    MEDIUM: [
      { q: "What protocol is used for secure web browsing?", options: ["HTTP", "SSH", "HTTPS", "FTP"], correct: 2 },
      { q: "What is the name of the main circuit board in a computer?", options: ["Sound card", "Motherboard", "Graphics unit", "RAM"], correct: 1 }
    ],
    HARD: [
      { q: "Who is known as the father of modern computer science?", options: ["Alan Turing", "Ada Lovelace", "Charles Babbage", "Steve Jobs"], correct: 0 },
      { q: "What does SQL stand for?", options: ["Structured Query Language", "System Quick Link", "Simple Quant Logic", "Smart Query Lib"], correct: 0 }
    ],
    NIGHTMARE: [
      { q: "What was the name of the first programmable computer?", options: ["ENIAC", "Z3", "Colossus", "Differential Analyzer"], correct: 1 },
      { q: "In binary, what is 10110 in decimal?", options: ["20", "22", "18", "24"], correct: 1 }
    ]
  }
};

// Add NIGHTMARE to other categories
Object.keys(TRIVIA_DATABASE).forEach(cat => {
  if (cat !== 'TECH') {
    TRIVIA_DATABASE[cat].NIGHTMARE = TRIVIA_DATABASE[cat].NIGHTMARE || [
      { q: "What is the maximum packet size for IPV4 before fragmentation?", options: ["65535 bytes", "1500 bytes", "576 bytes", "9000 bytes"], correct: 0 },
      { q: "Which algorithm is used for Git's content hashing?", options: ["MD5", "SHA-1", "SHA-256", "RIPEMD-160"], correct: 1 }
    ];
  }
});

type Category = 'ANIMALS' | 'FOOD' | 'MATH' | 'GEOGRAPHY' | 'TECH';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'NIGHTMARE' | 'EXTREME';

export default function TriviaGame({ onBack, onCreditsEarned }: { onBack: () => void, onCreditsEarned: (cr: number) => void }) {
  const [gameState, setGameState] = useState<'SELECT_CAT' | 'SELECT_DIFF' | 'STARTING' | 'QUESTION' | 'FEEDBACK' | 'RESULTS'>('SELECT_CAT');
  const [category, setCategory] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [showExtreme, setShowExtreme] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [questions, setQuestions] = useState<Question[]>([]);
  const timerRef = useRef<any>(null);

  const selectCategory = (cat: Category) => {
    setCategory(cat);
    setGameState('SELECT_DIFF');
    setShowExtreme(false);
    audioService.playBlip();
  };

  const handleAnyRarity = () => {
    audioService.playSuccess();
    // 1 in 5 chance to reveal EXTREME difficulty
    if (Math.random() < 0.2) {
      setShowExtreme(true);
      audioService.playCelestialSymphony();
    } else {
      // Otherwise just pick a random standard difficulty
      const diffs: Difficulty[] = ['EASY', 'MEDIUM', 'HARD', 'NIGHTMARE'];
      selectDifficulty(diffs[Math.floor(Math.random() * diffs.length)]);
    }
  };

  const selectDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    let qSet = [...(TRIVIA_DATABASE[category!]?.[diff] || [])];
    
    if (qSet.length === 0) {
      if (diff === 'EXTREME') {
        qSet = [
          { q: "What is the computational complexity of the 'Traveling Salesman' problem?", options: ["P", "NP", "NP-Hard", "Logarithmic"], correct: 2 },
          { q: "What does the 'B' in Mandelbrot signify in set theory?", options: ["Boundless", "Bifurcation", "Benoit", "Binary"], correct: 2 },
          { q: "Which particle is its own antiparticle?", options: ["Electron", "Neutrino", "Photon", "Quark"], correct: 2 },
          { q: "Which theorem states that any Boolean function can be implemented with NAND gates?", options: ["De Morgan's", "Shannon's Expansion", "Functional Completeness", "Church-Turing"], correct: 2 },
          { q: "What is the limit of (1 + 1/n)^n as n approaches infinity?", options: ["0", "1", "e", "Infinity"], correct: 2 }
        ];
      } else {
        qSet = [...(TRIVIA_DATABASE.ANIMALS.EASY || [])];
      }
    }

    // Random Shuffle
    qSet = qSet.sort(() => Math.random() - 0.5);
    
    // Shuffle options for each question
    qSet = qSet.map(q => {
      const opts = [...q.options];
      const correctText = opts[q.correct];
      const shuffledOpts = opts.sort(() => Math.random() - 0.5);
      const newCorrect = shuffledOpts.indexOf(correctText);
      return { ...q, options: shuffledOpts, correct: newCorrect };
    });

    setQuestions(qSet);
    setGameState('STARTING');
    audioService.playBlip();
    setTimeout(() => {
       setGameState('QUESTION');
       setTimeLeft(diff === 'EXTREME' ? 3 : (diff === 'NIGHTMARE' ? 5 : 15));
    }, 1500);
  };

  const nextQuestion = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
       setGameState('RESULTS');
       const multiplier = difficulty === 'EXTREME' ? 2500 : (difficulty === 'NIGHTMARE' ? 500 : (difficulty === 'HARD' ? 100 : (difficulty === 'MEDIUM' ? 25 : 10)));
       onCreditsEarned(score * multiplier);
       return;
    }
    setCurrentIdx(i => i + 1);
    setTimeLeft(difficulty === 'EXTREME' ? 3 : (difficulty === 'NIGHTMARE' ? 5 : 15));
    setGameState('QUESTION');
  }, [currentIdx, questions.length, difficulty, score, onCreditsEarned]);

  const handleAnswer = useCallback((idx: number) => {
    clearInterval(timerRef.current);
    if (!questions[currentIdx]) return;
    const correct = questions[currentIdx].correct;
    
    if (idx === correct) {
      setScore(s => s + 1);
      audioService.playSuccess();
      nextQuestion();
    } else {
      setGameState('FEEDBACK');
      audioService.playError();
    }
  }, [currentIdx, questions, nextQuestion]);

  useEffect(() => {
    if (gameState === 'QUESTION' && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && gameState === 'QUESTION') {
      handleAnswer(-1); // Timeout
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, timeLeft, handleAnswer]);

  const currentQuestion = useMemo(() => questions[currentIdx], [questions, currentIdx]);

  return (
    <div className="h-full w-full bg-slate-950 flex flex-col font-mono text-white overflow-hidden select-none relative">
       {/* Background Grid */}
       <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#22d3ee 1px, transparent 1px), linear-gradient(90deg, #22d3ee 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

       <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50 relative z-10">
          <button onClick={onBack} className="text-slate-500 hover:text-white transition-colors flex items-center gap-2 px-3 py-1 border border-white/5 bg-black/40">
            <Shield size={14}/> ABORT_TRIVIA
          </button>
          <div className="text-xl font-black text-tactical-cyan italic tracking-widest uppercase">Cortex_Intel_Nexus</div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2 bg-black/40 px-3 py-1 border border-white/5">
                <Brain size={14} className="text-tactical-cyan" />
                <span className="text-xs font-bold leading-none">{score}/{questions.length}</span>
             </div>
          </div>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
          <AnimatePresence mode="wait">
             {gameState === 'SELECT_CAT' && (
                <motion.div key="cat" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -50 }} className="text-center w-full max-w-4xl">
                   <h2 className="text-4xl font-black mb-8 uppercase italic border-l-4 border-tactical-cyan pl-6 text-left">ESTABLISH_NEURAL_TOPIC</h2>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'ANIMALS', label: 'ZOOLOGY', icon: MousePointer2 },
                        { id: 'FOOD', label: 'GASTRONOMY', icon: Utensils },
                        { id: 'MATH', label: 'QUANTUM_MATH', icon: Calculator },
                        { id: 'GEOGRAPHY', label: 'TERRAIN_MAPPING', icon: Globe },
                        { id: 'TECH', label: 'CYBER_PROTOCOL', icon: Laptop }
                      ].map(cat => (
                         <button 
                            key={cat.id} 
                            onClick={() => selectCategory(cat.id as Category)}
                            className="flex flex-col items-center gap-4 p-8 bg-slate-900/50 border border-white/5 hover:border-tactical-cyan hover:bg-tactical-cyan/10 transition-all group"
                         >
                            <cat.icon size={32} className="text-slate-500 group-hover:text-tactical-cyan group-hover:scale-110 transition-all" />
                            <span className="text-xs font-black tracking-widest uppercase">{cat.label}</span>
                         </button>
                      ))}
                   </div>
                </motion.div>
             )}

             {gameState === 'SELECT_DIFF' && (
                <motion.div key="diff" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center w-full max-w-xl">
                   <h2 className="text-4xl font-black mb-12 uppercase italic border-l-4 border-white pl-6 text-left">SYNC_DEPTH_THRESHOLD</h2>
                   <div className="space-y-4">
                      {[
                        { id: 'EASY', label: 'SURFACE_LAYER', bonus: '10 CR', color: 'text-green-500' },
                        { id: 'MEDIUM', label: 'CORE_PENETRATION', bonus: '25 CR', color: 'text-yellow-500' },
                        { id: 'HARD', label: 'DEEP_EXTRACTION', bonus: '100 CR', color: 'text-red-500' },
                        { id: 'NIGHTMARE', label: 'TERMINAL_COLLAPSE', bonus: '500 CR', color: 'text-purple-500' }
                      ].map(diff => (
                         <button 
                            key={diff.id} 
                            onClick={() => selectDifficulty(diff.id as Difficulty)}
                            className="w-full p-6 bg-slate-900 border border-white/5 hover:border-white transition-all flex justify-between items-center group overflow-hidden relative"
                         >
                            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors" />
                            <div className="flex items-center gap-6 relative">
                               <div className={`w-2 h-2 rounded-full ${diff.id === 'EASY' ? 'bg-green-500' : diff.id === 'MEDIUM' ? 'bg-yellow-500' : diff.id === 'HARD' ? 'bg-red-500' : 'bg-purple-500'}`} />
                               <span className="text-xl font-black uppercase tracking-tighter">{diff.label}</span>
                            </div>
                            <div className={`font-black italic text-sm ${diff.color} relative`}>{diff.bonus} / ANS</div>
                         </button>
                      ))}

                      {showExtreme && (
                         <button 
                            onClick={() => selectDifficulty('EXTREME')}
                            className="w-full p-8 bg-red-950 border-2 border-red-500 hover:bg-red-900 transition-all flex justify-between items-center group overflow-hidden relative animate-pulse"
                         >
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-center gap-6 relative">
                               <div className="w-3 h-3 rounded-full bg-red-400 shadow-[0_0_10px_#f87171]" />
                               <span className="text-2xl font-black uppercase tracking-widest text-red-100">EXTREME_THRESHOLD</span>
                            </div>
                            <div className="font-black italic text-sm text-red-400 relative">2500 CR / ANS</div>
                         </button>
                      )}

                      {!showExtreme && (
                         <button 
                            onClick={handleAnyRarity}
                            className="w-full p-4 border border-tactical-cyan/40 bg-tactical-cyan/5 text-tactical-cyan hover:bg-tactical-cyan hover:text-black transition-all text-xs font-black uppercase tracking-[0.5em] mt-4 flex items-center justify-center gap-2 group"
                         >
                            <Zap size={14} className="group-hover:animate-bounce" /> ANY_RARITY (ROLL)
                          </button>
                       )}
                   </div>
                </motion.div>
             )}

             {gameState === 'STARTING' && (
                <motion.div key="starting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                   <Zap size={64} className="text-tactical-cyan mx-auto mb-6 animate-ping" />
                   <h2 className="text-6xl font-black text-white italic italic mb-2 uppercase tracking-tighter">SYNCHRONIZING...</h2>
                   <div className="text-tactical-cyan text-xs font-bold uppercase tracking-[0.8em]">Loading {category} // {difficulty}</div>
                </motion.div>
             )}

             {gameState === 'QUESTION' && currentQuestion && (
                <motion.div key="q" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl">
                   <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-6">
                      <div className="max-w-[80%]">
                         <div className="text-[10px] text-tactical-cyan mb-2 font-black uppercase tracking-[0.4em]">SYNC_NODE: {currentIdx + 1} / {questions.length}</div>
                         <h3 className="text-3xl font-black italic uppercase leading-tight">{currentQuestion.q}</h3>
                      </div>
                      <div className="text-right">
                         <div className={`text-3xl font-black tabular-nums transition-colors ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>{timeLeft}s</div>
                         <div className="text-[8px] text-slate-500 font-bold uppercase">TIME_LIMIT</div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 gap-3">
                      {currentQuestion.options.map((opt, i) => (
                         <button 
                            key={i}
                            onClick={() => handleAnswer(i)}
                            className="p-6 bg-slate-900/50 border border-white/5 hover:border-tactical-cyan hover:bg-tactical-cyan/10 text-left group transition-all flex items-center gap-6"
                         >
                            <span className="text-slate-600 font-black group-hover:text-tactical-cyan transition-colors text-lg">0{i+1}</span>
                            <span className="font-black uppercase tracking-widest text-sm flex-1">{opt}</span>
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-tactical-cyan" />
                         </button>
                      ))}
                   </div>
                </motion.div>
             )}

             {gameState === 'FEEDBACK' && (
                <FeedbackLoop onComplete={() => { nextQuestion(); }} />
             )}

             {gameState === 'RESULTS' && (
                <motion.div key="results" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-slate-900 p-12 border-2 border-white/10 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-tactical-cyan to-transparent animate-pulse" />
                   <Trophy size={64} className="text-yellow-500 mx-auto mb-8" />
                   <h2 className="text-6xl font-black text-white italic mb-2 uppercase tracking-tighter">EXTRACTION_RESULT</h2>
                   <div className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mb-12">DATA_INTEGRITY: {Math.round((score/questions.length)*100)}%</div>
                   
                   <div className="text-4xl font-black text-tactical-cyan mb-12 uppercase italic bg-black/40 py-6 border-y border-white/5">
                      {score * (difficulty === 'EXTREME' ? 2500 : (difficulty === 'NIGHTMARE' ? 500 : (difficulty === 'HARD' ? 100 : (difficulty === 'MEDIUM' ? 25 : 10))))} CR_EARNED
                   </div>

                   <button 
                     onClick={onBack}
                     className="px-16 py-4 border-2 border-white text-white font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all shadow-xl"
                   >
                      RETURN_TO_BASE
                   </button>
                </motion.div>
             )}
          </AnimatePresence>
       </div>
    </div>
  );
}

function FeedbackLoop({ onComplete }: { onComplete: () => void }) {
  const [hits, setHits] = useState(0);
  const targetHits = 3;
  const [pos, setPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const move = () => setPos({ x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 });
    move();
    const interval = setInterval(move, 700);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hits >= targetHits) {
      const timer = setTimeout(() => {
        onComplete();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [hits, onComplete, targetHits]);

  const hit = () => {
    setHits(h => h + 1);
    audioService.playBlip();
  };

  return (
    <div className="absolute inset-0 bg-red-950/90 backdrop-blur-xl z-50 flex items-center justify-center">
       <div className="text-center pointer-events-none">
          <AlertTriangle size={80} className="text-red-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-5xl font-black text-white italic uppercase mb-2 tracking-tighter">NEURAL_DECOHERENCE</h2>
          <p className="text-red-200 text-xs font-bold uppercase tracking-[0.5em] animate-pulse">Stabilize synaptic field: {hits}/{targetHits}</p>
       </div>
       
       <motion.button 
         animate={{ top: `${pos.y}%`, left: `${pos.x}%` }}
         onClick={hit}
         className="absolute p-4 w-24 h-24 bg-white shadow-[0_0_40px_rgba(255,255,255,0.5)] rounded-full flex items-center justify-center border-4 border-red-500/20 active:scale-90 transition-transform"
       >
          <Zap size={40} className="text-black" />
       </motion.button>
    </div>
  );
}
