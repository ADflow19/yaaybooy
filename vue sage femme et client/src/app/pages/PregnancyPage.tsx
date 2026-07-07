import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { TrendingUp, Activity, Heart, Scale, Droplet } from "lucide-react";
import { motion } from "motion/react";
import { useApiCall } from "../../hooks/useApiCall";
import { patientService } from "../../api/patientService";
import { measurementService } from "../../api/measurementService";

export function PregnancyPage() {
  const { data: patient, loading: pLoading } = useApiCall(() => patientService.getMe());
  const { data: measurements, loading: mLoading } = useApiCall(() => measurementService.list());
  const loading = pLoading || mLoading;

  const latest = {
    bp: measurements?.find((m) => m.type === "blood-pressure"),
    hr: measurements?.find((m) => m.type === "heart-rate"),
    temp: measurements?.find((m) => m.type === "temperature"),
  };

  const trimesterLabel = patient
    ? patient.weeks <= 13 ? "1er Trimestre"
    : patient.weeks <= 26 ? "2ème Trimestre"
    : "3ème Trimestre"
    : "";

  return (
    <div className="pb-8">
      <Header greeting="Suivi de Grossesse" name="" avatar="🤰🏾" />
      <div className="max-w-4xl mx-auto px-8 mt-6 space-y-6">

        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
          </div>
        )}

        {!loading && patient && (
          <>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card gradient>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Playfair_Display'] text-xl text-gray-800">Semaine {patient.weeks}</h3>
                  <span className="text-sm text-[#C96B4B] font-semibold bg-white px-3 py-1 rounded-full">{trimesterLabel}</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/80 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">🩸</div>
                    <div className="text-xs text-gray-500">Groupe</div>
                    <div className="font-semibold text-gray-800">{patient.blood_type ?? "—"}</div>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">📅</div>
                    <div className="text-xs text-gray-500">DPA</div>
                    <div className="font-semibold text-gray-800 text-xs">
                      {patient.dpa ? new Date(patient.dpa).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "—"}
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">👶🏾</div>
                    <div className="text-xs text-gray-500">G{patient.gravida}P{patient.para}</div>
                    <div className="font-semibold text-gray-800">Parité</div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-3">Statistiques de Santé</h3>
              <div className="space-y-3">
                <Card className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#F2A7A7]/20 rounded-full flex items-center justify-center">
                      <Activity className="text-[#C96B4B]" size={22} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Tension</div>
                      <div className="font-semibold text-gray-800">{latest.bp?.value ?? "—"}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${latest.bp?.status === "normal" ? "bg-green-100 text-green-700" : latest.bp?.status === "warning" ? "bg-orange-100 text-orange-700" : latest.bp ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>
                    {latest.bp?.status === "normal" ? "Normal" : latest.bp?.status === "warning" ? "Attention" : latest.bp ? "Alerte" : "Non mesuré"}
                  </span>
                </Card>

                <Card className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#F7C5A0]/20 rounded-full flex items-center justify-center">
                      <Heart className="text-[#C96B4B]" size={22} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Rythme Cardiaque</div>
                      <div className="font-semibold text-gray-800">{latest.hr?.value ?? "—"}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${latest.hr?.status === "normal" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {latest.hr?.status === "normal" ? "Normal" : latest.hr ? "À surveiller" : "Non mesuré"}
                  </span>
                </Card>

                <Card className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#B07590]/20 rounded-full flex items-center justify-center">
                      <Droplet className="text-[#B07590]" size={22} />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Température</div>
                      <div className="font-semibold text-gray-800">{latest.temp?.value ?? "—"}</div>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${latest.temp?.status === "normal" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {latest.temp?.status === "normal" ? "Normal" : latest.temp ? "À surveiller" : "Non mesuré"}
                  </span>
                </Card>
              </div>
            </motion.div>
          </>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20">
            <h4 className="font-semibold text-gray-800 mb-3">💡 Conseils pour ce trimestre</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2"><span className="text-[#C96B4B] mt-0.5">•</span><span>Dormez sur le côté gauche pour améliorer la circulation</span></li>
              <li className="flex items-start gap-2"><span className="text-[#C96B4B] mt-0.5">•</span><span>Prenez vos suppléments de fer et d'acide folique</span></li>
              <li className="flex items-start gap-2"><span className="text-[#C96B4B] mt-0.5">•</span><span>Buvez au moins 2 litres d'eau par jour</span></li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
