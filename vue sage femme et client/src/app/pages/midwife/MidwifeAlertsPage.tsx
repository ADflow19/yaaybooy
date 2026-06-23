import { useState } from "react";
import {
  AlertTriangle,
  Activity,
  Droplets,
  Heart,
  Baby,
  Phone,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";

type Severity = "critical" | "high" | "medium" | "resolved";
type AlertCategory = "bp" | "glycemia" | "movement" | "weight" | "heartrate" | "other";

interface Alert {
  id: number;
  patient: string;
  weeks: number;
  severity: Severity;
  category: AlertCategory;
  title: string;
  value: string;
  normal: string;
  time: string;
  note: string;
  resolved: boolean;
}

const alerts: Alert[] = [
  { id: 1, patient: "Rokhaya Ndiaye", weeks: 36, severity: "critical", category: "bp", title: "Hypertension sévère", value: "158/98 mmHg", normal: "< 140/90", time: "Aujourd'hui 10h32", note: "Protéinurie +2. Pré-éclampsie suspectée. Hospitalisation recommandée.", resolved: false },
  { id: 2, patient: "Ndèye Diop", weeks: 38, severity: "high", category: "movement", title: "Mouvements fœtaux réduits", value: "< 10 mouvements / 12h", normal: "> 10 mouvements", time: "Aujourd'hui 05h14", note: "La patiente signale une baisse des mouvements depuis hier soir. RDV prévu aujourd'hui.", resolved: false },
  { id: 3, patient: "Aïda Gueye", weeks: 22, severity: "medium", category: "glycemia", title: "Glycémie post-prandiale élevée", value: "1.82 g/L", normal: "< 1.40 g/L", time: "Hier 14h55", note: "Diabète gestationnel à surveiller. Régime alimentaire à revoir.", resolved: false },
  { id: 4, patient: "Mariama Sow", weeks: 28, severity: "medium", category: "weight", title: "Prise de poids rapide", value: "+3.2 kg / 2 sem.", normal: "< 1 kg / sem.", time: "22 juin", note: "Oedèmes aux chevilles. Surveillance accrue recommandée.", resolved: false },
  { id: 5, patient: "Khady Fall", weeks: 30, severity: "resolved", category: "heartrate", title: "Tachycardie fœtale", value: "178 bpm", normal: "110–160 bpm", time: "18 juin", note: "Normalisé après repos. BCF à 148 bpm lors du dernier contrôle.", resolved: true },
  { id: 6, patient: "Fatou Diallo", weeks: 32, severity: "resolved", category: "bp", title: "Tension légèrement élevée", value: "138/88 mmHg", normal: "< 130/80", time: "15 juin", note: "TA normalisée. Repos prescrit, contrôle à J+7.", resolved: true },
];

const severityConfig = {
  critical: { label: "Critique", bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/25", dot: "bg-destructive animate-pulse" },
  high: { label: "Élevé", bg: "bg-[#F7C5A0]/40", text: "text-[#C96B4B]", border: "border-[#F7C5A0]", dot: "bg-[#C96B4B]" },
  medium: { label: "Modéré", bg: "bg-[#B07590]/10", text: "text-[#B07590]", border: "border-[#B07590]/20", dot: "bg-[#B07590]" },
  resolved: { label: "Résolu", bg: "bg-muted", text: "text-muted-foreground", border: "border-border", dot: "bg-muted-foreground/40" },
};

const categoryIcon = {
  bp: Activity,
  glycemia: Droplets,
  movement: Baby,
  weight: Heart,
  heartrate: Heart,
  other: AlertTriangle,
};

const filterOptions: { key: "all" | Severity; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "critical", label: "Critiques" },
  { key: "high", label: "Élevées" },
  { key: "medium", label: "Modérées" },
  { key: "resolved", label: "Résolues" },
];

export function MidwifeAlertsPage() {
  const [filter, setFilter] = useState<"all" | Severity>("all");
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const filtered = alerts.filter(a => filter === "all" || a.severity === filter);
  const active = alerts.filter(a => !a.resolved);
  const critical = alerts.filter(a => a.severity === "critical");

  return (
    <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-serif font-semibold text-foreground">Alertes médicales</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{active.length} alertes actives · {critical.length} critiques</p>
      </div>

      {/* Critical banner */}
      {critical.length > 0 && (
        <div className="bg-destructive/8 border border-destructive/25 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-semibold text-destructive">Alerte critique</span>
          </div>
          <p className="text-sm text-foreground font-semibold">{critical[0].patient} — {critical[0].title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{critical[0].note}</p>
          <div className="flex gap-2 mt-3">
            <button className="flex items-center gap-1.5 bg-destructive text-white text-xs px-3 py-2 rounded-xl font-medium hover:bg-destructive/90 transition-colors">
              <Phone size={13} /> Appeler la patiente
            </button>
            <button className="flex items-center gap-1.5 bg-white border border-destructive/30 text-destructive text-xs px-3 py-2 rounded-xl font-medium hover:bg-destructive/5 transition-colors">
              Voir le dossier <ChevronRight size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Summary chips */}
      <div className="grid grid-cols-4 gap-2">
        {(["critical", "high", "medium", "resolved"] as Severity[]).map((s) => {
          const cfg = severityConfig[s];
          const count = alerts.filter(a => a.severity === s).length;
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
        {filtered.map((alert) => {
          const cfg = severityConfig[alert.severity];
          const Icon = categoryIcon[alert.category];
          const isExpanded = expandedId === alert.id;

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border overflow-hidden transition-all ${cfg.bg} ${cfg.border}`}
            >
              <button
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                onClick={() => setExpandedId(isExpanded ? null : alert.id)}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${alert.severity === "resolved" ? "bg-muted" : "bg-white/60"}`}>
                  <Icon size={15} className={cfg.text} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${alert.resolved ? "text-muted-foreground" : "text-foreground"}`}>{alert.patient}</p>
                    <span className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${alert.resolved ? "text-muted-foreground/70" : "text-muted-foreground"}`}>{alert.title}</p>
                </div>

                {/* Time */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground justify-end">
                    <Clock size={9} /> {alert.time}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{alert.weeks} SA</p>
                </div>
              </button>

              {/* Expanded */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-black/5">
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="bg-white/60 rounded-xl p-2.5">
                      <p className="text-[10px] text-muted-foreground">Valeur mesurée</p>
                      <p className={`text-sm font-bold font-mono mt-0.5 ${alert.resolved ? "text-muted-foreground" : cfg.text}`}>{alert.value}</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-2.5">
                      <p className="text-[10px] text-muted-foreground">Valeur normale</p>
                      <p className="text-sm font-bold font-mono mt-0.5 text-foreground/60">{alert.normal}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{alert.note}</p>
                  {!alert.resolved && (
                    <div className="flex gap-2 mt-3">
                      <button className="flex items-center gap-1.5 bg-white border border-border text-foreground text-xs px-3 py-2 rounded-xl font-medium hover:bg-muted transition-colors">
                        <Phone size={12} /> Appeler
                      </button>
                      <button className="flex items-center gap-1.5 bg-white border border-border text-foreground text-xs px-3 py-2 rounded-xl font-medium hover:bg-muted transition-colors">
                        Voir dossier <ChevronRight size={12} />
                      </button>
                      <button className="ml-auto flex items-center gap-1.5 bg-white border border-[#B07590]/30 text-[#B07590] text-xs px-3 py-2 rounded-xl font-medium hover:bg-[#B07590]/10 transition-colors">
                        <CheckCircle2 size={12} /> Résoudre
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
