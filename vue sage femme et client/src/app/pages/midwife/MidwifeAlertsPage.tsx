import { useState } from "react";
import { useNavigate } from "react-router";
import {
  AlertTriangle, Activity, Droplets, Heart, Baby, Phone,
  CheckCircle2, Clock, ChevronRight, Filter,
} from "lucide-react";
import { useApiCall } from "../../../hooks/useApiCall";
import { midwifeService } from "../../../api/midwifeService";
import type { AlertRead, AlertSeverity, AlertCategory } from "../../../api/types";

type FilterKey = "all" | AlertSeverity;

const severityConfig: Record<AlertSeverity, { label: string; bg: string; text: string; border: string; dot: string }> = {
  critical: { label: "Critique", bg: "bg-destructive/10", text: "text-destructive",     border: "border-destructive/25", dot: "bg-destructive animate-pulse" },
  high:     { label: "Élevé",    bg: "bg-[#F7C5A0]/40",   text: "text-[#C96B4B]",       border: "border-[#F7C5A0]",      dot: "bg-[#C96B4B]"                },
  medium:   { label: "Modéré",   bg: "bg-[#B07590]/10",   text: "text-[#B07590]",       border: "border-[#B07590]/20",   dot: "bg-[#B07590]"                },
  resolved: { label: "Résolu",   bg: "bg-muted",          text: "text-muted-foreground", border: "border-border",         dot: "bg-muted-foreground/40"      },
};

const categoryIcon: Record<AlertCategory, React.ElementType> = {
  bp: Activity, glycemia: Droplets, movement: Baby,
  weight: Heart, heartrate: Heart, other: AlertTriangle,
};

const filterOptions: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "critical", label: "Critiques" },
  { key: "high", label: "Élevées" },
  { key: "medium", label: "Modérées" },
  { key: "resolved", label: "Résolues" },
];

export function MidwifeAlertsPage() {
  const navigate = useNavigate();
  const [filter, setFilter]       = useState<FilterKey>("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [resolving, setResolving]   = useState<number | null>(null);

  const { data, loading, error, refetch } = useApiCall(() => midwifeService.listAlerts());
  const alerts: AlertRead[] = data ?? [];

  const filtered  = alerts.filter((a) => filter === "all" || a.severity === filter);
  const active    = alerts.filter((a) => !a.resolved);
  const critical  = alerts.filter((a) => a.severity === "critical");

  async function handleResolve(id: number) {
    setResolving(id);
    try {
      await midwifeService.updateAlert(id, { resolved: true });
      refetch();
    } finally {
      setResolving(null);
    }
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-3 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-xl font-serif font-semibold text-foreground">Alertes médicales</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {active.length} alerte{active.length !== 1 ? "s" : ""} active{active.length !== 1 ? "s" : ""} · {critical.length} critique{critical.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Critical banner */}
      {critical.length > 0 && (
        <div className="bg-destructive/8 border border-destructive/25 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-semibold text-destructive">Alerte critique</span>
          </div>
          <p className="text-sm text-foreground font-semibold">
            {critical[0].title}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{critical[0].note}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigate(`/sage-femme/patientes/${critical[0].patient_id}`)}
              className="flex items-center gap-1.5 bg-destructive text-white text-xs px-3 py-2 rounded-xl font-medium hover:bg-destructive/90 transition-colors">
              <Phone size={13} /> Appeler la patiente
            </button>
            <button
              onClick={() => navigate(`/sage-femme/patientes/${critical[0].patient_id}`)}
              className="flex items-center gap-1.5 bg-white border border-destructive/30 text-destructive text-xs px-3 py-2 rounded-xl font-medium hover:bg-destructive/5 transition-colors"
            >
              Voir le dossier <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Summary chips */}
      <div className="grid grid-cols-4 gap-2">
        {(["critical", "high", "medium", "resolved"] as AlertSeverity[]).map((s) => {
          const cfg   = severityConfig[s];
          const count = alerts.filter((a) => a.severity === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(filter === s ? "all" : s)}
              className={`rounded-xl border p-2.5 text-center transition-all hover:shadow-sm ${cfg.bg} ${cfg.border} ${filter === s ? "ring-2 ring-primary/30" : ""}`}
            >
              <p className={`text-lg font-serif font-bold ${cfg.text}`}>{count}</p>
              <p className={`text-[9px] font-medium uppercase tracking-wide mt-0.5 ${cfg.text}`}>{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter size={13} className="text-muted-foreground shrink-0" />
        {filterOptions.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border transition-all ${
              filter === key
                ? "bg-primary text-white border-primary"
                : "bg-white text-muted-foreground border-border hover:border-primary/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Aucune alerte dans cette catégorie</div>
        )}
        {filtered.map((alert) => {
          const cfg        = severityConfig[alert.severity];
          const Icon       = categoryIcon[alert.category];
          const isExpanded = expandedId === alert.id;

          return (
            <div key={alert.id} className={`rounded-2xl border overflow-hidden transition-all ${cfg.bg} ${cfg.border}`}>
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${alert.resolved ? "bg-muted" : "bg-white/60"}`}>
                  <Icon size={15} className={cfg.text} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${alert.resolved ? "text-muted-foreground" : "text-foreground"}`}>
                      {alert.title}
                    </p>
                    <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  {alert.value && (
                    <p className={`text-xs mt-0.5 font-mono font-bold ${alert.resolved ? "text-muted-foreground/70" : cfg.text}`}>
                      {alert.value}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
                    <Clock size={9} />
                    {new Date(alert.time).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {alert.weeks && <p className="text-[10px] text-muted-foreground mt-0.5">{alert.weeks} SA</p>}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-black/5">
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {alert.value && (
                      <div className="bg-white/60 rounded-xl p-2.5">
                        <p className="text-[10px] text-muted-foreground">Valeur mesurée</p>
                        <p className={`text-sm font-bold font-mono mt-0.5 ${alert.resolved ? "text-muted-foreground" : cfg.text}`}>{alert.value}</p>
                      </div>
                    )}
                    {alert.normal && (
                      <div className="bg-white/60 rounded-xl p-2.5">
                        <p className="text-[10px] text-muted-foreground">Valeur normale</p>
                        <p className="text-sm font-bold font-mono mt-0.5 text-foreground/60">{alert.normal}</p>
                      </div>
                    )}
                  </div>
                  {alert.note && <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{alert.note}</p>}
                  {!alert.resolved && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/sage-femme/patientes/${alert.patient_id}`)}
                        className="flex items-center gap-1.5 bg-white border border-border text-foreground text-xs px-3 py-2 rounded-xl font-medium hover:bg-muted transition-colors"
                      >
                        <Phone size={12} /> Appeler
                      </button>
                      <button
                        onClick={() => navigate(`/sage-femme/patientes/${alert.patient_id}`)}
                        className="flex items-center gap-1.5 bg-white border border-border text-foreground text-xs px-3 py-2 rounded-xl font-medium hover:bg-muted transition-colors"
                      >
                        Voir dossier <ChevronRight size={12} />
                      </button>
                      <button
                        disabled={resolving === alert.id}
                        onClick={() => handleResolve(alert.id)}
                        className="ml-auto flex items-center gap-1.5 bg-white border border-[#B07590]/30 text-[#B07590] text-xs px-3 py-2 rounded-xl font-medium hover:bg-[#B07590]/10 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 size={12} /> {resolving === alert.id ? "…" : "Résoudre"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
