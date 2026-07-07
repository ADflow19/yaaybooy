import { useState } from "react";
import { useNavigate } from "react-router";
import { Search, ChevronRight, Phone, MessageCircle, Baby, AlertTriangle } from "lucide-react";
import { useApiCall } from "../../../hooks/useApiCall";
import { midwifeService } from "../../../api/midwifeService";
import type { PatientRead, RiskLevel } from "../../../api/types";

const riskConfig: Record<RiskLevel, { label: string; bg: string; text: string; border: string; dot: string }> = {
  high:   { label: "Risque élevé", bg: "bg-destructive/10",  text: "text-destructive",  border: "border-destructive/20", dot: "bg-destructive" },
  watch:  { label: "Surveiller",   bg: "bg-[#F7C5A0]/40",    text: "text-[#C96B4B]",    border: "border-[#F7C5A0]",      dot: "bg-[#C96B4B]"  },
  normal: { label: "Normal",       bg: "bg-[#F2A7A7]/15",    text: "text-[#B07590]",    border: "border-[#F2A7A7]/30",   dot: "bg-[#B07590]"  },
};

const avatarColors = [
  "bg-[#F2A7A7] text-[#C96B4B]",
  "bg-[#F7C5A0] text-[#C96B4B]",
  "bg-[#B07590]/20 text-[#B07590]",
  "bg-[#FDF6F0] text-[#C96B4B]",
];

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
}

export function PatientListPage() {
  const navigate = useNavigate();
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"all" | RiskLevel>("all");

  const { data: patients, loading, error } = useApiCall(
    () => midwifeService.listPatients(search || undefined, filter !== "all" ? filter : undefined),
    [search, filter]
  );

  const list = patients ?? [];

  // Filtrage local pour la recherche (le backend fait aussi la recherche mais on garde la réactivité locale)
  const filtered = list.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.village ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.risk === filter;
    return matchSearch && matchFilter;
  });

  const countByRisk = (r: RiskLevel) => list.filter((p) => p.risk === r).length;

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-semibold text-foreground">Mes Patientes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? "Chargement…" : `${list.length} patiente${list.length !== 1 ? "s" : ""} suivie${list.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors">
          <Baby size={15} />
          <span className="hidden sm:inline">Nouvelle patiente</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher par nom ou village…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "high", "watch", "normal"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                filter === f
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:border-primary/40"
              }`}
            >
              {f === "all" ? "Toutes" : riskConfig[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Risk summary */}
      {!loading && (
        <div className="grid grid-cols-3 gap-3">
          {(["high", "watch", "normal"] as const).map((risk) => {
            const cfg = riskConfig[risk];
            return (
              <button
                key={risk}
                onClick={() => setFilter(risk === filter ? "all" : risk)}
                className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm ${cfg.bg} ${cfg.border} ${filter === risk ? "ring-2 ring-primary/30" : ""}`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  <span className={`text-[10px] font-semibold uppercase tracking-wide ${cfg.text}`}>{cfg.label}</span>
                </div>
                <p className={`text-xl font-serif font-bold ${cfg.text}`}>{countByRisk(risk)}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* States */}
      {loading && (
        <div className="space-y-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      {/* Patient list */}
      {!loading && !error && (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">Aucune patiente trouvée</div>
          )}
          {filtered.map((patient: PatientRead, i: number) => {
            const cfg = riskConfig[patient.risk];
            const avatarClass = avatarColors[i % avatarColors.length];
            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-all cursor-pointer group"
                onClick={() => navigate(`/sage-femme/patientes/${patient.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarClass}`}>
                    {patient.photo ?? initials(patient.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground">{patient.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="text-xs text-muted-foreground">{patient.weeks} SA</span>
                      <span className="text-muted-foreground/40 text-xs">·</span>
                      <span className="text-xs text-muted-foreground">G{patient.gravida}P{patient.para}</span>
                      {patient.dpa && (
                        <>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="text-xs text-muted-foreground">
                            DPA : {new Date(patient.dpa).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          </span>
                        </>
                      )}
                      {patient.village && (
                        <>
                          <span className="text-muted-foreground/40 text-xs hidden sm:inline">·</span>
                          <span className="text-xs text-muted-foreground hidden sm:inline">{patient.village}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {patient.next_visit && (
                    <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-[10px] text-muted-foreground">Prochain RDV</span>
                      <span className="text-xs font-medium text-foreground">
                        {new Date(patient.next_visit).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    {patient.phone && (
                      <button
                        onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${patient.phone}`; }}
                        className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#F2A7A7]/30 hover:text-primary transition-colors"
                      >
                        <Phone size={13} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Ouvre le dossier pour accéder au numéro et envoyer un message
                        navigate(`/sage-femme/patientes/${patient.id}`);
                      }}
                      className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#F2A7A7]/30 hover:text-primary transition-colors"
                    >
                      <MessageCircle size={13} />
                    </button>
                    <ChevronRight size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
