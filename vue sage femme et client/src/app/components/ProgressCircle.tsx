import { motion } from "motion/react";

interface ProgressCircleProps {
  current: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export function ProgressCircle({
  current,
  total,
  size = 180,
  strokeWidth = 12
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = (current / total) * 100;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FDF6F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F2A7A7" />
            <stop offset="50%" stopColor="#C96B4B" />
            <stop offset="100%" stopColor="#B07590" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-4xl font-['Playfair_Display'] font-bold text-[#C96B4B]">
          {current}
        </div>
        <div className="text-sm text-gray-500 font-medium">sur {total}</div>
        <div className="text-xs text-gray-400 mt-1">semaines</div>
      </div>
    </div>
  );
}
