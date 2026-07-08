/**
 * VideoCallModal — consultation vidéo via Jitsi Meet (meet.jit.si).
 * Utilise l'API iframe Jitsi (aucune dépendance npm supplémentaire).
 * La room_name est générée côté backend — non-devinable par un tiers.
 */
import { useEffect, useRef, useState } from "react";
import { X, Video, Loader2, ExternalLink } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface Props {
  /** Nom de room Jitsi reçu du backend (format yaaybooy-{uuid}) */
  roomName: string;
  /** Titre affiché dans le header du modal */
  title?: string;
  /** Appelé quand l'utilisateur ferme le modal ou que l'appel se termine */
  onClose: () => void;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (domain: string, options: object) => {
      dispose: () => void;
      addEventListeners: (listeners: Record<string, () => void>) => void;
    };
  }
}

const JITSI_DOMAIN = "meet.jit.si";
const JITSI_SCRIPT_URL = "https://meet.jit.si/external_api.js";

export function VideoCallModal({ roomName, title = "Consultation vidéo", onClose }: Props) {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReturnType<typeof window.JitsiMeetExternalAPI> | null>(null);
  const [loading, setLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);

  const displayName =
    user?.email?.split("@")[0].replace(/[._]/g, " ") ?? "Participant";

  // Charge le script Jitsi si pas encore présent, puis instancie la réunion
  useEffect(() => {
    let cancelled = false;

    function initJitsi() {
      if (cancelled || !containerRef.current) return;
      try {
        apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName,
          parentNode: containerRef.current,
          width:  "100%",
          height: "100%",
          configOverwrite: {
            startWithAudioMuted:     false,
            startWithVideoMuted:     false,
            disableDeepLinking:      true,
            enableClosePage:         false,
            // Désactive les fonctionnalités non nécessaires pour une consultation médicale
            toolbarButtons: [
              "microphone", "camera", "hangup",
              "tileview", "fullscreen",
            ],
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK:         false,
            SHOW_WATERMARK_FOR_GUESTS:    false,
            SHOW_BRAND_WATERMARK:         false,
            HIDE_INVITE_MORE_HEADER:      true,
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            MOBILE_APP_PROMO:             false,
          },
          userInfo: { displayName },
        });

        apiRef.current.addEventListeners({
          // L'utilisateur clique sur "Raccrocher" dans Jitsi
          readyToClose: () => { if (!cancelled) onClose(); },
          videoConferenceJoined: () => { if (!cancelled) setLoading(false); },
        });
      } catch {
        if (!cancelled) setScriptError(true);
      }
    }

    // Si le script est déjà chargé
    if (window.JitsiMeetExternalAPI) {
      initJitsi();
      return () => { cancelled = true; apiRef.current?.dispose(); };
    }

    // Sinon, injecter le script
    const existing = document.getElementById("jitsi-api-script");
    if (existing) {
      existing.addEventListener("load", initJitsi);
      return () => {
        cancelled = true;
        apiRef.current?.dispose();
        existing.removeEventListener("load", initJitsi);
      };
    }

    const script = document.createElement("script");
    script.id  = "jitsi-api-script";
    script.src = JITSI_SCRIPT_URL;
    script.async = true;
    script.onload = initJitsi;
    script.onerror = () => { if (!cancelled) setScriptError(true); };
    document.head.appendChild(script);

    return () => {
      cancelled = true;
      apiRef.current?.dispose();
    };
  }, [roomName, displayName, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] mx-4 my-4 bg-gray-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
              <Video size={14} className="text-primary" />
            </div>
            <span className="text-white text-sm font-semibold">{title}</span>
            {!loading && (
              <span className="flex items-center gap-1 text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                En cours
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Lien de secours pour ouvrir dans un onglet */}
            <a
              href={`https://${JITSI_DOMAIN}/${roomName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              title="Ouvrir dans un onglet"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="flex-1 relative">
          {/* Spinner pendant le chargement */}
          {loading && !scriptError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-900 z-10">
              <Loader2 size={32} className="text-primary animate-spin" />
              <p className="text-gray-300 text-sm">Connexion à la salle de consultation…</p>
            </div>
          )}

          {/* Erreur de chargement du script */}
          {scriptError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-900 z-10 px-8 text-center">
              <div className="text-4xl">📹</div>
              <p className="text-white font-semibold">Impossible de charger Jitsi Meet</p>
              <p className="text-gray-400 text-sm">
                Vérifiez votre connexion internet, puis ouvrez la consultation dans un nouvel onglet.
              </p>
              <a
                href={`https://${JITSI_DOMAIN}/${roomName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <ExternalLink size={14} /> Ouvrir dans un onglet
              </a>
              <button onClick={onClose} className="text-gray-400 text-sm hover:text-white">Annuler</button>
            </div>
          )}

          {/* Conteneur Jitsi — l'API iframe s'y monte */}
          <div
            ref={containerRef}
            className="w-full h-full"
            style={{ minHeight: "400px" }}
          />
        </div>
      </div>
    </div>
  );
}
