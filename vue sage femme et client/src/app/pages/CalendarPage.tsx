import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Calendar, Clock, MapPin, Plus, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useApiCall } from "../../hooks/useApiCall";
import { appointmentService } from "../../api/appointmentService";
import type { AppointmentRead } from "../../api/types";

const typeLabel: Record<string, string> = {
  routine: "Consultation prénatale",
  urgent: "Consultation urgente",
  birth: "Accouchement",
  first: "Première consultation",
};
const typeGradient: Record<string, string> = {
  routine: "from-[#F2A7A7] to-[#C96B4B]",
  urgent: "from-[#C96B4B] to-[#B07590]",
  birth: "from-[#C96B4B] to-[#B07590]",
  first: "from-[#F7C5A0] to-[#F2A7A7]",
};

function daysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

function AppointmentCard({ appt, past }: { appt: AppointmentRead; past?: boolean }) {
  const d = daysUntil(appt.scheduled_at);
  return (
    <Card className={`hover:shadow-lg transition-shadow cursor-pointer ${past ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${past ? "bg-gray-200" : `bg-gradient-to-br ${typeGradient[appt.type] ?? typeGradient.routine}`}`}>
          <Calendar className={past ? "text-gray-500" : "text-white"} size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h4 className="font-semibold text-gray-800 text-sm leading-tight">
              {typeLabel[appt.type] ?? appt.type}
            </h4>
            {!past && <ChevronRight size={18} className="text-gray-400 shrink-0" />}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock size={14} />
              <span>
                {new Date(appt.scheduled_at).toLocaleString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                })}
              </span>
            </div>
            {appt.note && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={14} />
                <span>{appt.note}</span>
              </div>
            )}
          </div>
          {!past && d >= 0 && (
            <div className="mt-2">
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                {d === 0 ? "Aujourd'hui" : `Dans ${d} jour${d > 1 ? "s" : ""}`}
              </span>
            </div>
          )}
          {past && (
            <div className="mt-2">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">✓ Effectué</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function CalendarPage() {
  const { data: upcoming, loading: uLoading } = useApiCall(() => appointmentService.list(true));
  const { data: all, loading: aLoading } = useApiCall(() => appointmentService.list(false));

  const past = (all ?? []).filter((a) => daysUntil(a.scheduled_at) < 0);
  const loading = uLoading || aLoading;

  return (
    <div className="pb-6">
      <Header greeting="Votre" name="Agenda" avatar="📅" />

      <div className="px-6 -mt-6 space-y-6">
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
                <span className="text-xs bg-[#C96B4B]/10 text-[#C96B4B] px-3 py-1 rounded-full font-semibold">
                  {(upcoming ?? []).length}
                </span>
              </div>

              {(upcoming ?? []).length === 0 ? (
                <Card className="text-center py-8 text-gray-500 text-sm">
                  <div className="text-3xl mb-2">📅</div>
                  Aucun rendez-vous à venir
                  <div className="mt-3">
                    <button className="inline-flex items-center gap-1.5 bg-[#C96B4B] text-white text-xs px-4 py-2 rounded-xl font-medium">
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
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">💡</span> Rappel
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              Présentez-vous 10 minutes avant votre rendez-vous et apportez votre carnet de santé.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
