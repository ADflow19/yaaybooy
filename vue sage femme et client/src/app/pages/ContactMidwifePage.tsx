/**
 * ContactMidwifePage — permet à la patiente de contacter sa sage-femme.
 * Accessible via /contact dans l'espace patiente.
 */
import { useState } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Phone, Video, MessageCircle, AlertTriangle, Heart, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useApiCall } from "../../hooks/useApiCall";
import { patientService } from "../../api/patientService";
import { appointmentService } from "../../api/appointmentService";
import { videoCallService } from "../../api/videoCallService";

export function ContactMidwifePage() {
  const { data: patient } = useApiCall(() => patientService.getMe());
  const { data: appointments } = useApiCall(() => appointmentService.list(true));

  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError,   setVideoError]   = useState<string | null>(null);
  const [videoUrl,     setVideoUrl]     = useState<string | null>(null);

  // Prochain RDV avec une sage-femme assignée
  const nextApptWithMidwife = appointments?.find((a) => a.midwife_id !== null) ?? null;

  async function handleVideoCall() {
    if (!nextApptWithMidwife) return;
    setVideoLoading(true);
    setVideoError(null);
    try {
      const res = await videoCallService.startAppointmentCall(nextApptWithMidwife.id);
      setVideoUrl(res.jitsi_url);
      window.open(res.jitsi_url, "_blank", "noopener,noreferrer");
    } catch {
      setVideoError("Impossible de démarrer l'appel vidéo. Réessayez dans un instant.");
    } finally {
      setVideoLoading(false);
    }
  }

  return (
    <div className="pb-8">
      <Header greeting="Contacter" name="ma sage-femme" />

      <div className="max-w-2xl mx-auto px-8 mt-6 space-y-6">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card gradient className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Heart size={28} className="text-white fill-white" />
            </div>
            <h2 className="font-['Playfair_Display'] text-xl text-gray-800 mb-2">Votre sage-femme est disponible</h2>
            <p className="text-sm text-gray-600">
              Plusieurs moyens de la contacter selon l'urgence de votre situation.
            </p>
          </Card>
        </motion.div>

        {/* Urgence */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">En cas d'urgence</p>
              <p className="text-xs text-red-600 mt-0.5">
                Saignements, douleurs intenses, fièvre élevée → appelez le <strong>15 (SAMU)</strong> ou le <strong>18 (pompiers)</strong> immédiatement.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Options de contact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-4">Options de contact</h3>
          <div className="space-y-3">

            {/* Appel téléphonique */}
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
                  <Phone size={22} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">Appel téléphonique</p>
                  <p className="text-xs text-gray-500 mt-0.5">Contact direct, disponible 8h–17h</p>
                </div>
                <a
                  href="tel:+221770000000"
                  className="bg-green-500 text-white text-xs px-4 py-2 rounded-xl font-medium hover:bg-green-600 transition-colors shrink-0"
                >
                  Appeler
                </a>
              </div>
            </Card>

            {/* Consultation vidéo */}
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-[#C96B4B]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Video size={22} className="text-[#C96B4B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">Consultation vidéo</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {nextApptWithMidwife
                      ? `RDV du ${new Date(nextApptWithMidwife.scheduled_at).toLocaleDateString("fr-FR")}`
                      : "Requiert un rendez-vous planifié"}
                  </p>
                  {videoError && <p className="text-xs text-red-500 mt-1">{videoError}</p>}
                  {videoUrl && (
                    <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[#C96B4B] underline mt-1 inline-flex items-center gap-1">
                      <ExternalLink size={10} /> Rejoindre à nouveau
                    </a>
                  )}
                </div>
                <button
                  onClick={handleVideoCall}
                  disabled={!nextApptWithMidwife || videoLoading}
                  className="bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white text-xs px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1.5"
                >
                  {videoLoading
                    ? <><Loader2 size={12} className="animate-spin" /> Connexion…</>
                    : <><Video size={12} /> Démarrer</>
                  }
                </button>
              </div>
            </Card>

            {/* Message via chatbot */}
            <Card className="p-0 overflow-hidden">
              <div className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-[#B07590]/10 rounded-2xl flex items-center justify-center shrink-0">
                  <MessageCircle size={22} className="text-[#B07590]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">Assistant IA Yaay</p>
                  <p className="text-xs text-gray-500 mt-0.5">Réponses immédiates 24h/24 — bulle en bas à droite</p>
                </div>
                <div className="text-xs text-[#B07590] bg-[#B07590]/10 px-3 py-1.5 rounded-xl font-medium shrink-0">
                  Disponible
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Prochain RDV */}
        {nextApptWithMidwife && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-[#FDF6F0] to-[#F7C5A0]/20">
              <h4 className="font-semibold text-gray-800 mb-2">Prochain rendez-vous</h4>
              <p className="text-sm text-gray-700 font-medium">
                {new Date(nextApptWithMidwife.scheduled_at).toLocaleString("fr-FR", {
                  weekday: "long", day: "numeric", month: "long",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
              {nextApptWithMidwife.note && (
                <p className="text-xs text-gray-500 mt-1">📍 {nextApptWithMidwife.note}</p>
              )}
            </Card>
          </motion.div>
        )}

        {/* Infos pratiques */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <h4 className="font-semibold text-gray-800 mb-3">💡 À savoir</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-[#C96B4B] mt-0.5">•</span>
                <span>Pour tout symptôme inquiétant, partagez d'abord une mesure IoT depuis l'onglet Mesures</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C96B4B] mt-0.5">•</span>
                <span>La consultation vidéo nécessite un rendez-vous planifié avec votre sage-femme</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C96B4B] mt-0.5">•</span>
                <span>L'assistant IA Yaay répond aux questions générales mais ne remplace pas un avis médical</span>
              </li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
