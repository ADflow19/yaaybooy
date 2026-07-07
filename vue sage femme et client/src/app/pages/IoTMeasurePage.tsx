import { useState } from "react";
import { ArrowLeft, Activity, Heart, Thermometer, Baby, Share2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/Card";
import { motion, AnimatePresence } from "motion/react";
import { measurementService } from "../../api/measurementService";
import type { MeasurementCreate, MeasurementRead, MeasurementType } from "../../api/types";

const MEASUREMENT_CONFIG = [
  { type: "blood-pressure" as MeasurementType, icon: Activity, label: "Tension Artérielle", color: "from-[#F2A7A7] to-[#C96B4B]",
    simulate: (): MeasurementCreate => ({ type: "blood-pressure", value: "120/80 mmHg", status: "normal", message: "Votre tension est normale." }) },
  { type: "heart-rate" as MeasurementType, icon: Heart, label: "Rythme Cardiaque", color: "from-[#C96B4B] to-[#B07590]",
    simulate: (): MeasurementCreate => ({ type: "heart-rate", value: "72 bpm", status: "normal", message: "Votre rythme cardiaque est stable." }) },
  { type: "temperature" as MeasurementType, icon: Thermometer, label: "Température", color: "from-[#F7C5A0] to-[#F2A7A7]",
    simulate: (): MeasurementCreate => ({ type: "temperature", value: "36.8°C", status: "normal", message: "Votre température est normale." }) },
  { type: "baby-movements" as MeasurementType, icon: Baby, label: "Mouvements du Bébé", color: "from-[#B07590] to-[#F2A7A7]",
    simulate: (): MeasurementCreate => ({ type: "baby-movements", value: "8 mouvements", status: "normal", message: "Bébé est actif !" }) },
] as const;

export function IoTMeasurePage() {
  const navigate = useNavigate();
  const [measuring, setMeasuring] = useState(false);
  const [result, setResult] = useState<MeasurementRead | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shared, setShared] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function startMeasurement(cfg: typeof MEASUREMENT_CONFIG[number]) {
    setMeasuring(true);
    setResult(null);
    setShared(false);
    setErrorMsg(null);

    // Simule 3 secondes de mesure IoT, puis envoie au backend
    await new Promise((r) => setTimeout(r, 3000));
    try {
      const created = await measurementService.create(cfg.simulate());
      setResult(created);
    } catch {
      setErrorMsg("Impossible d'enregistrer la mesure. Vérifiez votre connexion.");
    } finally {
      setMeasuring(false);
    }
  }

  async function handleShare() {
    if (!result) return;
    setSharing(true);
    setErrorMsg(null);
    try {
      const resp = await measurementService.share(result.id);
      setShared(true);
      if (resp.alert_created) {
        setErrorMsg(`⚠️ Alerte créée : ${resp.alert_created.title}`);
      }
    } catch {
      setErrorMsg("Impossible de partager la mesure.");
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-[#FFF9F5] to-white pb-6">
      <div className="bg-gradient-to-br from-[#F2A7A7] via-[#C96B4B] to-[#B07590] px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-3xl font-['Playfair_Display'] mb-2">Mesure ton état de santé</h1>
        <p className="text-white/90 text-sm">Sélectionne une mesure pour commencer</p>
      </div>

      <div className="px-6 -mt-4">
        {errorMsg && (
          <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${errorMsg.startsWith("⚠️") ? "bg-orange-50 text-orange-700 border border-orange-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {errorMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!measuring && !result && (
            <motion.div key="grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="grid grid-cols-2 gap-4">
              {MEASUREMENT_CONFIG.map((cfg, index) => {
                const Icon = cfg.icon;
                return (
                  <motion.button key={cfg.type} onClick={() => startMeasurement(cfg)}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <div className={`w-16 h-16 bg-gradient-to-br ${cfg.color} rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <div className="text-sm font-semibold text-gray-800 text-center leading-tight">{cfg.label}</div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {measuring && (
            <motion.div key="measuring" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center justify-center py-16">
              <Card className="w-full text-center py-12">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-24 h-24 bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Activity className="text-white" size={40} />
                </motion.div>
                <h3 className="text-xl font-['Playfair_Display'] text-gray-800 mb-2">Mesure en cours…</h3>
                <p className="text-sm text-gray-500">Veuillez patienter quelques instants</p>
              </Card>
            </motion.div>
          )}

          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <Card className="text-center py-8">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${result.status === "normal" ? "bg-green-100" : result.status === "warning" ? "bg-orange-100" : "bg-red-100"}`}>
                  <span className="text-4xl">{result.status === "normal" ? "✅" : result.status === "warning" ? "⚠️" : "🚨"}</span>
                </div>
                <h3 className="text-3xl font-['Playfair_Display'] text-gray-800 mb-2">{result.value}</h3>
                <p className="text-sm text-gray-600 px-4 leading-relaxed">{result.message}</p>
              </Card>

              {shared ? (
                <Card className="text-center py-4 bg-green-50 border-green-200">
                  <p className="text-green-700 font-semibold text-sm">✅ Partagé avec votre sage-femme</p>
                </Card>
              ) : (
                <button onClick={handleShare} disabled={sharing}
                  className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-60">
                  {sharing ? <RefreshCw size={20} className="animate-spin" /> : <Share2 size={20} />}
                  {sharing ? "Partage en cours…" : "Partager avec ma sage-femme"}
                </button>
              )}

              <button onClick={() => { setResult(null); setShared(false); setErrorMsg(null); }}
                className="w-full bg-white border border-gray-200 text-gray-700 py-4 rounded-2xl font-semibold hover:bg-gray-50 transition-colors">
                Nouvelle mesure
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
