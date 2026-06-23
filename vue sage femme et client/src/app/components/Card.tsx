import { ReactNode } from "react";
import { motion } from "motion/react";

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = "", gradient = false, onClick }: CardProps) {
  const baseClasses = `rounded-2xl shadow-md p-5 ${
    gradient
      ? "bg-gradient-to-br from-[#F2A7A7]/10 to-[#F7C5A0]/10 border border-[#F2A7A7]/20"
      : "bg-white border border-gray-100"
  } ${className}`;

  if (onClick) {
    return (
      <motion.button
        onClick={onClick}
        className={`${baseClasses} hover:shadow-lg transition-shadow text-left w-full`}
        whileTap={{ scale: 0.98 }}
      >
        {children}
      </motion.button>
    );
  }

  return (
    <div className={baseClasses}>
      {children}
    </div>
  );
}
