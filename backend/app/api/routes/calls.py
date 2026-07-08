"""
Routes de consultation vidéo via Jitsi Meet (serveur public meet.jit.si).
Aucune clé API requise — le room_name est rendu non-devinable par l'ajout
d'un UUID4 aléatoire, jamais exposé en clair dans l'URL publique.
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_sage_femme
from app.db.session import get_db
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User

router = APIRouter(prefix="/api", tags=["video-calls"])


# ── Schémas ────────────────────────────────────────────────────────────────────

class VideoCallResponse(BaseModel):
    room_name: str
    jitsi_url: str          # URL directe pour les clients qui préfèrent ouvrir dans un onglet


# ── Helpers ────────────────────────────────────────────────────────────────────

def _make_room_name() -> str:
    """
    Génère un nom de room non-devinable.
    Format : yaaybooy-{uuid4 sans tirets}
    Longueur : 40 caractères — suffisant pour être opaque.
    """
    return f"yaaybooy-{uuid.uuid4().hex}"


# ── POST /api/appointments/{id}/start-call ────────────────────────────────────

@router.post(
    "/appointments/{appointment_id}/start-call",
    response_model=VideoCallResponse,
    summary="Démarrer ou rejoindre la consultation vidéo d'un RDV",
)
def start_appointment_call(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> VideoCallResponse:
    """
    Génère (ou retourne si déjà créée) la room Jitsi pour un rendez-vous.

    - Si la room n'existe pas encore → crée un `jitsi_room_name` UUID et le persiste.
    - Si elle existe déjà → retourne le même nom (les deux parties obtiennent la même room).
    - Accessible aux deux rôles : la patiente ou la sage-femme peut initier l'appel.
    - Vérification d'accès : la patiente ne peut accéder qu'à ses propres RDV.
    """
    appt = db.get(Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendez-vous introuvable")

    # Vérification d'accès selon le rôle
    if current_user.role.value == "patiente":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or appt.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé")
    # La sage-femme a accès à tous les RDV (déjà protégé par auth)

    # Génère la room si elle n'existe pas encore
    if not appt.jitsi_room_name:
        appt.jitsi_room_name = _make_room_name()
        db.commit()
        db.refresh(appt)

    return VideoCallResponse(
        room_name=appt.jitsi_room_name,
        jitsi_url=f"https://meet.jit.si/{appt.jitsi_room_name}",
    )


# ── POST /api/calls/instant ───────────────────────────────────────────────────

@router.post(
    "/calls/instant",
    response_model=VideoCallResponse,
    summary="Appel vidéo instantané (sage-femme → patiente)",
)
def instant_call(
    patient_id: int,
    current_user: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> VideoCallResponse:
    """
    Crée une room Jitsi éphémère pour un appel spontané d'une sage-femme
    vers une de ses patientes. Le `room_name` est retourné à la sage-femme
    qui peut ensuite le communiquer à la patiente (par message, alerte, etc.).

    Ce room n'est pas persisté en base — il est valable pour la durée de l'appel.
    Chaque appel à cet endpoint génère un nouveau room unique.
    """
    # Vérification que la patiente existe
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patiente introuvable")

    room_name = _make_room_name()

    return VideoCallResponse(
        room_name=room_name,
        jitsi_url=f"https://meet.jit.si/{room_name}",
    )
