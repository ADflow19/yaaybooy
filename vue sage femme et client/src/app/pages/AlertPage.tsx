import { useNavigate } from "react-router";
import { ArrowLeft, Phone, Users, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card } from "../components/Card";
import { motion } from "motion/react";
import { useApiCall } from "../../hooks/useApiCall";
import { alertService } from "../../api/alertService";

const severityLabel: Record<string, string> = {
  critical: "Critique", high: "Élevé", medium: "Modéré", resolved: "Résolu",
};
const severityColor: Record<string, string> = {
  critical: "text-red-700 bg-red-50 border-red-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  resolved: "text-gray-500 bg-gray-50 border-gray-200",
};

export function AlertPage() {
  const navigate = useNavigate();
  const { data: alerts, loading, error } = useApiCall(() => alertService.list(false));

  const active = alerts ?? [];
  const critical = active.filter((a) => a.severity === "critical");
  const topAlert = critical[0] ?? active[0] ?? null;

  return (
    <div className="min-h-full bg-gradient-to-b from-orange-50 to-white pb-6">
      <div className="bg-gradient-to-br from-orange-400 via-red-400 to-orange-500 px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3 mb-3">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            <AlertTriangle className="text-white" size={32} />
          </motion.div>
          <h1 className="text-white text-3xl font-['Playfair_Display']">
            {critical.length > 0 ? "Alerte Critique !" : "Mes Alertes"}
          </h1>
        </div>
        <p className="text-white/90 text-sm">
          {loading ? "Chargement…" : `${active.length} alerte${active.length !== 1 ? "s" : ""} active${active.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        {loading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {!loading && topAlert && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">{topAlert.title}</h3>
                  {topAlert.value && (
                    <p className="text-sm text-red-700">Valeur : <span className="font-bold">{topAlert.value}</span></p>
                  )}
                  {topAlert.normal && (
                    <p className="text-xs text-red-600">Normal : {topAlert.normal}</p>
                  )}
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(topAlert.time).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>

              {topAlert.note && (
                <div className="bg-white rounded-xl p-4 border border-red-100 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <CheckCircle size={18} className="text-[#C96B4B]" /> Note médicale
                  </h4>
                  <p className="text-sm text-gray-700">{topAlert.note}</p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={() => alert("Appel de la sage-femme en cours... 📞")}
                  className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-5 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:shadow-lg transition-all"
                >
                  <Phone size={24} />
                  <div className="text-left">
                    <div className="text-base">Appeler ma sage-femme</div>
                    <div className="text-xs opacity-90">Réponse garantie sous 5 min</div>
                  </div>
                </button>

                <button
                  onClick={() => alert("Contact de la famille en cours... 👨‍👩‍👧")}
                  className="w-full bg-white border-2 border-[#F2A7A7] text-[#C96B4B] py-5 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-[#FDF6F0] transition-colors"
                >
                  <Users size={24} />
                  <div className="text-left">
                    <div className="text-base">Contacter ma famille</div>
                    <div className="text-xs opacity-80">Notification automatique</div>
                  </div>
                </button>
              </div>
            </Card>
          </motion.div>
        )}

        {!loading && active.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#C96B4B]" /> Toutes mes alertes
              </h4>
              <div className="space-y-2">
                {active.map((a) => (
                  <div key={a.id} className={`flex items-center justify-between text-sm p-3 rounded-xl border ${severityColor[a.severity]}`}>
                    <div>
                      <p className="font-semibold">{a.title}</p>
                      {a.value && <p className="text-xs">{a.value}</p>}
                    </div>
                    <span className="text-xs font-medium">{severityLabel[a.severity]}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {!loading && active.length === 0 && !error && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="text-center py-10">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-semibold text-gray-800 mb-1">Tout va bien !</h3>
              <p className="text-sm text-gray-500">Aucune alerte active pour le moment.</p>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
