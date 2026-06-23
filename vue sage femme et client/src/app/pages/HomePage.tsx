import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { ProgressCircle } from "../components/ProgressCircle";
import { Calendar, Lightbulb, Activity, Heart, Moon, Stethoscope, Baby, Scale, Bell } from "lucide-react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="pb-6">
      <Header />

      <div className="px-6 -mt-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="flex flex-col items-center py-8">
            <h3 className="text-lg font-['Playfair_Display'] mb-4 text-gray-700">
              Votre Grossesse
            </h3>
            <ProgressCircle current={24} total={42} />
            <p className="text-sm text-gray-500 mt-4 text-center">
              Votre bébé a la taille d'un <span className="font-semibold text-[#C96B4B]">maïs</span> 🌽
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card gradient>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#C96B4B]/10 rounded-full flex items-center justify-center shrink-0">
                <Calendar className="text-[#C96B4B]" size={24} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-800">Prochain Rendez-vous</h4>
                  <span className="text-xs text-[#C96B4B] font-medium">Dans 3 jours</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">Consultation prénatale</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>📍 Centre de Santé Dalifort</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  <span>🕐 Mercredi 26 Mai, 10h00</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <Lightbulb className="text-[#C96B4B]" size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Conseil du Jour</h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Buvez au moins 2 litres d'eau par jour. L'hydratation est essentielle pour vous et votre bébé.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-3">
            <h3 className="font-['Playfair_Display'] text-lg text-gray-800">Mon Suivi</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Card className="flex flex-col items-center py-4">
              <Scale className="text-[#F2A7A7] mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-800">68kg</div>
              <div className="text-xs text-gray-500 mt-1">Poids</div>
            </Card>
            <Card className="flex flex-col items-center py-4">
              <Heart className="text-[#C96B4B] mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-800">142</div>
              <div className="text-xs text-gray-500 mt-1">Cœur bébé</div>
            </Card>
            <Card className="flex flex-col items-center py-4">
              <Moon className="text-[#B07590] mb-2" size={24} />
              <div className="text-2xl font-bold text-gray-800">7h</div>
              <div className="text-xs text-gray-500 mt-1">Sommeil</div>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="mb-3">
            <h3 className="font-['Playfair_Display'] text-lg text-gray-800">Actions Rapides</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Card
              onClick={() => navigate("/mesure")}
              gradient
              className="flex flex-col items-center py-6 cursor-pointer"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B] rounded-full flex items-center justify-center mb-3 shadow-lg">
                <Activity className="text-white" size={26} />
              </div>
              <div className="text-sm font-semibold text-gray-800 text-center">Mesurer ma santé</div>
            </Card>

            <Card
              onClick={() => navigate("/grossesse")}
              gradient
              className="flex flex-col items-center py-6 cursor-pointer"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#C96B4B] to-[#B07590] rounded-full flex items-center justify-center mb-3 shadow-lg">
                <Stethoscope className="text-white" size={26} />
              </div>
              <div className="text-sm font-semibold text-gray-800 text-center">Mon Suivi</div>
            </Card>

            <Card
              onClick={() => navigate("/bebe")}
              gradient
              className="flex flex-col items-center py-6 cursor-pointer"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#F7C5A0] to-[#F2A7A7] rounded-full flex items-center justify-center mb-3 shadow-lg">
                <Baby className="text-white" size={26} />
              </div>
              <div className="text-sm font-semibold text-gray-800 text-center">Journal Bébé</div>
            </Card>

            <Card
              onClick={() => navigate("/alerte")}
              gradient
              className="flex flex-col items-center py-6 cursor-pointer"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-[#B07590] to-[#C96B4B] rounded-full flex items-center justify-center mb-3 shadow-lg">
                <Bell className="text-white" size={26} />
              </div>
              <div className="text-sm font-semibold text-gray-800 text-center">Alertes</div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
