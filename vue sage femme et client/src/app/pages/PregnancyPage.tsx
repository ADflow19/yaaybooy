import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { TrendingUp, Activity, Heart, Scale, Droplet } from "lucide-react";
import { motion } from "motion/react";

export function PregnancyPage() {
  const weekData = [
    { week: 20, weight: 65 },
    { week: 21, weight: 66 },
    { week: 22, weight: 66.5 },
    { week: 23, weight: 67 },
    { week: 24, weight: 68 },
  ];

  return (
    <div className="pb-6">
      <Header greeting="Suivi de Grossesse" name="" avatar="🤰🏾" />

      <div className="px-6 -mt-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card gradient>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-['Playfair_Display'] text-xl text-gray-800">Semaine 24</h3>
              <span className="text-sm text-[#C96B4B] font-semibold bg-white px-3 py-1 rounded-full">
                2ème Trimestre
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Votre bébé commence à avoir un cycle de sommeil régulier. Ses poumons se développent et il peut entendre votre voix.
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">📏</div>
                <div className="text-xs text-gray-500">Taille</div>
                <div className="font-semibold text-gray-800">30cm</div>
              </div>
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">⚖️</div>
                <div className="text-xs text-gray-500">Poids</div>
                <div className="font-semibold text-gray-800">600g</div>
              </div>
              <div className="bg-white/80 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">👂</div>
                <div className="text-xs text-gray-500">Sens</div>
                <div className="font-semibold text-gray-800">Ouïe</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-3">
            Évolution de votre poids
          </h3>
          <Card>
            <div className="relative h-40">
              <svg className="w-full h-full" viewBox="0 0 280 140">
                <defs>
                  <linearGradient id="weightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F2A7A7" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#F2A7A7" stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d="M 0,120 L 70,100 L 140,90 L 210,70 L 280,40"
                  fill="url(#weightGradient)"
                />

                <path
                  d="M 0,120 L 70,100 L 140,90 L 210,70 L 280,40"
                  fill="none"
                  stroke="#C96B4B"
                  strokeWidth="3"
                  strokeLinecap="round"
                />

                {weekData.map((point, i) => (
                  <circle
                    key={i}
                    cx={i * 70}
                    cy={140 - (point.weight - 64) * 20}
                    r="5"
                    fill="#C96B4B"
                  />
                ))}
              </svg>
            </div>
            <div className="flex justify-between mt-4 text-xs text-gray-500">
              <span>S20</span>
              <span>S21</span>
              <span>S22</span>
              <span>S23</span>
              <span className="font-semibold text-[#C96B4B]">S24</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">Poids actuel</div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-500" />
                <span className="font-semibold text-gray-800">68 kg</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-3">
            Statistiques de Santé
          </h3>
          <div className="space-y-3">
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F2A7A7]/20 rounded-full flex items-center justify-center">
                  <Activity className="text-[#C96B4B]" size={22} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Tension</div>
                  <div className="font-semibold text-gray-800">120/80 mmHg</div>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                Normal
              </span>
            </Card>

            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F7C5A0]/20 rounded-full flex items-center justify-center">
                  <Heart className="text-[#C96B4B]" size={22} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Rythme Cardiaque Bébé</div>
                  <div className="font-semibold text-gray-800">142 bpm</div>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                Excellent
              </span>
            </Card>

            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#B07590]/20 rounded-full flex items-center justify-center">
                  <Droplet className="text-[#B07590]" size={22} />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Hydratation</div>
                  <div className="font-semibold text-gray-800">1.8L / 2L</div>
                </div>
              </div>
              <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
                Presque
              </span>
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20">
            <h4 className="font-semibold text-gray-800 mb-3">💡 Conseils pour ce trimestre</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#C96B4B] mt-0.5">•</span>
                <span>Dormez sur le côté gauche pour améliorer la circulation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C96B4B] mt-0.5">•</span>
                <span>Faites des exercices doux comme la marche ou le yoga prénatal</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C96B4B] mt-0.5">•</span>
                <span>Mangez des aliments riches en fer et en calcium</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
