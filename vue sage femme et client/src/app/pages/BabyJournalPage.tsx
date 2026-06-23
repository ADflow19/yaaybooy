import { useState } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Scale, Ruler, Syringe, Moon, Milk, Camera, Plus } from "lucide-react";
import { motion } from "motion/react";

export function BabyJournalPage() {
  const [activeTab, setActiveTab] = useState<"stats" | "photos" | "notes">("stats");

  const vaccinations = [
    { name: "BCG", date: "12 Mai 2026", status: "done" },
    { name: "Polio 1", date: "28 Mai 2026", status: "done" },
    { name: "Pentavalent 1", date: "28 Mai 2026", status: "done" },
    { name: "Polio 2", date: "À venir", status: "upcoming" },
  ];

  return (
    <div className="pb-6">
      <Header greeting="Journal de" name="Bébé" avatar="👶🏾" />

      <div className="px-6 -mt-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card gradient className="text-center py-6">
            <div className="text-6xl mb-3">👶🏾</div>
            <h2 className="font-['Playfair_Display'] text-2xl text-gray-800 mb-1">
              Fatou Diallo
            </h2>
            <p className="text-sm text-gray-600">Née le 15 Avril 2026</p>
            <p className="text-xs text-[#C96B4B] font-semibold mt-2">
              5 semaines et 2 jours
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab("stats")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "stats"
                  ? "bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              Statistiques
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "photos"
                  ? "bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                activeTab === "notes"
                  ? "bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white shadow-md"
                  : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              Notes
            </button>
          </div>

          {activeTab === "stats" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <Card className="text-center py-6">
                  <Scale className="text-[#F2A7A7] mx-auto mb-3" size={32} />
                  <div className="text-3xl font-bold text-gray-800 mb-1">4.2kg</div>
                  <div className="text-xs text-gray-500">Poids</div>
                  <div className="text-xs text-green-600 mt-1">+200g cette semaine</div>
                </Card>

                <Card className="text-center py-6">
                  <Ruler className="text-[#C96B4B] mx-auto mb-3" size={32} />
                  <div className="text-3xl font-bold text-gray-800 mb-1">52cm</div>
                  <div className="text-xs text-gray-500">Taille</div>
                  <div className="text-xs text-green-600 mt-1">+1cm cette semaine</div>
                </Card>

                <Card className="text-center py-6">
                  <Moon className="text-[#B07590] mx-auto mb-3" size={32} />
                  <div className="text-3xl font-bold text-gray-800 mb-1">14h</div>
                  <div className="text-xs text-gray-500">Sommeil / jour</div>
                  <div className="text-xs text-gray-600 mt-1">Normal</div>
                </Card>

                <Card className="text-center py-6">
                  <Milk className="text-[#F7C5A0] mx-auto mb-3" size={32} />
                  <div className="text-3xl font-bold text-gray-800 mb-1">8x</div>
                  <div className="text-xs text-gray-500">Tétées / jour</div>
                  <div className="text-xs text-gray-600 mt-1">Excellent</div>
                </Card>
              </div>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Syringe size={20} className="text-[#C96B4B]" />
                    Vaccinations
                  </h3>
                </div>
                <div className="space-y-3">
                  {vaccinations.map((vacc, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                        vacc.status === "done" ? "bg-green-50" : "bg-orange-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            vacc.status === "done" ? "bg-green-500" : "bg-orange-500"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{vacc.name}</div>
                          <div className="text-xs text-gray-500">{vacc.date}</div>
                        </div>
                      </div>
                      <span className="text-xl">
                        {vacc.status === "done" ? "✅" : "📅"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === "photos" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <button className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
                <Camera size={20} />
                Ajouter une photo
              </button>

              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="aspect-square bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Camera size={32} className="mx-auto mb-2 opacity-50" />
                      <div className="text-xs">Photo {i}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "notes" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <button className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow">
                <Plus size={20} />
                Ajouter une note
              </button>

              <Card>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs text-gray-500">23 Mai 2026, 14h30</div>
                  <span className="text-xl">💕</span>
                </div>
                <p className="text-sm text-gray-700">
                  Premier sourire aujourd'hui ! Elle a souri en voyant son père. Moment magique ✨
                </p>
              </Card>

              <Card>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs text-gray-500">20 Mai 2026, 09h15</div>
                  <span className="text-xl">👶</span>
                </div>
                <p className="text-sm text-gray-700">
                  Fatou commence à suivre les objets du regard. Son développement est sur la bonne voie.
                </p>
              </Card>

              <Card>
                <div className="flex items-start justify-between mb-2">
                  <div className="text-xs text-gray-500">18 Mai 2026, 22h00</div>
                  <span className="text-xl">😴</span>
                </div>
                <p className="text-sm text-gray-700">
                  Elle a dormi 5 heures d'affilée pour la première fois ! Nous sommes tellement soulagés.
                </p>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
