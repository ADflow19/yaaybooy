"""
Routes de consultation vidéo via Jitsi Meet (serveur public meet.jit.si).
Aucune clé API requise — le room_name est rendu non-devinable par l'ajout
d'un UUID4 aléatoire, jamais exposé en clair dans l'URL publique.

Notification d'appel entrant :
  Lors d'un appel instantané, une Alert de catégorie "other" est créée
  pour la patiente. Le champ `value` contient le room_name Jitsi.
  Le frontend patiente poll /api/alerts et détecte le titre "📹 Appel vidéo entrant".
"""
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_sage_femme
from app.db.session import get_db
from app.models.alert import Alert, AlertSeverity, AlertCategory
from app.models.appointment import Appointment
from app.models.patient import Patient
from app.models.user import User

router = APIRouter(prefix="/api", tags=["video-calls"])

INCOMING_CALL_TITLE = "📹 Appel vidéo entrant"


class VideoCallResponse(BaseModel):
    room_name: str
    jitsi_url: str


def _make_room_name() -> str:
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
    appt = db.get(Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rendez-vous introuvable")

    if current_user.role.value == "patiente":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or appt.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé")

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
    Génère une room Jitsi et crée une alerte pour la patiente afin
    qu'elle soit notifiée de l'appel entrant côté frontend.
    """
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patiente introuvable")

    room_name = _make_room_name()
    jitsi_url = f"https://meet.jit.si/{room_name}"

    # ── Notification : alerte "appel entrant" pour la patiente ────────────────
    # On résout d'abord les alertes d'appel précédentes non résolues
    # pour éviter les doublons si la SF rappelle.
    (
        db.query(Alert)
        .filter(
            Alert.patient_id == patient.id,
            Alert.title == INCOMING_CALL_TITLE,
            Alert.resolved == False,  # noqa: E712
        )
        .update({"resolved": True})
    )

    call_alert = Alert(
        patient_id=patient.id,
        severity=AlertSeverity.high,
        category=AlertCategory.other,
        title=INCOMING_CALL_TITLE,
        value=room_name,          # room_name stocké ici — le frontend l'utilise pour ouvrir Jitsi
        normal=jitsi_url,         # URL complète en accès direct
        note=(
            f"Votre sage-femme vous appelle en vidéo. "
            f"Cliquez sur 'Rejoindre' pour accéder à la consultation."
        ),
        resolved=False,
    )
    db.add(call_alert)
    db.commit()

    return VideoCallResponse(
        room_name=room_name,
        jitsi_url=jitsi_url,
    )


# ── POST /api/calls/{alert_id}/dismiss ────────────────────────────────────────

@router.post(
    "/calls/{alert_id}/dismiss",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Marquer un appel entrant comme vu/refusé",
)
def dismiss_call(
    alert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Résout l'alerte d'appel entrant pour qu'elle ne réapparaisse plus."""
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerte introuvable")

    # La patiente ne peut dismiss que ses propres alertes
    if current_user.role.value == "patiente":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or alert.patient_id != patient.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Accès refusé")

    alert.resolved = True
    db.commit()
