from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_patiente
from app.db.session import get_db
from app.models.alert import Alert, AlertCategory, AlertSeverity
from app.models.measurement import Measurement, MeasurementStatus, MeasurementType
from app.models.patient import Patient
from app.models.user import User
from app.schemas.measurement import MeasurementCreate, MeasurementRead, MeasurementSharedRead

router = APIRouter(prefix="/api/measurements", tags=["measurements"])


# ── Mapping MeasurementType → AlertCategory ───────────────────────────────────
# Utilisé lors de la création automatique d'alerte au moment du partage.

_TYPE_TO_CATEGORY: dict[MeasurementType, AlertCategory] = {
    MeasurementType.blood_pressure: AlertCategory.bp,
    MeasurementType.heart_rate:     AlertCategory.heartrate,
    MeasurementType.temperature:    AlertCategory.other,
    MeasurementType.baby_movements: AlertCategory.movement,
}

# Titre d'alerte lisible par la sage-femme
_TYPE_TO_LABEL: dict[MeasurementType, str] = {
    MeasurementType.blood_pressure: "Tension artérielle anormale",
    MeasurementType.heart_rate:     "Fréquence cardiaque anormale",
    MeasurementType.temperature:    "Température anormale",
    MeasurementType.baby_movements: "Mouvements fœtaux anormaux",
}


# ── Helper interne ────────────────────────────────────────────────────────────

def _get_patient_or_404(current_user: User, db: Session) -> Patient:
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil patiente introuvable — créez-le via POST /api/patients/me",
        )
    return patient


def _get_measurement_or_404(
    measurement_id: int, patient: Patient, db: Session
) -> Measurement:
    m = db.query(Measurement).filter(
        Measurement.id == measurement_id,
        Measurement.patient_id == patient.id,
    ).first()
    if not m:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mesure introuvable",
        )
    return m


def _create_alert_from_measurement(
    measurement: Measurement, patient: Patient, db: Session
) -> Alert:
    """
    Crée une Alert en base à partir d'une mesure dont le statut est 'alert'.
    La sévérité est 'critical' pour une alerte directe, 'high' sinon.
    """
    category = _TYPE_TO_CATEGORY.get(measurement.type, AlertCategory.other)
    title = _TYPE_TO_LABEL.get(measurement.type, "Valeur anormale détectée")

    alert = Alert(
        patient_id=patient.id,
        weeks=patient.weeks or None,
        severity=AlertSeverity.critical,
        category=category,
        title=title,
        value=measurement.value,
        note=measurement.message,
        resolved=False,
    )
    db.add(alert)
    return alert


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[MeasurementRead],
    summary="Lister mes mesures IoT",
)
def list_measurements(
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> List[Measurement]:
    """
    Retourne toutes les mesures de la patiente connectée,
    triées de la plus récente à la plus ancienne.
    """
    patient = _get_patient_or_404(current_user, db)
    return (
        db.query(Measurement)
        .filter(Measurement.patient_id == patient.id)
        .order_by(Measurement.recorded_at.desc())
        .all()
    )


@router.post(
    "",
    response_model=MeasurementRead,
    status_code=status.HTTP_201_CREATED,
    summary="Enregistrer une mesure IoT",
)
def create_measurement(
    payload: MeasurementCreate,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> Measurement:
    """
    Enregistre une nouvelle mesure (tension, fréquence cardiaque,
    température, mouvements fœtaux) pour la patiente connectée.
    """
    patient = _get_patient_or_404(current_user, db)
    measurement = Measurement(**payload.model_dump(), patient_id=patient.id)
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return measurement


@router.post(
    "/{measurement_id}/share",
    response_model=MeasurementSharedRead,
    summary="Partager une mesure avec la sage-femme",
)
def share_measurement(
    measurement_id: int,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> MeasurementSharedRead:
    """
    Marque la mesure comme partagée avec la sage-femme.

    Comportement selon le statut de la mesure :
    - `normal` / `warning` → partage simple, aucune alerte créée.
    - `alert` → partage **et** création automatique d'une `Alert` critique
      visible dans le tableau de bord de la sage-femme.

    L'opération est **idempotente** : appeler /share plusieurs fois ne crée
    pas de doublons d'alertes.
    """
    patient = _get_patient_or_404(current_user, db)
    measurement = _get_measurement_or_404(measurement_id, patient, db)

    alert_created: Optional[Alert] = None

    # Partage (idempotent)
    already_shared = measurement.shared_with_midwife
    measurement.shared_with_midwife = True

    # Création d'alerte uniquement si statut critique ET pas encore partagée
    if measurement.status == MeasurementStatus.alert and not already_shared:
        alert_created = _create_alert_from_measurement(measurement, patient, db)

    db.commit()
    db.refresh(measurement)
    if alert_created:
        db.refresh(alert_created)

    return MeasurementSharedRead(
        id=measurement.id,
        patient_id=measurement.patient_id,
        type=measurement.type,
        value=measurement.value,
        status=measurement.status,
        message=measurement.message,
        shared_with_midwife=measurement.shared_with_midwife,
        recorded_at=measurement.recorded_at,
        alert_created=alert_created,
    )


@router.delete(
    "/{measurement_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une mesure",
)
def delete_measurement(
    measurement_id: int,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> None:
    """Supprime une mesure appartenant à la patiente connectée."""
    patient = _get_patient_or_404(current_user, db)
    measurement = _get_measurement_or_404(measurement_id, patient, db)
    db.delete(measurement)
    db.commit()
