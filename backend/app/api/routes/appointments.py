from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_patiente
from app.db.session import get_db
from app.models.appointment import Appointment, AppointmentType
from app.models.patient import Patient
from app.models.user import User
from app.schemas.appointment import AppointmentCreate, AppointmentRead, AppointmentUpdate

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


# ── Helper interne ────────────────────────────────────────────────────────────

def _get_patient_or_404(current_user: User, db: Session) -> Patient:
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil patiente introuvable — créez-le via POST /api/patients/me",
        )
    return patient


def _get_appointment_or_404(appt_id: int, patient: Patient, db: Session) -> Appointment:
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id,
        Appointment.patient_id == patient.id,
    ).first()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendez-vous introuvable",
        )
    return appt


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[AppointmentRead],
    summary="Lister mes rendez-vous",
)
def list_appointments(
    upcoming_only: bool = Query(
        default=False,
        description="Si `true`, retourne uniquement les rendez-vous à venir",
    ),
    type: Optional[AppointmentType] = Query(
        default=None,
        description="Filtrer par type : routine, urgent, birth, first",
    ),
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> List[Appointment]:
    """
    Retourne les rendez-vous de la patiente connectée, triés par date croissante
    (le prochain RDV en premier).

    Filtres optionnels :
    - `?upcoming_only=true` — uniquement les RDV futurs
    - `?type=urgent` — uniquement les RDV urgents
    """
    from datetime import datetime, timezone

    patient = _get_patient_or_404(current_user, db)

    query = (
        db.query(Appointment)
        .filter(Appointment.patient_id == patient.id)
    )

    if upcoming_only:
        query = query.filter(Appointment.scheduled_at >= datetime.now(timezone.utc))

    if type is not None:
        query = query.filter(Appointment.type == type)

    return query.order_by(Appointment.scheduled_at.asc()).all()


@router.post(
    "",
    response_model=AppointmentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un rendez-vous",
)
def create_appointment(
    payload: AppointmentCreate,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> Appointment:
    """
    Crée un rendez-vous pour la patiente connectée.
    La date doit être dans le futur.
    La sage-femme assignée (`midwife_id`) peut être définie plus tard
    par la sage-femme elle-même via `PATCH /api/midwife/appointments/{id}`.
    """
    patient = _get_patient_or_404(current_user, db)
    appt = Appointment(**payload.model_dump(), patient_id=patient.id)
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.patch(
    "/{appt_id}",
    response_model=AppointmentRead,
    summary="Modifier un rendez-vous",
)
def update_appointment(
    appt_id: int,
    payload: AppointmentUpdate,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> Appointment:
    """
    Met à jour partiellement un rendez-vous de la patiente connectée.
    Seuls les champs fournis dans le body sont modifiés.
    """
    patient = _get_patient_or_404(current_user, db)
    appt = _get_appointment_or_404(appt_id, patient, db)

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Aucun champ à mettre à jour fourni",
        )

    for field, value in updates.items():
        setattr(appt, field, value)

    db.commit()
    db.refresh(appt)
    return appt


@router.delete(
    "/{appt_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Annuler un rendez-vous",
)
def delete_appointment(
    appt_id: int,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> None:
    """Supprime un rendez-vous appartenant à la patiente connectée."""
    patient = _get_patient_or_404(current_user, db)
    appt = _get_appointment_or_404(appt_id, patient, db)
    db.delete(appt)
    db.commit()
