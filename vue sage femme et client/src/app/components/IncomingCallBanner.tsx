/**
 * IncomingCallBanner — bannière d'appel vidéo entrant pour la patiente.
 *
 * Principe :
 *   - Poll GET /api/alerts toutes les 5 secondes
 *   - Détecte une alerte avec titre "📹 Appel vidéo entrant" et resolved=false
 *   - Affiche une bannière persistante en haut de l'écran
 *   - "Rejoindre" → ouvre Jitsi dans un nouvel onglet + dismiss l'alerte
 *   - "Refuser"  → dismiss l'alerte sans ouvrir Jitsi
 *   - Son de notification au premier appel détecté (Web Audio API)
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Video, X, PhoneOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { apiClient } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

const INCOMING_CALL_TITLE = "📹 Appel vidéo entrant";
const POLL_INTERVAL_MS = 5000;

interface CallAlert {
  id: number;
  title: string;
  value: string | null;   // room_name
  normal: string | null;  // jitsi_url
  note: string | null;
}

function playRingtone() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.6);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);
  } catch {
    // AudioContext non disponible — silencieux
  }
}

export function IncomingCallBanner() {
  const { isAuthenticated, role } = useAuth();
  const [incomingCall, setIncomingCall] = useState<CallAlert | null>(null);
  const [joining, setJoining] = useState(false);
  const lastAlertIdRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkForIncomingCall = useCallback(async () => {
    if (!isAuthenticated || role !== "patiente") return;
    try {
      const res = await apiClient.get<CallAlert[]>("/api/alerts", {
        params: { resolved: false },
      });
      const call = res.data.find((a) => a.title === INCOMING_CALL_TITLE);
      if (call) {
        setIncomingCall(call);
        // Joue la sonnerie seulement à la première détection
        if (call.id !== lastAlertIdRef.current) {
          lastAlertIdRef.current = call.id;
          playRingtone();
        }
      } else {
        setIncomingCall(null);
      }
    } catch {
      // Erreur réseau — on ignore silencieusement
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    if (!isAuthenticated || role !== "patiente") return;

    // Premier check immédiat
    checkForIncomingCall();

    // Puis poll régulier
    intervalRef.current = setInterval(checkForIncomingCall, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAuthenticated, role, checkForIncomingCall]);

  async function dismissCall(alertId: number) {
    try {
      await apiClient.post(`/api/calls/${alertId}/dismiss`);
    } catch {
      // Ignore si déjà dismissé
    }
    setIncomingCall(null);
    lastAlertIdRef.current = null;
  }

  async function handleJoin() {
    if (!incomingCall) return;
    setJoining(true);
    const url = incomingCall.normal ?? `https://meet.jit.si/${incomingCall.value}`;
    window.open(url, "_blank", "noopener,noreferrer");
    await dismissCall(incomingCall.id);
    setJoining(false);
  }

  async function handleDecline() {
    if (!incomingCall) return;
    await dismissCall(incomingCall.id);
  }

  // N'affiche rien si pas patiente authentifiée ou pas d'appel
  if (!isAuthenticated || role !== "patiente") return null;

  return (
    <AnimatePresence>
      {incomingCall && (
        <motion.div
          key="incoming-call"
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
            {/* Barre colorée en haut */}
            <div className="h-1.5 bg-gradient-to-r from-[#C96B4B] to-[#B07590] animate-pulse" />

            <div className="px-4 py-4 flex items-center gap-4">
              {/* Icône animée */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C96B4B] to-[#B07590] flex items-center justify-center shrink-0 animate-pulse shadow-lg">
                <Video size={22} className="text-white" />
              </div>

              {/* Texte */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800">Appel vidéo entrant</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">
                  Votre sage-femme vous appelle
                </p>
              </div>

              {/* Bouton fermer discret */}
              <button
                onClick={handleDecline}
                className="text-gray-400 hover:text-gray-600 shrink-0"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Actions */}
            <div className="px-4 pb-4 flex gap-2">
              <button
                onClick={handleDecline}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 border border-red-200 text-red-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
              >
                <PhoneOff size={15} /> Refuser
              </button>
              <button
                onClick={handleJoin}
                disabled={joining}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                <Video size={15} />
                {joining ? "Connexion…" : "Rejoindre"}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
