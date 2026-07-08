/**
 * VideoCallButton — bouton autonome pour démarrer une consultation vidéo.
 *
 * Deux modes :
 *   - appointmentId : démarre/rejoint un appel lié à un RDV planifié
 *   - patientId     : appel instantané sage-femme → patiente (sans RDV)
 *
 * Peut être inséré dans n'importe quelle page sans la modifier en profondeur.
 */
import { useState } from "react";
import { Video, Loader2 } from "lucide-react";
import { videoCallService } from "../../api/videoCallService";
import { VideoCallModal } from "./VideoCallModal";

interface Props {
  /** Mode RDV planifié */
  appointmentId?: number;
  /** Mode appel instantané (sage-femme seulement) */
  patientId?: number;
  /** Titre affiché dans le header du modal */
  title?: string;
  /** Style du bouton */
  variant?: "primary" | "outline" | "ghost";
  /** Taille */
  size?: "sm" | "md";
  /** Label personnalisé */
  label?: string;
}

export function VideoCallButton({
  appointmentId,
  patientId,
  title = "Consultation vidéo",
  variant = "primary",
  size = "sm",
  label,
}: Props) {
  const [loading,   setLoading]   = useState(false);
  const [roomName,  setRoomName]  = useState<string | null>(null);
  const [error,     setError]     = useState<string | null>(null);

  if (!appointmentId && !patientId) return null;

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = appointmentId
        ? await videoCallService.startAppointmentCall(appointmentId)
        : await videoCallService.instantCall(patientId!);
      setRoomName(res.room_name);
    } catch {
      setError("Impossible de démarrer l'appel. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  const variantCls = {
    primary: "bg-primary text-white hover:bg-primary/90",
    outline: "border border-primary text-primary hover:bg-primary/5",
    ghost:   "text-primary hover:bg-primary/10",
  }[variant];

  const sizeCls = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
  }[size];

  return (
    <>
      <div className="flex flex-col items-start gap-1">
        <button
          onClick={handleClick}
          disabled={loading}
          className={`inline-flex items-center rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantCls} ${sizeCls}`}
          aria-label={label ?? title}
        >
          {loading
            ? <Loader2 size={size === "sm" ? 13 : 15} className="animate-spin" />
            : <Video  size={size === "sm" ? 13 : 15} />
          }
          {loading ? "Connexion…" : (label ?? (appointmentId ? "Démarrer la vidéo" : "Appeler maintenant"))}
        </button>

        {error && (
          <p className="text-[10px] text-destructive">{error}</p>
        )}
      </div>

      {roomName && (
        <VideoCallModal
          roomName={roomName}
          title={title}
          onClose={() => setRoomName(null)}
        />
      )}
    </>
  );
}
