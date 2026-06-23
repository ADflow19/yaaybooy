import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { User, Phone, MapPin, Calendar, Languages, Bell, Moon, Download, ChevronRight, Settings } from "lucide-react";
import { motion } from "motion/react";

export function ProfilePage() {
  return (
    <div className="pb-6">
      <Header greeting="Mon" name="Profil" avatar="👩🏾" />

      <div className="px-6 -mt-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card gradient className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B] rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
              👩🏾
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl text-gray-800 mb-1">
              Aminata Diallo
            </h2>
            <p className="text-sm text-gray-600 mb-3">24 semaines de grossesse</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs bg-[#C96B4B]/10 text-[#C96B4B] px-3 py-1 rounded-full font-semibold">
                2ème Trimestre
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-4">
            Informations Personnelles
          </h3>

          <div className="space-y-3">
            <Card className="flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F2A7A7]/20 rounded-full flex items-center justify-center">
                  <User size={20} className="text-[#C96B4B]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Nom complet</div>
                  <div className="text-sm font-semibold text-gray-800">Aminata Diallo</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Card>

            <Card className="flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F7C5A0]/20 rounded-full flex items-center justify-center">
                  <Phone size={20} className="text-[#C96B4B]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Téléphone</div>
                  <div className="text-sm font-semibold text-gray-800">+221 77 123 45 67</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Card>

            <Card className="flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#B07590]/20 rounded-full flex items-center justify-center">
                  <MapPin size={20} className="text-[#B07590]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Adresse</div>
                  <div className="text-sm font-semibold text-gray-800">Dalifort, Dakar</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Card>

            <Card className="flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FDF6F0] rounded-full flex items-center justify-center border border-[#F2A7A7]/20">
                  <Calendar size={20} className="text-[#C96B4B]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Date de naissance</div>
                  <div className="text-sm font-semibold text-gray-800">12 Janvier 1998</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-4">
            Paramètres
          </h3>

          <div className="space-y-3">
            <Card className="flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F2A7A7]/20 rounded-full flex items-center justify-center">
                  <Languages size={20} className="text-[#C96B4B]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Langue</div>
                  <div className="text-sm font-semibold text-gray-800">Français / Wolof</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Card>

            <Card className="flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F7C5A0]/20 rounded-full flex items-center justify-center">
                  <Bell size={20} className="text-[#C96B4B]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Notifications</div>
                  <div className="text-sm font-semibold text-gray-800">Activées</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 h-6 bg-gradient-to-r from-[#F2A7A7] to-[#C96B4B] rounded-full p-0.5">
                  <div className="w-5 h-5 bg-white rounded-full ml-auto shadow-sm"></div>
                </div>
              </div>
            </Card>

            <Card className="flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#B07590]/20 rounded-full flex items-center justify-center">
                  <Download size={20} className="text-[#B07590]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Mode Offline</div>
                  <div className="text-sm font-semibold text-gray-800">Données synchronisées</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </Card>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-4">
            Historique des Mesures
          </h3>

          <Card>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="text-sm text-gray-600">Dernière mesure de tension</div>
                <div className="text-sm font-semibold text-gray-800">120/80 mmHg</div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="text-sm text-gray-600">Poids actuel</div>
                <div className="text-sm font-semibold text-gray-800">68 kg</div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="text-sm text-gray-600">Rythme cardiaque bébé</div>
                <div className="text-sm font-semibold text-gray-800">142 bpm</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Température</div>
                <div className="text-sm font-semibold text-gray-800">36.8°C</div>
              </div>
            </div>

            <button className="w-full mt-4 bg-[#FDF6F0] text-[#C96B4B] py-3 rounded-xl font-semibold text-sm hover:bg-[#F7C5A0]/20 transition-colors">
              Voir l'historique complet
            </button>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 mb-2">Besoin d'aide ?</h4>
                <p className="text-sm text-gray-600">
                  Contactez notre équipe de support
                </p>
              </div>
              <button className="w-12 h-12 bg-gradient-to-br from-[#C96B4B] to-[#B07590] rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow">
                <Settings size={20} />
              </button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
