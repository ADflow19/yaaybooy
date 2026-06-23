import { motion } from "motion/react";

interface VirtualPetProps {
  mood: "happy" | "hungry" | "sleepy" | "playful";
  isPlaying?: boolean;
}

export function VirtualPet({ mood, isPlaying }: VirtualPetProps) {
  const getMoodEmoji = () => {
    switch (mood) {
      case "happy": return "😊";
      case "hungry": return "😋";
      case "sleepy": return "😴";
      case "playful": return "🤩";
      default: return "😊";
    }
  };

  return (
    <motion.div
      className="relative"
      animate={isPlaying ? {
        y: [0, -20, 0],
        rotate: [0, 5, -5, 0]
      } : {
        y: [0, -5, 0]
      }}
      transition={isPlaying ? {
        duration: 0.5,
        repeat: Infinity,
        repeatType: "loop"
      } : {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <div className="text-[120px] select-none">
        🐱
      </div>
      <motion.div
        className="absolute -top-4 -right-4 text-4xl"
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        {getMoodEmoji()}
      </motion.div>
    </motion.div>
  );
}
