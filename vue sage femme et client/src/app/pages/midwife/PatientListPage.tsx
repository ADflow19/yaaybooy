import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Search,
  SlidersHorizontal,
  ChevronRight,
  Phone,
  MessageCircle,
  Baby,
  AlertTriangle,
  Eye,
} from "lucide-react";

interface Patient {
  id: string;
  name: string;
  age: number;
  weeks: number;
  dpa: string;
  lastVisit: string;
  nextVisit: string;
  risk: "high" | "watch" | "normal";
  bloodType: string;
  phone: string;
  village: string;
  gravida: number;
  para: number;
  alerts: number;
  photo: string;
}

const patients: Patient[] = [
  { id: "1", name: "Fatou Diallo", age: 28, weeks: 32, dpa: "12 août 2025", lastVisit: "20 juin", nextVisit: "27 juin", risk: "normal", bloodType: "A+", phone: "+221 77 123 45 67", village: "Thiès", gravida: 2, para: 1, alerts: 0, photo: "FD" },
  { id: "2", name: "Rokhaya Ndiaye", age: 34, weeks: 36, dpa: "21 juil. 2025", lastVisit: "23 juin", nextVisit: "25 juin", risk: "high", bloodType: "O-", phone: "+221 76 234 56 78", village: "Mbour", gravida: 3, para: 2, alerts: 2, photo: "RN" },
  { id: "3", name: "Mariama Sow", age: 24, weeks: 28, dpa: "14 sept. 2025", lastVisit: "22 juin", nextVisit: "6 juil.", risk: "normal", bloodType: "B+", phone: "+221 70 345 67 89", village: "Thiès", gravida: 1, para: 0, alerts: 0, photo: "MS" },
  { id: "4", name: "Ndèye Diop", age: 31, weeks: 38, dpa: "26 juin 2025", lastVisit: "20 juin", nextVisit: "Aujourd'hui", risk: "watch", bloodType: "AB+", phone: "+221 78 456 78 90", village: "Tivaouane", gravida: 4, para: 3, alerts: 1, photo: "ND" },
  { id: "5", name: "Adja Mbaye", age: 22, weeks: 20, dpa: "5 nov. 2025", lastVisit: "23 juin", nextVisit: "7 juil.", risk: "normal", bloodType: "A+", phone: "+221 77 567 89 01", village: "Thiès", gravida: 1, para: 0, alerts: 0, photo: "AM" },
  { id: "6", name: "Aminata Ba", age: 29, weeks: 14, dpa: "15 janv. 2026", lastVisit: "16 juin", nextVisit: "Aujourd'hui", risk: "normal", bloodType: "O+", phone: "+221 76 678 90 12", village: "Diourbel", gravida: 2, para: 1, alerts: 0, photo: "AB" },
  { id: "7", name: "Khady Fall", age: 26, weeks: 30, dpa: "22 sept. 2025", lastVisit: "9 juin", nextVisit: "Aujourd'hui", risk: "normal", bloodType: "A-", phone: "+221 70 789 01 23", village: "Thiès", gravida: 1, para: 0, alerts: 0, photo: "KF" },
  { id: "8", name: "Aïda Gueye", age: 38, weeks: 22, dpa: "20 oct. 2025", lastVisit: "18 juin", nextVisit: "2 juil.", risk: "watch", bloodType: "B-", phone: "+221 78 890 12 34", village: "Mbour", gravida: 5, para: 4, alerts: 1, photo: "AG" },
];

const riskConfig = {
  high: { label: "Risque élevé", bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", dot: "bg-destructive" },
  watch: { label: "Surveiller", bg: "bg-[#F7C5A0]/40", text: "text-[#C96B4B]", border: "border-[#F7C5A0]", dot: "bg-[#C96B4B]" },
  normal: { label: "Normal", bg: "bg-[#F2A7A7]/15", text: "text-[#B07590]", border: "border-[#F2A7A7]/30", dot: "bg-[#B07590]" },
};

const avatarColors = ["bg-[#F2A7A7] text-[#C96B4B]", "bg-[#F7C5A0] text-[#C96B4B]", "bg-[#B07590]/20 text-[#B07590]", "bg-[#FDF6F0] text-[#C96B4B]"];

export function PatientListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "high" | "watch" | "normal">("all");

  const filtered = patients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.village.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.risk === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-semibold text-foreground">Mes Patientes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{patients.length} patientes suivies</p>
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
      <div className="grid grid-cols-3 gap-3">
        {(["high", "watch", "normal"] as const).map((risk) => {
          const count = patients.filter((p) => p.risk === risk).length;
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
              <p className={`text-xl font-serif font-bold ${cfg.text}`}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Patient list */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Aucune patiente trouvée</div>
        )}
        {filtered.map((patient, i) => {
          const cfg = riskConfig[patient.risk];
          const avatarClass = avatarColors[i % avatarColors.length];
          return (
            <div
              key={patient.id}
              className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm transition-all cursor-pointer group"
              onClick={() => navigate(`/sage-femme/patientes/${patient.id}`)}
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarClass}`}>
                  {patient.photo}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{patient.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                      {cfg.label}
                    </span>
                    {patient.alerts > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-destructive font-medium">
                        <AlertTriangle size={10} /> {patient.alerts} alerte{patient.alerts > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">{patient.weeks} SA</span>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span className="text-xs text-muted-foreground">G{patient.gravida}P{patient.para}</span>
                    <span className="text-muted-foreground/40 text-xs">·</span>
                    <span className="text-xs text-muted-foreground">DPA : {patient.dpa}</span>
                    <span className="text-muted-foreground/40 text-xs hidden sm:inline">·</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">{patient.village}</span>
                  </div>
                </div>

                {/* Right side */}
                <div className="hidden md:flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] text-muted-foreground">Prochain RDV</span>
                  <span className="text-xs font-medium text-foreground">{patient.nextVisit}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
                    className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-[#F2A7A7]/30 hover:text-primary transition-colors"
                  >
                    <Phone size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); }}
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
    </div>
  );
}
