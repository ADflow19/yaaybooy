import { Progress } from "./ui/Progress";

interface StatBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  icon?: string;
}

export function StatBar({ label, value, max = 100, color = "bg-blue-500", icon }: StatBarProps) {
  const percentage = (value / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {label}
        </span>
        <span className="text-gray-600">{value}/{max}</span>
      </div>
      <Progress value={percentage} className="h-3" />
    </div>
  );
}
