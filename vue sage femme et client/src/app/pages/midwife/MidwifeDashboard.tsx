import { useNavigate } from "react-router";
import {
  Users,
  CalendarDays,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Baby,
  Activity,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  { label: "Patientes actives", value: "24", sub: "+2 ce mois", icon: Users, color: "bg-[#F2A7A7]/20 text-[#C96B4B]", trend: "up" },
  { label: "Consultations aujourd'hui", value: "7", sub: "2 restantes", icon: CalendarDays, color: "bg-[#F7C5A0]/30 text-[#C96B4B]", trend: "neutral" },
  { label: "Alertes actives", value: "3", sub: "1 urgente", icon: AlertTriangle, color: "bg-destructive/10 text-destructive", trend: "warn" },
  { label: "Accouchements ce mois", value: "5", sub: "Dont 1 prévu demain", icon: Baby, color: "bg-[#B07590]/15 text-[#B07590]", trend: "up" },
];

const todayAppointments = [
  { time: "08h30", name: "Fatou Diallo", weeks: 32, type: "Suivi routine", status: "done", risk: "normal" },
  { time: "09h30", name: "Mariama Sow", weeks: 28, type: "Écho morphologique", status: "done", risk: "normal" },
  { time: "10h30", name: "Rokhaya Ndiaye", weeks: 36, type: "Consultation urgente", status: "done", risk: "high" },
  { time: "11h30", name: "Adja Mbaye", weeks: 20, type: "Première consultation", status: "current", risk: "normal" },
  { time: "14h00", name: "Ndèye Diop", weeks: 38, type: "Pré-accouchement", status: "upcoming", risk: "watch" },
  { time: "15h30", name: "Aminata Ba", weeks: 14, type: "Suivi routine", status: "upcoming", risk: "normal" },
  { time: "16h30", name: "Khady Fall", weeks: 30, type: "Résultats labo", status: "upcoming", risk: "normal" },
];

const activityData = [
  { mois: "Jan", consultations: 28, naissances: 4 },
  { mois: "Fév", consultations: 32, naissances: 3 },
  { mois: "Mar", consultations: 35, naissances: 6 },
  { mois: "Avr", consultations: 30, naissances: 5 },
  { mois: "Mai", consultations: 38, naissances: 7 },
  { mois: "Jun", consultations: 42, naissances: 5 },
];

const recentAlerts = [
  { name: "Rokhaya Ndiaye", type: "Tension artérielle élevée", value: "158/98 mmHg", time: "Il y a 2h", severity: "high" },
  { name: "Ndèye Diop", type: "Mouvements fœtaux réduits", value: "< 10 mvt/12h", time: "Il y a 5h", severity: "watch" },
  { name: "Aïda Gueye", type: "Glycémie anormale", value: "1.82 g/L", time: "Ce matin", severity: "medium" },
];

const riskColors: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  watch: "bg-[#F7C5A0]/50 text-[#C96B4B] border-[#F7C5A0]",
  normal: "bg-[#F2A7A7]/15 text-[#B07590] border-[#F2A7A7]/30",
  medium: "bg-[#B07590]/10 text-[#B07590] border-[#B07590]/20",
};

const riskLabels: Record<string, string> = {
  high: "Urgent",
  watch: "Surveiller",
  normal: "Normal",
  medium: "Attention",
};

const statusStyles: Record<string, string> = {
  done: "text-muted-foreground line-through",
  current: "text-foreground font-semibold",
  upcoming: "text-foreground",
};

export function MidwifeDashboard() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground">Bonjour, Aïssatou 👋</h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{today}</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground">
          <MapPin size={14} className="text-primary" />
          <span>Centre de Santé de Thiès</span>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color} mb-3`}>
              <s.icon size={18} />
            </div>
            <p className="text-2xl font-serif font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
            <p className={`text-[10px] mt-1 font-medium ${s.trend === "warn" ? "text-destructive" : "text-[#B07590]"}`}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground font-serif">Planning du jour</h2>
            </div>
            <button
              onClick={() => navigate("/sage-femme/agenda")}
              className="text-xs text-primary flex items-center gap-1 hover:underline"
            >
              Voir agenda <ChevronRight size={12} />
            </button>
          </div>
          <div className="divide-y divide-border">
            {todayAppointments.map((appt) => (
              <div
                key={appt.name + appt.time}
                className={`flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer
                  ${appt.status === "current" ? "bg-[#FFF9F5]" : ""}
                `}
                onClick={() => navigate("/sage-femme/patientes")}
              >
                {/* Time */}
                <span className={`text-xs w-12 shrink-0 font-mono ${appt.status === "done" ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                  {appt.time}
                </span>

                {/* Status dot */}
                <div className="shrink-0">
                  {appt.status === "done" && <CheckCircle2 size={14} className="text-muted-foreground/50" />}
                  {appt.status === "current" && (
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse ring-2 ring-primary/30" />
                  )}
                  {appt.status === "upcoming" && <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${statusStyles[appt.status]}`}>{appt.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{appt.type} · {appt.weeks} SA</p>
                </div>

                {/* Risk badge */}
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${riskColors[appt.risk]}`}>
                  {riskLabels[appt.risk]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Alerts */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-destructive" />
                <h2 className="text-sm font-semibold text-foreground font-serif">Alertes récentes</h2>
              </div>
              <button
                onClick={() => navigate("/sage-femme/alertes")}
                className="text-xs text-primary flex items-center gap-1 hover:underline"
              >
                Tout voir <ChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-border">
              {recentAlerts.map((alert) => (
                <div key={alert.name} className="px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">{alert.name}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{alert.type}</p>
                      <p className={`text-[10px] font-mono mt-1 font-bold ${alert.severity === "high" ? "text-destructive" : "text-[#C96B4B]"}`}>
                        {alert.value}
                      </p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full border whitespace-nowrap font-medium shrink-0 ${riskColors[alert.severity]}`}>
                      {riskLabels[alert.severity]}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                    <Clock size={9} /> {alert.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground font-serif">Activité mensuelle</h2>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={activityData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="consultGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F2A7A7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F2A7A7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="birthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C96B4B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C96B4B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mois" tick={{ fontSize: 9, fill: "#8d7f7f" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #F2A7A7", background: "#FFF9F5" }}
                />
                <Area type="monotone" dataKey="consultations" stroke="#F2A7A7" fill="url(#consultGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="naissances" stroke="#C96B4B" fill="url(#birthGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#F2A7A7]" />
                <span className="text-[10px] text-muted-foreground">Consultations</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#C96B4B]" />
                <span className="text-[10px] text-muted-foreground">Naissances</span>
              </div>
            </div>
          </div>

          {/* Next birth */}
          <div className="bg-gradient-to-br from-[#F7C5A0]/40 to-[#F2A7A7]/20 rounded-2xl border border-[#F7C5A0]/40 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity size={14} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">Prochaine naissance</span>
            </div>
            <p className="font-serif text-base font-bold text-foreground">Ndèye Diop</p>
            <p className="text-xs text-muted-foreground mt-0.5">38 SA + 2j · DPA dans 3 jours</p>
            <button
              onClick={() => navigate("/sage-femme/patientes")}
              className="mt-3 w-full bg-primary text-white text-xs py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Voir le dossier
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
