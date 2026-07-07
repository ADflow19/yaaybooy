import { useState, type FormEvent } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Calendar, Clock, MapPin, Plus, ChevronRight, X } from "lucide-react";
import { motion } from "motion/react";
import { useApiCall } from "../../hooks/useApiCall";
import { appointmentService } from "../../api/appointmentService";
import type { AppointmentRead, AppointmentType } from "../../api/types";

const typeLabel: Record<string, string> = {
  routine: "Consultation prénatale",
  urgent:  "Consultation urgente",
  birth:   "Accouchement",
  first:   "Première consultation",
};
const typeGradient: Record<string, string> = {
  routine: "from-[#F2A7A7] to-[#C96B4B]",
  urgent:  "from-[#C96B4B] to-[#B07590]",
  birth:   "from-[#C96B4B] to-[#B07590]",
  first:   "from-[#F7C5A0] to-[#F2A7A7]",
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000);
}

function AppointmentCard({ appt, past }: { appt: AppointmentRead; past?: boolean }) {
  const d = daysUntil(appt.scheduled_at);
  return (
    <Card className={`hover:shadow-lg transition-shadow ${past ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${past ? "bg-gray-200" : `bg-gradient-to-br ${typeGradient[appt.type] ?? typeGradient.routine}`}`}>
          <Calendar className={past ? "text-gray-500" : "text-white"} size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-gray-800 text-sm leading-tight">{typeLabel[appt.type] ?? appt.type}</h4>
            {!past && <ChevronRight size={18} className="text-gray-400 shrink-0" />}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock size={14} />
              <span>{new Date(appt.scheduled_at).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</span>
            </div>
            {appt.note && <div className="flex items-center gap-2 text-xs text-gray-600"><MapPin size={14} /><span>{appt.note}</span></div>}
          </div>
          {!past && d >= 0 && (
            <div className="mt-2">
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                {d === 0 ? "Aujourd'hui" : `Dans ${d} jour${d > 1 ? "s" : ""}`}
              </span>
            </div>
          )}
          {past && <div className="mt-2"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">✓ Effectué</span></div>}
        </div>
      </div>
    </Card>
  );
}

// ── Formulaire de création de RDV ─────────────────────────────────────────────
function NewAppointmentModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [type, setType]         = useState<AppointmentType>("routine");
  const [date, setDate]         = useState("");
  const [time, setTime]         = useState("09:00");
  const [note, setNote]         = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date) { setError("Veuillez choisir une date"); return; }
    setLoading(true); setError(null);
    try {
      await appointmentService.create({
        scheduled_at: `${date}T${time}:00`,
        type,
        note: note || undefined,
      });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Erreur lors de la création");
    } finally { setLoading(false); }
  }

  const inputCls = "w-full px-4 py-2.5 text-sm bg-[#FFF9F5] border border-[#F2A7A7]/30 rounded-xl outline-none focus:ring-2 focus:ring-[#C96B4B]/20 focus:border-[#C96B4B]";

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800">Nouveau rendez-vous</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)} className={inputCls}>
              {(Object.entries(typeLabel) as [AppointmentType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls}
                min={new Date().toISOString().split("T")[0]} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Heure</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Note / Lieu (optionnel)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Ex: Centre de Santé Dalifort" className={inputCls} />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-xl">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white text-sm font-semibold disabled:opacity-60">
              {loading ? "Enregistrement…" : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CalendarPage() {
  const [showModal, setShowModal] = useState(false);
  const { data: upcoming, loading: uLoading, refetch: refetchUp } = useApiCall(() => appointmentService.list(true));
  const { data: all,      loading: aLoading, refetch: refetchAll } = useApiCall(() => appointmentService.list(false));

  const past    = (all ?? []).filter((a) => daysUntil(a.scheduled_at) < 0);
  const loading = uLoading || aLoading;

  function handleCreated() { refetchUp(); refetchAll(); }

  return (
    <div className="pb-8">
      <Header greeting="Votre" name="Agenda" />

      {showModal && <NewAppointmentModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}

      <div className="max-w-4xl mx-auto px-8 mt-6 space-y-6">
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
          </div>
        )}

        {!loading && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Playfair_Display'] text-lg text-gray-800">Rendez-vous à venir</h3>
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-[#C96B4B]/10 text-[#C96B4B] px-3 py-1 rounded-full font-semibold">
                    {(upcoming ?? []).length}
                  </span>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 bg-[#C96B4B] text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-[#B07590] transition-colors"
                  >
                    <Plus size={13} /> Prendre un rendez-vous
                  </button>
                </div>
              </div>

              {(upcoming ?? []).length === 0 ? (
                <Card className="text-center py-8 text-gray-500 text-sm">
                  <div className="text-3xl mb-2">📅</div>
                  Aucun rendez-vous à venir
                  <div className="mt-3">
                    <button
                      onClick={() => setShowModal(true)}
                      className="inline-flex items-center gap-1.5 bg-[#C96B4B] text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-[#B07590] transition-colors"
                    >
                      <Plus size={13} /> Prendre un rendez-vous
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {(upcoming ?? []).map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * i }}>
                      <AppointmentCard appt={a} />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {past.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-4">Rendez-vous passés</h3>
                <div className="space-y-3">
                  {past.map((a) => <AppointmentCard key={a.id} appt={a} past />)}
                </div>
              </motion.div>
            )}
          </>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><span className="text-xl">💡</span> Rappel</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Présentez-vous 10 minutes avant votre rendez-vous et apportez votre carnet de santé.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
