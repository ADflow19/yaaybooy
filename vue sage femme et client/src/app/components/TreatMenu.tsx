import { motion } from "motion/react";

interface Treat {
  id: string;
  name: string;
  emoji: string;
  hunger: number;
  happiness: number;
}

interface TreatMenuProps {
  onSelectTreat: (treat: Treat) => void;
}

const treats: Treat[] = [
  { id: "fish", name: "Poisson", emoji: "🐟", hunger: 30, happiness: 20 },
  { id: "milk", name: "Lait", emoji: "🥛", hunger: 15, happiness: 15 },
  { id: "treat", name: "Friandise", emoji: "🦴", hunger: 10, happiness: 30 },
  { id: "cake", name: "Gâteau", emoji: "🍰", hunger: 20, happiness: 40 },
];

export function TreatMenu({ onSelectTreat }: TreatMenuProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {treats.map((treat, index) => (
        <motion.button
          key={treat.id}
          onClick={() => onSelectTreat(treat)}
          className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-2 border-gray-100"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="text-4xl mb-2">{treat.emoji}</div>
          <div className="text-sm font-medium">{treat.name}</div>
          <div className="text-xs text-gray-500 mt-1">
            🍖 +{treat.hunger} ❤️ +{treat.happiness}
          </div>
        </motion.button>
      ))}
    </div>
  );
}

export type { Treat };
