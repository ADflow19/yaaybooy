/**
 * QuickVideoCall — démarrage d'un appel vidéo sans modifier les pages existantes.
 *
 * Usage minimal dans n'importe quel fichier :
 *
 *   import { QuickVideoCall } from "../components/QuickVideoCall";
 *   <QuickVideoCall patientId={dossier.id} patientName={dossier.name} />
 *
 * Quand on clique : appelle le backend → ouvre Jitsi dans un nouvel onglet.
 * Aucun modal, aucun router, aucune dépendance externe.
 */
import { useState } from "react";
import { Video, Loader2, ExternalLink } from "lucide-react";
import { videoCallService } from "../../api/videoCallService";

interface Props {
  patientId?: number;
  appointmentId?: number;
  patientName?: string;
  className?: string;
}

export function QuickVideoCall({ patientId, appointmentId, patientName, className = "" }: Props) {
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);
  const [url,     setUrl]       = useState<string | null>(null);

  if (!patientId && !appointmentId) return null;

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = appointmentId
        ? await videoCallService.startAppointmentCall(appointmentId)
        : await videoCallService.instantCall(patientId!);

      setUrl(res.jitsi_url);
      // Ouvre directement dans un nouvel onglet
      window.open(res.jitsi_url, "_blank", "noopener,noreferrer");
    } catch {
      setError("Impossible de démarrer l'appel.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-1.5 bg-primary text-white text-xs px-3 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? <Loader2 size={13} className="animate-spin" />
          : <Video size={13} />
        }
        {loading ? "Connexion…" : (patientName ? `Appeler ${patientName}` : "Appel vidéo")}
      </button>

      {/* Lien de réutilisation si la room a déjà été générée */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
        >
          <ExternalLink size={10} />
          Rejoindre à nouveau
        </a>
      )}

      {error && (
        <p className="text-[10px] text-destructive">{error}</p>
      )}
    </div>
  );
}
