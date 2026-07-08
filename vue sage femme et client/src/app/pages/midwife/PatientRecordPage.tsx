import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft, Phone, MessageCircle, AlertTriangle,
  Heart, Activity, Droplets, Scale, FileText,
  CalendarDays, Plus, ChevronDown, Thermometer, Stethoscope,
  Edit2, X, Save,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from "recharts";
import { useApiCall } from "../../../hooks/useApiCall";
import { midwifeService } from "../../../api/midwifeService";
import type { MeasurementRead, ConsultationCreate, PatientUpdate } from "../../../api/types";

// ── Labels lisibles pour les types de mesures ─────────────────────────────────
const MEASUREMENT_LABELS: Record<string, string> = {
  "blood-pressure": "Tension artérielle",
  "heart-rate":     "Rythme cardiaque",
  "temperature":    "Température",
  "baby-movements": "Mouvements fœtaux",
};

// ── Groupes sanguins disponibles ──────────────────────────────────────────────
const BLOOD_TYPES = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

const tabs = ["Résumé", "Profil", "Constantes", "Consultations", "Documents"];

export function PatientRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab,  setActiveTab]  = useState("Résumé");
  const [noteOpen,   setNoteOpen]   = useState(false);
  const [noteText,   setNoteText]   = useState("");
  const [saving,     setSaving]     = useState(false);

  const patientId = Number(id);

  const { data: dossier, loading, error, refetch } = useApiCall(
    () => midwifeService.getPatient(patientId),
    [patientId]
  );

  async function saveNote() {
    if (!noteText.trim() || !dossier) return;
    setSaving(true);
    try {
      const payload: ConsultationCreate = {
        date:  new Date().toISOString().split("T")[0],
        sa:    dossier.weeks ? `${dossier.weeks} SA` : undefined,
        notes: noteText,
        type:  "Routine",
      };
      await midwifeService.createNote(patientId, payload);
      setNoteText("");
      setNoteOpen(false);
      refetch();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 animate-pulse space-y-4">
        <div className="h-20 bg-gray-100 rounded-2xl" />
        <div className="h-64 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !dossier) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <button onClick={() => navigate("/sage-femme/patientes")} className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
          <ArrowLeft size={15} /> Retour
        </button>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600">
          {error ?? "Patiente introuvable"}
        </div>
      </div>
    );
  }

  const isHighRisk = dossier.risk === "high";

  // Mesures partagées → graphiques
  const bpMeasures   = dossier.measurements.filter((m) => m.type === "blood-pressure");
  const wMeasures    = dossier.measurements.filter((m) => m.type === "temperature");

  const bpData = bpMeasures.map((m) => {
    const parts = m.value.replace(" mmHg", "").split("/");
    return {
      sa:  new Date(m.recorded_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
      sys: Number(parts[0]) || 0,
      dia: Number(parts[1]) || 0,
    };
  });

  // Vitals depuis la dernière mesure de chaque type
  function lastVal(type: MeasurementRead["type"]) {
    return dossier.measurements.find((m) => m.type === type);
  }
  const vitals = [
    { icon: Heart,       label: "Fréquence card.", m: lastVal("heart-rate")     },
    { icon: Activity,    label: "Tension art.",    m: lastVal("blood-pressure") },
    { icon: Thermometer, label: "Température",     m: lastVal("temperature")    },
    { icon: Scale,       label: "Poids",           m: null                      },
    { icon: Droplets,    label: "SpO₂",            m: null                      },
    { icon: Stethoscope, label: "BCF",             m: lastVal("baby-movements") },
  ];

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
            {dossier.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-serif font-semibold text-foreground">{dossier.name}</h1>
              {isHighRisk && (
                <span className="flex items-center gap-1 text-[11px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full border border-destructive/20 font-medium">
                  <AlertTriangle size={10} /> Risque élevé
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {dossier.age    && <span className="text-xs text-muted-foreground">{dossier.age} ans</span>}
              <span className="text-xs text-muted-foreground">G{dossier.gravida}P{dossier.para}</span>
              <span className="text-xs text-muted-foreground">{dossier.weeks} SA</span>
              {dossier.dpa    && <span className="text-xs text-muted-foreground">DPA : {new Date(dossier.dpa).toLocaleDateString("fr-FR")}</span>}
              {dossier.blood_type && <span className="text-xs text-muted-foreground">Groupe {dossier.blood_type}</span>}
              {dossier.village && <span className="text-xs text-muted-foreground">{dossier.village}</span>}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            {dossier.phone && (
              <a href={`tel:${dossier.phone}`} className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
                <Phone size={15} />
              </a>
            )}
            <button className="w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
              <MessageCircle size={15} />
            </button>
          </div>
        </div>

        <div className="flex gap-1 mt-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-8 space-y-5">

        {/* ── Résumé ─────────────────────────────────────────────── */}
        {activeTab === "Résumé" && (
          <>
            {/* Active alert banner */}
            {dossier.alerts.filter((a) => !a.resolved).length > 0 && (
              <div className="bg-destructive/8 border border-destructive/25 rounded-2xl p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Alerte médicale active</p>
                  <p className="text-xs text-destructive/80 mt-0.5">
                    {dossier.alerts.filter((a) => !a.resolved)[0].title}
                    {dossier.alerts.filter((a) => !a.resolved)[0].value
                      ? ` — ${dossier.alerts.filter((a) => !a.resolved)[0].value}`
                      : ""}
                  </p>
                </div>
              </div>
            )}

            {/* Quick vitals */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground font-serif">Dernières constantes</h2>
                {dossier.measurements.length === 0 && (
                  <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Aucune mesure partagée
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {vitals.map((v) => {
                  const abnormal = v.m?.status === "alert";
                  return (
                    <div key={v.label} className={`rounded-xl border p-3 ${abnormal ? "bg-destructive/5 border-destructive/20" : "bg-white border-border"}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <v.icon size={13} className={abnormal ? "text-destructive" : "text-muted-foreground"} />
                        <span className="text-[10px] text-muted-foreground">{v.label}</span>
                      </div>
                      <p className={`text-base font-serif font-bold ${abnormal ? "text-destructive" : v.m ? "text-foreground" : "text-muted-foreground"}`}>
                        {v.m?.value ?? <span className="text-xs font-normal">Non partagé</span>}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Patient info tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Semaines",   value: `${dossier.weeks} SA` },
                { label: "Groupe",     value: dossier.blood_type ?? "—" },
                { label: "Parité",     value: `G${dossier.gravida}P${dossier.para}` },
                { label: "Village",    value: dossier.village ?? "—" },
              ].map((item) => (
                <div key={item.label} className="bg-[#FDF6F0] rounded-xl p-3 text-center">
                  <p className="text-lg font-serif font-bold text-[#C96B4B]">{item.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>

            {/* BP chart — affiché dès qu'il y a au moins 1 mesure */}
            {bpData.length >= 1 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="text-sm font-semibold text-foreground font-serif mb-4">
                  Évolution tension artérielle
                  {bpData.length === 1 && <span className="text-[10px] text-muted-foreground font-normal ml-2">(1 mesure)</span>}
                </h2>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={bpData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F2A7A7" strokeOpacity={0.3} />
                    <XAxis dataKey="sa" tick={{ fontSize: 10, fill: "#8d7f7f" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[60, 180]} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #F2A7A7", background: "#FFF9F5" }} />
                    <ReferenceLine y={140} stroke="#d4183d" strokeDasharray="4 4" strokeOpacity={0.5} />
                    <Line type="monotone" dataKey="sys" stroke="#C96B4B" strokeWidth={2} dot={{ r: 4, fill: "#C96B4B" }} name="Systolique" />
                    <Line type="monotone" dataKey="dia" stroke="#F2A7A7" strokeWidth={2} dot={{ r: 4, fill: "#F2A7A7" }} name="Diastolique" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Add clinical note */}
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
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Observations cliniques, prescriptions, recommandations…"
                    rows={4}
                    className="w-full mt-3 p-3 text-sm bg-muted rounded-xl border border-border resize-none outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setNoteOpen(false)} className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">Annuler</button>
                    <button
                      disabled={saving || !noteText.trim()}
                      onClick={saveNote}
                      className="px-4 py-1.5 bg-primary text-white text-xs rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {saving ? "Enregistrement…" : "Enregistrer"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Constantes ─────────────────────────────────────────── */}
        {activeTab === "Constantes" && (
          <div className="space-y-3">
            {dossier.measurements.length === 0 ? (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-center space-y-2">
                <p className="text-sm font-semibold text-amber-700">Aucune mesure enregistrée</p>
                <p className="text-xs text-amber-600">
                  La patiente n'a pas encore partagé de mesures IoT avec vous.
                  Les mesures apparaîtront ici une fois qu'elle les aura enregistrées
                  et partagées depuis son espace.
                </p>
              </div>
            ) : (
              dossier.measurements.map((m) => (
                <div key={m.id} className={`bg-white rounded-2xl border p-4 ${m.status === "alert" ? "border-destructive/20" : "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {MEASUREMENT_LABELS[m.type] ?? m.type}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(m.recorded_at).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-serif font-bold ${m.status === "alert" ? "text-destructive" : "text-foreground"}`}>{m.value}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        m.status === "normal"  ? "bg-green-100 text-green-700"  :
                        m.status === "warning" ? "bg-orange-100 text-orange-700":
                        "bg-red-100 text-red-700"}`}>
                        {m.status === "normal" ? "Normal" : m.status === "warning" ? "Attention" : "Alerte"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Consultations ──────────────────────────────────────── */}
        {activeTab === "Consultations" && (
          <div className="space-y-3">
            {dossier.consultations.length === 0 ? (
              <div className="bg-white rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
                Aucune note clinique enregistrée
              </div>
            ) : (
              dossier.consultations.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={14} className="text-primary" />
                      <span className="text-xs font-semibold text-foreground">
                        {new Date(c.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      {c.sa && <span className="text-[10px] text-muted-foreground">{c.sa}</span>}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.type === "Urgente" ? "bg-destructive/10 text-destructive" : "bg-[#F2A7A7]/20 text-[#B07590]"}`}>
                      {c.type}
                    </span>
                  </div>
                  {c.notes    && <p className="text-xs text-muted-foreground leading-relaxed">{c.notes}</p>}
                  {c.provider && <p className="text-[10px] text-muted-foreground/60 mt-2">{c.provider}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Documents ──────────────────────────────────────────── */}
        {activeTab === "Documents" && (
          <div className="space-y-2">
            <div className="bg-white rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">
              Fonctionnalité documents à venir
            </div>
            <button className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
              <Plus size={14} /> Ajouter un document
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
