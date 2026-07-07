import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, ChevronRight, Plus, Clock, User, X } from "lucide-react";
import { useApiCall } from "../../../hooks/useApiCall";
import { midwifeService } from "../../../api/midwifeService";
import type { AppointmentRead, AppointmentType } from "../../../api/types";

const DAYS   = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const MONTHS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

const typeConfig: Record<AppointmentType, { label: string; color: string; bg: string; dot: string }> = {
  routine: { label: "Suivi routine",         color: "text-[#B07590]",   bg: "bg-[#B07590]/10 border-[#B07590]/20",    dot: "bg-[#B07590]"  },
  urgent:  { label: "Consultation urgente",  color: "text-destructive", bg: "bg-destructive/8 border-destructive/20",  dot: "bg-destructive" },
  birth:   { label: "Accouchement",          color: "text-[#C96B4B]",   bg: "bg-[#F7C5A0]/40 border-[#F7C5A0]",       dot: "bg-[#C96B4B]"  },
  first:   { label: "Première consultation", color: "text-[#B07590]",   bg: "bg-[#F2A7A7]/20 border-[#F2A7A7]/40",    dot: "bg-[#F2A7A7]"  },
};

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDay(y: number, m: number)    { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

// ── Modal : créer un RDV (sage-femme pour une patiente) ───────────────────────
function NewAppointmentModal({
  defaultDate,
  onClose,
  onCreated,
}: {
  defaultDate?: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [patientId, setPatientId] = useState("");
  const [type,      setType]      = useState<AppointmentType>("routine");
  const [date,      setDate]      = useState(defaultDate ?? "");
  const [time,      setTime]      = useState("09:00");
  const [note,      setNote]      = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const { data: patients } = useApiCall(() => midwifeService.listPatients());

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!patientId) { setError("Veuillez sélectionner une patiente"); return; }
    if (!date)      { setError("Veuillez choisir une date"); return; }
    setLoading(true); setError(null);
    try {
      await midwifeService.createMidwifeAppointment(Number(patientId), {
        scheduled_at: `${date}T${time}:00`,
        type,
        note: note || undefined,
      });
      onCreated();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Erreur lors de la création");
    } finally { setLoading(false); }
  }

  const inputCls = "w-full px-4 py-2.5 text-sm bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-serif text-lg font-semibold text-foreground">Nouveau rendez-vous</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Patiente */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Patiente *</label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className={inputCls}
            >
              <option value="">— Sélectionner une patiente —</option>
              {(patients ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.weeks} SA)</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)} className={inputCls}>
              {(Object.entries(typeConfig) as [AppointmentType, typeof typeConfig[AppointmentType]][]).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Date + Heure */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Date *</label>
              <input
                required type="date" value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Heure</label>
              <input
                type="time" value={time}
                onChange={(e) => setTime(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Note (optionnel)</label>
            <input
              type="text" value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Contrôle tensionnel, salle 2…"
              className={inputCls}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive bg-destructive/5 px-3 py-2 rounded-xl">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              {loading ? "Enregistrement…" : "Créer le RDV"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export function MidwifeCalendarPage() {
  const navigate = useNavigate();
  const today = new Date();

  const [currentYear,    setCurrentYear]    = useState(today.getFullYear());
  const [currentMonth,   setCurrentMonth]   = useState(today.getMonth());
  const [selectedDay,    setSelectedDay]    = useState(today.getDate());
  const [view,           setView]           = useState<"month" | "day">("month");
  const [showNewAppt,    setShowNewAppt]    = useState(false);
  const [preselectedDay, setPreselectedDay] = useState<number | null>(null);

  const { data, loading, refetch } = useApiCall(() => midwifeService.listAppointments());
  const allAppts: AppointmentRead[] = data ?? [];

  const apptsByDay: Record<number, AppointmentRead[]> = {};
  allAppts.forEach((a) => {
    const d = new Date(a.scheduled_at);
    if (d.getFullYear() === currentYear && d.getMonth() === currentMonth) {
      const day = d.getDate();
      apptsByDay[day] = [...(apptsByDay[day] ?? []), a];
    }
  });

  const selectedAppts = apptsByDay[selectedDay] ?? [];
  const daysInMonth   = getDaysInMonth(currentYear, currentMonth);
  const firstDay      = getFirstDay(currentYear, currentMonth);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  function openNewAppt(day?: number) {
    setPreselectedDay(day ?? null);
    setShowNewAppt(true);
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-5">

      {showNewAppt && (
        <NewAppointmentModal
          defaultDate={
            preselectedDay
              ? new Date(currentYear, currentMonth, preselectedDay).toISOString().split("T")[0]
              : undefined
          }
          onClose={() => { setShowNewAppt(false); setPreselectedDay(null); }}
          onCreated={() => { refetch(); setShowNewAppt(false); setPreselectedDay(null); }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-semibold text-foreground">Agenda</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {loading ? "Chargement…" : `${allAppts.length} rendez-vous`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-xl p-0.5">
            {(["month", "day"] as const).map((v) => (
              <button
                key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  view === v ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {v === "month" ? "Mois" : "Jour"}
              </button>
            ))}
          </div>
          <button
            onClick={() => openNewAppt()}
            className="flex items-center gap-1.5 bg-primary text-white text-xs px-3 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={13} /> RDV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendrier */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <ChevronLeft size={15} />
            </button>
            <p className="text-sm font-semibold text-foreground font-serif">{MONTHS[currentMonth]} {currentYear}</p>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-semibold uppercase py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day       = i + 1;
              const isToday   = day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
              const isSelected= day === selectedDay;
              const dayAppts  = apptsByDay[day] ?? [];
              const hasUrgent = dayAppts.some((a) => a.type === "urgent");
              return (
                <button
                  key={day}
                  onClick={() => { setSelectedDay(day); setView("day"); }}
                  className={`relative w-8 h-8 mx-auto rounded-xl text-xs font-medium transition-all flex items-center justify-center ${
                    isSelected ? "bg-primary text-white" : isToday ? "bg-[#F7C5A0]/40 text-[#C96B4B] font-bold" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {day}
                  {dayAppts.length > 0 && !isSelected && (
                    <span className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full ${hasUrgent ? "bg-destructive" : "bg-[#C96B4B]"}`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-border space-y-1.5">
            {(Object.entries(typeConfig) as [AppointmentType, typeof typeConfig[AppointmentType]][]).map(([, cfg]) => (
              <div key={cfg.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                <span className="text-[10px] text-muted-foreground">{cfg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vue journée */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground font-serif">
              {DAYS[(new Date(currentYear, currentMonth, selectedDay).getDay() + 6) % 7]} {selectedDay} {MONTHS[currentMonth]}
            </h2>
            <span className="text-xs text-muted-foreground">{selectedAppts.length} rendez-vous</span>
          </div>

          {selectedAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Clock size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Aucun rendez-vous ce jour</p>
              <button
                onClick={() => openNewAppt(selectedDay)}
                className="mt-3 flex items-center gap-1.5 bg-primary text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus size={13} /> Planifier un RDV
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {selectedAppts.map((appt) => {
                const cfg  = typeConfig[appt.type];
                const time = new Date(appt.scheduled_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div
                    key={appt.id}
                    className="flex gap-4 px-5 py-4 hover:bg-muted/20 cursor-pointer transition-colors"
                    onClick={() => navigate(`/sage-femme/patientes/${appt.patient_id}`)}
                  >
                    <div className="flex flex-col items-center gap-1 shrink-0 w-12">
                      <span className="text-xs font-mono font-semibold text-foreground">{time}</span>
                      <div className={`w-0.5 flex-1 rounded-full min-h-4 ${cfg.dot}`} />
                      <span className="text-[9px] text-muted-foreground">{appt.duration}min</span>
                    </div>
                    <div className={`flex-1 rounded-xl border p-3 ${cfg.bg}`}>
                      <div className="flex items-center gap-1.5">
                        <User size={12} className={cfg.color} />
                        <p className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</p>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {appt.weeks ? `${appt.weeks} SA · ` : ""}{appt.duration} min
                      </p>
                      {appt.note && <p className="text-[11px] text-muted-foreground/80 mt-1 italic">{appt.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
