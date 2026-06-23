import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  AlertTriangle,
  Heart,
  Activity,
  Droplets,
  Scale,
  FileText,
  CalendarDays,
  Plus,
  ChevronDown,
  Baby,
  Thermometer,
  Stethoscope,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

const patientData: Record<string, {
  name: string; age: number; weeks: number; dpa: string; bloodType: string;
  phone: string; village: string; gravida: number; para: number; risk: string;
  height: number; weight: number; initWeight: number;
}> = {
  "1": { name: "Fatou Diallo", age: 28, weeks: 32, dpa: "12 août 2025", bloodType: "A+", phone: "+221 77 123 45 67", village: "Thiès", gravida: 2, para: 1, risk: "normal", height: 163, weight: 72, initWeight: 65 },
  "2": { name: "Rokhaya Ndiaye", age: 34, weeks: 36, dpa: "21 juil. 2025", bloodType: "O-", phone: "+221 76 234 56 78", village: "Mbour", gravida: 3, para: 2, risk: "high", height: 158, weight: 79, initWeight: 70 },
};

const bpData = [
  { sa: "20 SA", sys: 110, dia: 70 },
  { sa: "24 SA", sys: 118, dia: 75 },
  { sa: "28 SA", sys: 125, dia: 80 },
  { sa: "32 SA", sys: 120, dia: 78 },
  { sa: "36 SA", sys: 158, dia: 98 },
];

const weightData = [
  { sa: "12 SA", weight: 65 },
  { sa: "16 SA", weight: 66.5 },
  { sa: "20 SA", weight: 68 },
  { sa: "24 SA", weight: 70 },
  { sa: "28 SA", weight: 73 },
  { sa: "32 SA", weight: 75 },
  { sa: "36 SA", weight: 79 },
];

const consultations = [
  { date: "23 juin 2025", sa: "36 SA", type: "Urgente", notes: "TA 158/98 mmHg. Protéinurie +2. Suspicion pré-éclampsie. Hospitalisation recommandée.", provider: "Aïssatou Fall" },
  { date: "9 juin 2025", sa: "34 SA", type: "Routine", notes: "Bonne présentation fœtale. BCF 148 bpm. TA 132/84. Prise de poids normale.", provider: "Aïssatou Fall" },
  { date: "26 mai 2025", sa: "32 SA", type: "Routine", notes: "Écho normale. Estimation poids fœtal 1800g. Mouvements actifs.", provider: "Aïssatou Fall" },
];

const vitals = [
  { icon: Heart, label: "Fréquence card.", value: "88 bpm", normal: true },
  { icon: Activity, label: "Tension art.", value: "158/98", normal: false },
  { icon: Thermometer, label: "Température", value: "37.2 °C", normal: true },
  { icon: Scale, label: "Poids", value: "79 kg", normal: true },
  { icon: Droplets, label: "SpO₂", value: "98%", normal: true },
  { icon: Stethoscope, label: "BCF", value: "142 bpm", normal: true },
];

const tabs = ["Résumé", "Constantes", "Consultations", "Documents"];

export function PatientRecordPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Résumé");
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");

  const patient = patientData[id || "2"] || patientData["2"];
  const isHighRisk = patient.risk === "high";

  const bmi = (patient.weight / ((patient.height / 100) ** 2)).toFixed(1);
  const weightGain = (patient.weight - patient.initWeight).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className={`px-4 lg:px-8 py-5 border-b border-border ${isHighRisk ? "bg-destructive/5" : "bg-white"}`}>
        <button
          onClick={() => navigate("/sage-femme/patientes")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft size={15} /> Retour à la liste
        </button>

        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-base font-bold shrink-0 ${isHighRisk ? "bg-destructive/15 text-destructive" : "bg-[#F7C5A0] text-[#C96B4B]"}`}>
            {patient.name.split(" ").map(n => n[0]).join("")}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-serif font-semibold text-foreground">{patient.name}</h1>
              {isHighRisk && (
                <span className="flex items-center gap-1 text-[11px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full border border-destructive/20 font-medium">
                  <AlertTriangle size={10} /> Risque élevé
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span className="text-xs text-muted-foreground">{patient.age} ans</span>
              <span className="text-xs text-muted-foreground">G{patient.gravida}P{patient.para}</span>
              <span className="text-xs text-muted-foreground">{patient.weeks} SA</span>
              <span className="text-xs text-muted-foreground">DPA : {patient.dpa}</span>
              <span className="text-xs text-muted-foreground">Groupe {patient.bloodType}</span>
              <span className="text-xs text-muted-foreground">{patient.village}</span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <button className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
              <Phone size={15} />
            </button>
            <button className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
              <MessageCircle size={15} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-8 space-y-5">
        {activeTab === "Résumé" && (
          <>
            {/* Alert banner */}
            {isHighRisk && (
              <div className="bg-destructive/8 border border-destructive/25 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Alerte médicale active</p>
                  <p className="text-xs text-destructive/80 mt-0.5">Tension artérielle élevée détectée (158/98 mmHg). Protéinurie +2. Suspicion de pré-éclampsie — hospitalisation recommandée.</p>
                </div>
              </div>
            )}

            {/* Quick vitals */}
            <div>
              <h2 className="text-sm font-semibold text-foreground font-serif mb-3">Dernières constantes</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {vitals.map((v) => (
                  <div key={v.label} className={`rounded-xl border p-3 ${v.normal ? "bg-white border-border" : "bg-destructive/5 border-destructive/20"}`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <v.icon size={13} className={v.normal ? "text-muted-foreground" : "text-destructive"} />
                      <span className="text-[10px] text-muted-foreground">{v.label}</span>
                    </div>
                    <p className={`text-base font-serif font-bold ${v.normal ? "text-foreground" : "text-destructive"}`}>{v.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pregnancy info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Semaines", value: `${patient.weeks} SA` },
                { label: "IMC actuel", value: bmi },
                { label: "Prise de poids", value: `+${weightGain} kg` },
                { label: "Taille", value: `${patient.height} cm` },
              ].map((item) => (
                <div key={item.label} className="bg-[#FDF6F0] rounded-xl p-3 text-center">
                  <p className="text-lg font-serif font-bold text-[#C96B4B]">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>

            {/* BP Chart */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="text-sm font-semibold text-foreground font-serif mb-4">Évolution tension artérielle</h2>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={bpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2A7A7" strokeOpacity={0.3} />
                  <XAxis dataKey="sa" tick={{ fontSize: 10, fill: "#8d7f7f" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[60, 180]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #F2A7A7", background: "#FFF9F5" }} />
                  <ReferenceLine y={140} stroke="#d4183d" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: "140", position: "right", fontSize: 9, fill: "#d4183d" }} />
                  <ReferenceLine y={90} stroke="#d4183d" strokeDasharray="4 4" strokeOpacity={0.3} label={{ value: "90", position: "right", fontSize: 9, fill: "#d4183d" }} />
                  <Line type="monotone" dataKey="sys" stroke="#C96B4B" strokeWidth={2} dot={{ r: 4, fill: "#C96B4B" }} name="Systolique" />
                  <Line type="monotone" dataKey="dia" stroke="#F2A7A7" strokeWidth={2} dot={{ r: 4, fill: "#F2A7A7" }} name="Diastolique" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#C96B4B]" /><span className="text-[10px] text-muted-foreground">Systolique</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#F2A7A7]" /><span className="text-[10px] text-muted-foreground">Diastolique</span></div>
                <div className="flex items-center gap-1.5"><div className="w-8 border-t-2 border-dashed border-destructive/50" /><span className="text-[10px] text-muted-foreground">Seuil alerte</span></div>
              </div>
            </div>

            {/* Add note */}
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => setNoteOpen(!noteOpen)}
                className="w-full flex items-center gap-2 px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/30 transition-colors"
              >
                <Plus size={15} className="text-primary" />
                Ajouter une note clinique
                <ChevronDown size={14} className={`ml-auto text-muted-foreground transition-transform ${noteOpen ? "rotate-180" : ""}`} />
              </button>
              {noteOpen && (
                <div className="px-5 pb-4 border-t border-border">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Observations cliniques, prescriptions, recommandations…"
                    rows={4}
                    className="w-full mt-3 p-3 text-sm bg-muted rounded-xl border border-border resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setNoteOpen(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Annuler</button>
                    <button className="px-4 py-1.5 bg-primary text-white text-xs rounded-lg font-medium hover:bg-primary/90 transition-colors">Enregistrer</button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "Constantes" && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="text-sm font-semibold font-serif mb-4">Courbe de poids</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F2A7A7" strokeOpacity={0.3} />
                <XAxis dataKey="sa" tick={{ fontSize: 10, fill: "#8d7f7f" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 85]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #F2A7A7", background: "#FFF9F5" }} formatter={(v) => [`${v} kg`, "Poids"]} />
                <Line type="monotone" dataKey="weight" stroke="#B07590" strokeWidth={2.5} dot={{ r: 4, fill: "#B07590" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "Consultations" && (
          <div className="space-y-3">
            {consultations.map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-primary" />
                    <span className="text-xs font-semibold text-foreground">{c.date}</span>
                    <span className="text-[10px] text-muted-foreground">{c.sa}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.type === "Urgente" ? "bg-destructive/10 text-destructive" : "bg-[#F2A7A7]/20 text-[#B07590]"}`}>
                    {c.type}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.notes}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-2">{c.provider}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="space-y-2">
            {["Résultats labo — 23 juin 2025", "Échographie morphologique — 9 juin 2025", "Carnet de grossesse", "Résultats NFS — 26 mai 2025"].map((doc) => (
              <div key={doc} className="bg-white rounded-xl border border-border flex items-center gap-3 px-4 py-3 hover:bg-muted/20 cursor-pointer transition-colors">
                <FileText size={15} className="text-primary shrink-0" />
                <span className="text-sm text-foreground flex-1">{doc}</span>
                <span className="text-[10px] text-muted-foreground">PDF</span>
              </div>
            ))}
            <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
              <Plus size={14} /> Ajouter un document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
