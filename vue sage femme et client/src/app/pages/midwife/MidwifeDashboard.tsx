import { useNavigate } from "react-router";
import {
  Users, CalendarDays, AlertTriangle, TrendingUp,
  Clock, ChevronRight, Baby, Activity, CheckCircle2, MapPin,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useApiCall } from "../../../hooks/useApiCall";
import { midwifeService } from "../../../api/midwifeService";
import { useAuth } from "../../../context/AuthContext";
import type { AppointmentRead, AlertRead } from "../../../api/types";

const riskColors: Record<string, string> = {
  high:   "bg-destructive/10 text-destructive border-destructive/20",
  watch:  "bg-[#F7C5A0]/50 text-[#C96B4B] border-[#F7C5A0]",
  normal: "bg-[#F2A7A7]/15 text-[#B07590] border-[#F2A7A7]/30",
  medium: "bg-[#B07590]/10 text-[#B07590] border-[#B07590]/20",
};
const riskLabels: Record<string, string> = {
  high: "Urgent", watch: "Surveiller", normal: "Normal", medium: "Attention",
};

function apptStatus(appt: AppointmentRead): "done" | "current" | "upcoming" {
  const now = new Date();
  const at  = new Date(appt.scheduled_at);
  const end = new Date(at.getTime() + appt.duration * 60_000);
  if (end < now) return "done";
  if (at <= now && now <= end) return "current";
  return "upcoming";
}

export function MidwifeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const { data: patients }     = useApiCall(() => midwifeService.listPatients());
  const { data: alerts }       = useApiCall(() => midwifeService.listAlerts(false)); // actives
  const { data: appointments } = useApiCall(() => midwifeService.listAppointments(false));

  const patientList     = patients     ?? [];
  const alertList       = alerts       ?? [];
  const appointmentList = appointments ?? [];

  // RDV du jour uniquement
  const todayAppts = appointmentList.filter((a) => {
    const d = new Date(a.scheduled_at);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() &&
           d.getMonth()    === n.getMonth()    &&
           d.getDate()     === n.getDate();
  });

  // Alertes critiques pour le panneau droit
  const recentAlerts = alertList.slice(0, 3);

  const stats = [
    { label: "Patientes actives",           value: String(patientList.length),    sub: "",                 icon: Users,        color: "bg-[#F2A7A7]/20 text-[#C96B4B]",  trend: "up"     },
    { label: "Consultations aujourd'hui",   value: String(todayAppts.length),     sub: ``,                 icon: CalendarDays, color: "bg-[#F7C5A0]/30 text-[#C96B4B]",  trend: "neutral"},
    { label: "Alertes actives",             value: String(alertList.length),      sub: "",                 icon: AlertTriangle,color: "bg-destructive/10 text-destructive",trend: "warn"   },
    { label: "Prochains accouchements",     value: String(patientList.filter((p) => p.weeks >= 37).length), sub: "", icon: Baby, color: "bg-[#B07590]/15 text-[#B07590]", trend: "up" },
  ];

  // Le graphique reste statique — l'API n'expose pas encore d'agrégats mensuels
  const activityData = [
    { mois: "Jan", consultations: 28, naissances: 4 },
    { mois: "Fév", consultations: 32, naissances: 3 },
    { mois: "Mar", consultations: 35, naissances: 6 },
    { mois: "Avr", consultations: 30, naissances: 5 },
    { mois: "Mai", consultations: 38, naissances: 7 },
    { mois: "Jun", consultations: 42, naissances: 5 },
  ];

  const firstName = user?.email?.split("@")[0].split(/[._]/)[0] ?? "Sage-femme";

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-serif font-semibold text-foreground capitalize">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">{today}</p>
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-white border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground">
          <MapPin size={14} className="text-primary" />
          <span>Centre de Santé</span>
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
            <button onClick={() => navigate("/sage-femme/agenda")} className="text-xs text-primary flex items-center gap-1 hover:underline">
              Voir agenda <ChevronRight size={12} />
            </button>
          </div>

          {todayAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
              <CalendarDays size={28} className="mb-2 opacity-30" />
              Aucune consultation planifiée aujourd'hui
            </div>
          ) : (
            <div className="divide-y divide-border">
              {todayAppts.map((appt) => {
                const status = apptStatus(appt);
                const time   = new Date(appt.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div
                    key={appt.id}
                    className={`flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors cursor-pointer ${status === "current" ? "bg-[#FFF9F5]" : ""}`}
                    onClick={() => navigate(`/sage-femme/patientes/${appt.patient_id}`)}
                  >
                    <span className={`text-xs w-12 shrink-0 font-mono ${status === "done" ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                      {time}
                    </span>
                    <div className="shrink-0">
                      {status === "done"    && <CheckCircle2 size={14} className="text-muted-foreground/50" />}
                      {status === "current" && <div className="w-3 h-3 rounded-full bg-primary animate-pulse ring-2 ring-primary/30" />}
                      {status === "upcoming"&& <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {appt.type}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {appt.weeks ? `${appt.weeks} SA · ` : ""}{appt.duration} min
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent alerts */}
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-destructive" />
                <h2 className="text-sm font-semibold text-foreground font-serif">Alertes récentes</h2>
              </div>
              <button onClick={() => navigate("/sage-femme/alertes")} className="text-xs text-primary flex items-center gap-1 hover:underline">
                Tout voir <ChevronRight size={12} />
              </button>
            </div>

            {recentAlerts.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">Aucune alerte active ✅</p>
            ) : (
              <div className="divide-y divide-border">
                {recentAlerts.map((alert: AlertRead) => (
                  <div
                    key={alert.id}
                    className="px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/sage-femme/patientes/${alert.patient_id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{alert.title}</p>
                        {alert.value && (
                          <p className={`text-[10px] font-mono mt-1 font-bold ${alert.severity === "critical" || alert.severity === "high" ? "text-destructive" : "text-[#C96B4B]"}`}>
                            {alert.value}
                          </p>
                        )}
                      </div>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border whitespace-nowrap font-medium shrink-0 ${riskColors[alert.severity] ?? riskColors.medium}`}>
                        {riskLabels[alert.severity] ?? alert.severity}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                      <Clock size={9} />
                      {new Date(alert.time).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity chart */}
          <div className="bg-white rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={15} className="text-primary" />
              <h2 className="text-sm font-semibold text-foreground font-serif">Activité mensuelle</h2>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={activityData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#F2A7A7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F2A7A7" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="bGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#C96B4B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C96B4B" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mois" tick={{ fontSize: 9, fill: "#8d7f7f" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #F2A7A7", background: "#FFF9F5" }} />
                <Area type="monotone" dataKey="consultations" stroke="#F2A7A7" fill="url(#cGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="naissances"    stroke="#C96B4B" fill="url(#bGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#F2A7A7]" /><span className="text-[10px] text-muted-foreground">Consultations</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#C96B4B]" /><span className="text-[10px] text-muted-foreground">Naissances</span></div>
            </div>
          </div>

          {/* Next birth */}
          {patientList.filter((p) => p.weeks >= 37)[0] && (() => {
            const p = patientList.filter((pt) => pt.weeks >= 37)[0];
            return (
              <div className="bg-gradient-to-br from-[#F7C5A0]/40 to-[#F2A7A7]/20 rounded-2xl border border-[#F7C5A0]/40 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-foreground">Prochaine naissance</span>
                </div>
                <p className="font-serif text-base font-bold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.weeks} SA{p.dpa ? ` · DPA : ${new Date(p.dpa).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : ""}</p>
                <button
                  onClick={() => navigate(`/sage-femme/patientes/${p.id}`)}
                  className="mt-3 w-full bg-primary text-white text-xs py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Voir le dossier
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
