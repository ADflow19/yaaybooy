/**
 * VideoCallPage — page dédiée aux appels vidéo.
 * Accessible via /sage-femme/appel/:patientId
 * Évite de modifier les pages existantes.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { ArrowLeft, Video, Loader2, ExternalLink } from "lucide-react";
import { videoCallService } from "../../../api/videoCallService";
import { useApiCall } from "../../../hooks/useApiCall";
import { midwifeService } from "../../../api/midwifeService";
import { VideoCallModal } from "../../components/VideoCallModal";

export function VideoCallPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [roomName, setRoomName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const id = Number(patientId);
  const { data: dossier } = useApiCall(() => midwifeService.getPatient(id), [id]);

  async function handleStartCall() {
    setLoading(true);
    setError(null);
    try {
      const res = await videoCallService.instantCall(id);
      setRoomName(res.room_name);
    } catch {
      setError("Impossible de démarrer l'appel. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <button
        onClick={() => navigate(`/sage-femme/patientes/${patientId}`)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={15} /> Retour au dossier
      </button>

      <div className="bg-white rounded-2xl border border-border p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
          <Video size={28} className="text-primary" />
        </div>

        <div>
          <h1 className="text-xl font-serif font-semibold text-foreground">
            Consultation vidéo
          </h1>
          {dossier && (
            <p className="text-sm text-muted-foreground mt-1">
              Patiente : <span className="font-medium text-foreground">{dossier.name}</span>
            </p>
          )}
        </div>

        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Démarrez une consultation vidéo sécurisée via Jitsi Meet.
          La salle est générée avec un identifiant aléatoire — partagez le lien
          avec la patiente pour qu'elle puisse rejoindre.
        </p>

        {error && (
          <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 px-4 py-2.5 rounded-xl">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleStartCall}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Connexion…</>
              : <><Video size={16} /> Démarrer l'appel vidéo</>
            }
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          Powered by{" "}
          <a href="https://meet.jit.si" target="_blank" rel="noopener noreferrer"
            className="underline hover:text-foreground">
            Jitsi Meet
          </a>{" "}
          — aucune installation requise, fonctionne dans le navigateur
        </p>
      </div>

      {/* Modal vidéo */}
      {roomName && (
        <VideoCallModal
          roomName={roomName}
          title={dossier ? `Consultation — ${dossier.name}` : "Consultation vidéo"}
          onClose={() => {
            setRoomName(null);
            navigate(`/sage-femme/patientes/${patientId}`);
          }}
        />
      )}
    </div>
  );
}
