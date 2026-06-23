import { useState } from "react";
import { ArrowLeft, Activity, Heart, Thermometer, Baby, Share2 } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/Card";
import { motion, AnimatePresence } from "motion/react";

type MeasurementType = "blood-pressure" | "heart-rate" | "temperature" | "baby-movements" | null;

interface MeasurementResult {
  type: MeasurementType;
  value: string;
  status: "normal" | "warning" | "alert";
  message: string;
}

export function IoTMeasurePage() {
  const navigate = useNavigate();
  const [measuring, setMeasuring] = useState(false);
  const [selectedType, setSelectedType] = useState<MeasurementType>(null);
  const [result, setResult] = useState<MeasurementResult | null>(null);

  const measurements = [
    {
      type: "blood-pressure" as MeasurementType,
      icon: Activity,
      label: "Tension Artérielle",
      color: "from-[#F2A7A7] to-[#C96B4B]",
    },
    {
      type: "heart-rate" as MeasurementType,
      icon: Heart,
      label: "Rythme Cardiaque",
      color: "from-[#C96B4B] to-[#B07590]",
    },
    {
      type: "temperature" as MeasurementType,
      icon: Thermometer,
      label: "Température",
      color: "from-[#F7C5A0] to-[#F2A7A7]",
    },
    {
      type: "baby-movements" as MeasurementType,
      icon: Baby,
      label: "Mouvements du Bébé",
      color: "from-[#B07590] to-[#F2A7A7]",
    },
  ];

  const startMeasurement = (type: MeasurementType) => {
    setSelectedType(type);
    setMeasuring(true);
    setResult(null);

    setTimeout(() => {
      setMeasuring(false);

      const results: Record<string, MeasurementResult> = {
        "blood-pressure": {
          type,
          value: "120/80 mmHg",
          status: "normal",
          message: "Votre tension est normale. Continuez à bien vous hydrater."
        },
        "heart-rate": {
          type,
          value: "72 bpm",
          status: "normal",
          message: "Votre rythme cardiaque est stable et normal."
        },
        "temperature": {
          type,
          value: "36.8°C",
          status: "normal",
          message: "Votre température corporelle est normale."
        },
        "baby-movements": {
          type,
          value: "8 mouvements",
          status: "normal",
          message: "Bébé est actif ! Tout va bien."
        }
      };

      setResult(results[type as string]);
    }, 3000);
  };

  const shareMeasurement = () => {
    alert("Résultat partagé avec votre sage-femme ✅");
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-[#FFF9F5] to-white pb-6">
      <div className="bg-gradient-to-br from-[#F2A7A7] via-[#C96B4B] to-[#B07590] px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white text-3xl font-['Playfair_Display'] mb-2">
          Mesure ton état de santé
        </h1>
        <p className="text-white/90 text-sm">
          Sélectionne une mesure pour commencer
        </p>
      </div>

      <div className="px-6 -mt-4">
        <AnimatePresence mode="wait">
          {!measuring && !result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-4"
            >
              {measurements.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.type}
                    onClick={() => startMeasurement(item.type)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                      <Icon className="text-white" size={28} />
                    </div>
                    <div className="text-sm font-semibold text-gray-800 text-center leading-tight">
                      {item.label}
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}

          {measuring && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-16"
            >
              <Card className="w-full text-center py-12">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-24 h-24 bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
                >
                  <Activity className="text-white" size={40} />
                </motion.div>
                <h3 className="text-xl font-['Playfair_Display'] text-gray-800 mb-2">
                  Mesure en cours...
                </h3>
                <p className="text-sm text-gray-500">
                  Veuillez patienter quelques instants
                </p>
              </Card>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="text-center py-8">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  result.status === "normal" ? "bg-green-100" :
                  result.status === "warning" ? "bg-orange-100" : "bg-red-100"
                }`}>
                  <span className="text-4xl">
                    {result.status === "normal" ? "✅" :
                     result.status === "warning" ? "⚠️" : "🚨"}
                  </span>
                </div>
                <h3 className="text-3xl font-['Playfair_Display'] text-gray-800 mb-2">
                  {result.value}
                </h3>
                <p className="text-sm text-gray-600 px-4 leading-relaxed">
                  {result.message}
                </p>
              </Card>

              <button
                onClick={shareMeasurement}
                className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <Share2 size={20} />
                Partager avec ma sage-femme
              </button>

              <button
                onClick={() => {
                  setResult(null);
                  setSelectedType(null);
                }}
                className="w-full bg-white border-2 border-[#F2A7A7] text-[#C96B4B] py-4 rounded-2xl font-semibold hover:bg-[#FDF6F0] transition-colors"
              >
                Nouvelle mesure
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
