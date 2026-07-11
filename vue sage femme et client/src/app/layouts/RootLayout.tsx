import { NavLink, Outlet } from "react-router";
import {
  Home, Heart, Calendar, User, Activity,
  Baby, Bell, Heart as HeartIcon, Phone,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/",          label: "Accueil",  icon: Home,     end: true },
  { to: "/grossesse", label: "Grossesse",icon: Heart              },
  { to: "/mesure",    label: "Mesures",  icon: Activity           },
  { to: "/agenda",    label: "Agenda",   icon: Calendar           },
  { to: "/bebe",      label: "Journal",  icon: Baby               },
  { to: "/alerte",    label: "Alertes",  icon: Bell               },
  { to: "/contact", label: "Contact SF", icon: Phone              },
  { to: "/profil",    label: "Profil",   icon: User               },
];

export function RootLayout() {
  const { user } = useAuth();

  const initials = user?.email
    ? user.email[0].toUpperCase()
    : "P";

  return (
    <div className="min-h-screen bg-[#FFF9F5] flex">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 shrink-0 bg-white border-r border-border flex flex-col sticky top-0 h-screen">

        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B] flex items-center justify-center shadow-sm">
            <HeartIcon size={18} className="text-white fill-white" />
          </div>
          <div>
            <p className="font-serif font-semibold text-foreground text-sm leading-tight">Yaay Booy</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Patiente</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
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
                  <Icon
                    size={18}
                    className={isActive ? "text-white" : "text-muted-foreground group-hover:text-primary"}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#F7C5A0] flex items-center justify-center text-sm font-semibold text-[#C96B4B] shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {user?.email?.split("@")[0] ?? "Patiente"}
              </p>
              <p className="text-[10px] text-muted-foreground">Espace patiente</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Contenu principal ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto bg-[#FFF9F5]">
        <Outlet />
      </main>
    </div>
  );
}
