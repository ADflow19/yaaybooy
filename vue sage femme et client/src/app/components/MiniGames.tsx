import { useState } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

interface MiniGamesProps {
  onGameComplete: (points: number) => void;
  onClose: () => void;
}

export function MiniGames({ onGameComplete, onClose }: MiniGamesProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  if (selectedGame === "catch") {
    return <CatchGame onComplete={onGameComplete} onClose={onClose} />;
  }

  if (selectedGame === "memory") {
    return <MemoryGame onComplete={onGameComplete} onClose={onClose} />;
  }

  if (selectedGame === "tap") {
    return <TapGame onComplete={onGameComplete} onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Mini-Jeux</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          <GameCard
            title="Attrape la souris"
            emoji="🐭"
            description="Clique sur les souris qui apparaissent"
            onClick={() => setSelectedGame("catch")}
          />
          <GameCard
            title="Mémoire"
            emoji="🎴"
            description="Trouve les paires identiques"
            onClick={() => setSelectedGame("memory")}
          />
          <GameCard
            title="Clique rapide"
            emoji="⚡"
            description="Clique le plus vite possible"
            onClick={() => setSelectedGame("tap")}
          />
        </div>
      </motion.div>
    </div>
  );
}

function GameCard({ title, emoji, description, onClick }: {
  title: string;
  emoji: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl hover:from-purple-100 hover:to-pink-100 transition-all text-left"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4">
        <div className="text-4xl">{emoji}</div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-gray-600">{description}</div>
        </div>
      </div>
    </motion.button>
  );
}

function CatchGame({ onComplete, onClose }: { onComplete: (points: number) => void; onClose: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(15);
    moveMouseRandomly();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete(score);
            onClose();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const moveMouseRandomly = () => {
    setMousePos({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    });
  };

  const handleCatch = () => {
    setScore((prev) => prev + 10);
    moveMouseRandomly();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Attrape la souris 🐭</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {!gameStarted ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Clique sur les souris pour marquer des points !</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Commencer
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-4 text-lg">
              <div>Score: <span className="font-bold text-purple-600">{score}</span></div>
              <div>Temps: <span className="font-bold text-pink-600">{timeLeft}s</span></div>
            </div>

            <div className="relative bg-gradient-to-br from-green-100 to-blue-100 rounded-xl h-80 overflow-hidden">
              <motion.button
                onClick={handleCatch}
                className="absolute text-4xl cursor-pointer"
                style={{
                  left: `${mousePos.x}%`,
                  top: `${mousePos.y}%`,
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                🐭
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function MemoryGame({ onComplete, onClose }: { onComplete: (points: number) => void; onClose: () => void }) {
  const emojis = ["🐟", "🦴", "🎾", "🧶"];
  const [cards, setCards] = useState<Array<{ emoji: string; id: number; flipped: boolean; matched: boolean }>>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    const shuffled = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ emoji, id, flipped: false, matched: false }));
    setCards(shuffled);
    setGameStarted(true);
    setScore(0);
    setFlippedIndices([]);
  };

  const handleCardClick = (index: number) => {
    if (flippedIndices.length === 2 || cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (newCards[first].emoji === newCards[second].emoji) {
        newCards[first].matched = true;
        newCards[second].matched = true;
        setCards(newCards);
        setScore((prev) => prev + 20);
        setFlippedIndices([]);

        if (newCards.every((card) => card.matched)) {
          setTimeout(() => {
            onComplete(score + 20);
            onClose();
          }, 1000);
        }
      } else {
        setTimeout(() => {
          newCards[first].flipped = false;
          newCards[second].flipped = false;
          setCards(newCards);
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Jeu de Mémoire 🎴</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {!gameStarted ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Trouve toutes les paires !</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Commencer
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              Score: <span className="font-bold text-purple-600">{score}</span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {cards.map((card, index) => (
                <motion.button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square rounded-lg text-3xl flex items-center justify-center ${
                    card.matched ? "bg-green-200" : card.flipped ? "bg-blue-200" : "bg-gray-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {card.flipped || card.matched ? card.emoji : "?"}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function TapGame({ onComplete, onClose }: { onComplete: (points: number) => void; onClose: () => void }) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(10);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            onComplete(score);
            onClose();
          }, 1000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Clique Rapide ⚡</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {!gameStarted ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Clique le plus vite possible !</p>
            <button
              onClick={startGame}
              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Commencer
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between mb-4 text-lg">
              <div>Clics: <span className="font-bold text-purple-600">{score}</span></div>
              <div>Temps: <span className="font-bold text-pink-600">{timeLeft}s</span></div>
            </div>

            <motion.button
              onClick={() => setScore((prev) => prev + 1)}
              className="w-full h-60 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl text-white text-6xl font-bold hover:from-purple-500 hover:to-pink-500 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              CLIQUE !
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
}
