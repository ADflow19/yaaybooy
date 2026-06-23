import { NavLink, Outlet, useNavigate } from "react-router";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  Heart,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { to: "/sage-femme", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/sage-femme/patientes", label: "Mes Patientes", icon: Users },
  { to: "/sage-femme/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/sage-femme/alertes", label: "Alertes", icon: Bell },
  { to: "/sage-femme/profil", label: "Mon Profil", icon: UserCircle },
];

export function MidwifeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-30 flex flex-col
          bg-white border-r border-border
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Heart size={18} className="text-white fill-white" />
          </div>
          <div>
            <p className="font-serif font-semibold text-foreground text-sm leading-tight">Yaay Booy</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Sage-Femme</p>
          </div>
          <button
            className="ml-auto lg:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"} />
                  <span>{label}</span>
                  {label === "Alertes" && (
                    <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-destructive text-white"}`}>3</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-[#F7C5A0] flex items-center justify-center text-sm font-semibold text-[#C96B4B]">
              AF
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">Aïssatou Fall</p>
              <p className="text-[10px] text-muted-foreground truncate">Sage-femme certifiée</p>
            </div>
            <ChevronRight size={14} className="ml-auto text-muted-foreground" />
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
          >
            <LogOut size={14} />
            <span>Vue patiente</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border sticky top-0 z-10">
          <button onClick={() => setSidebarOpen(true)} className="text-foreground">
            <Menu size={22} />
          </button>
          <span className="font-serif text-sm font-semibold text-foreground">Yaay Booy — Sage-Femme</span>
          <div className="ml-auto w-7 h-7 rounded-full bg-[#F7C5A0] flex items-center justify-center text-xs font-semibold text-[#C96B4B]">
            AF
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
