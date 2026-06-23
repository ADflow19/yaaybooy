import { ArrowLeft, Phone, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { Card } from "../components/Card";
import { motion } from "motion/react";

export function AlertPage() {
  const navigate = useNavigate();

  const handleCallMidwife = () => {
    alert("Appel de la sage-femme en cours... 📞");
  };

  const handleCallFamily = () => {
    alert("Contact de la famille en cours... 👨‍👩‍👧");
  };

  return (
    <div className="min-h-full bg-gradient-to-b from-orange-50 to-white pb-6">
      <div className="bg-gradient-to-br from-orange-400 via-red-400 to-orange-500 px-6 pt-12 pb-8 rounded-b-[2rem]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <AlertTriangle className="text-white" size={32} />
          </motion.div>
          <h1 className="text-white text-3xl font-['Playfair_Display']">
            Alerte Détectée
          </h1>
        </div>
        <p className="text-white/90 text-sm">
          Une situation nécessite votre attention
        </p>
      </div>

      <div className="px-6 -mt-4 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Tension Artérielle Élevée</h3>
                <p className="text-sm text-red-700">
                  Dernière mesure : <span className="font-bold">145/95 mmHg</span>
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Détectée il y a 5 minutes
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-red-100">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <CheckCircle size={18} className="text-[#C96B4B]" />
                Conseils Immédiats
              </h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#C96B4B] mt-0.5">•</span>
                  <span>Asseyez-vous et reposez-vous calmement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C96B4B] mt-0.5">•</span>
                  <span>Buvez un verre d'eau lentement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C96B4B] mt-0.5">•</span>
                  <span>Respirez profondément et calmement</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C96B4B] mt-0.5">•</span>
                  <span>Contactez votre sage-femme si cela persiste</span>
                </li>
              </ul>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-3">
            Actions Urgentes
          </h3>

          <div className="space-y-3">
            <button
              onClick={handleCallMidwife}
              className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-5 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:shadow-lg transition-all active:scale-98"
            >
              <Phone size={24} />
              <div className="text-left">
                <div className="text-base">Appeler ma sage-femme</div>
                <div className="text-xs opacity-90">Réponse garantie sous 5 min</div>
              </div>
            </button>

            <button
              onClick={handleCallFamily}
              className="w-full bg-white border-2 border-[#F2A7A7] text-[#C96B4B] py-5 rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-[#FDF6F0] transition-colors active:scale-98"
            >
              <Users size={24} />
              <div className="text-left">
                <div className="text-base">Contacter ma famille</div>
                <div className="text-xs opacity-80">Notification automatique</div>
              </div>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20">
            <h4 className="font-semibold text-gray-800 mb-3">📊 Historique des Alertes</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tension élevée</span>
                <span className="text-gray-400">Aujourd'hui</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fièvre légère</span>
                <span className="text-gray-400">Il y a 3 jours</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Mouvement bébé réduit</span>
                <span className="text-gray-400">Il y a 1 semaine</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
