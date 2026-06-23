import { Link, useLocation } from "react-router";
import { Home, Heart, Calendar, User } from "lucide-react";

export function BottomNav() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Accueil" },
    { path: "/grossesse", icon: Heart, label: "Grossesse" },
    { path: "/agenda", icon: Calendar, label: "Agenda" },
    { path: "/profil", icon: User, label: "Profil" },
  ];

  return (
    <div className="bg-white border-t border-[#F2A7A7]/20 px-4 py-3 flex justify-around items-center shrink-0">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive
                ? "text-[#C96B4B]"
                : "text-gray-400 hover:text-[#F2A7A7]"
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
