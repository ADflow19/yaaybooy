import { WifiOff, Mic } from "lucide-react";

interface HeaderProps {
  greeting?: string;
  name?: string;
  avatar?: string;
  showOffline?: boolean;
}

export function Header({
  greeting = "Asalaam Maleekum",
  name = "Aminata",
  avatar = "👩🏾",
  showOffline = false
}: HeaderProps) {
  return (
    <div className="bg-gradient-to-br from-[#F2A7A7] via-[#C96B4B] to-[#B07590] px-6 pt-12 pb-8 rounded-b-[2rem]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h1 className="text-white text-2xl font-['Playfair_Display'] mb-1">
            {greeting}, {name} ✨
          </h1>
          {showOffline && (
            <div className="flex items-center gap-1.5 text-white/90 text-xs bg-white/20 rounded-full px-3 py-1 w-fit mt-2">
              <WifiOff size={12} />
              <span>Mode hors ligne</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <Mic size={18} />
          </button>
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-2xl shadow-lg">
            {avatar}
          </div>
        </div>
      </div>
    </div>
  );
}
