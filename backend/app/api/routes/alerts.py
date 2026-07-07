from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_patiente
from app.db.session import get_db
from app.models.alert import Alert
from app.models.patient import Patient
from app.models.user import User
from app.schemas.alert import AlertRead

router = APIRouter(prefix="/api/alerts", tags=["alerts"])


# ── Helper interne ────────────────────────────────────────────────────────────

def _get_patient_or_404(current_user: User, db: Session) -> Patient:
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil patiente introuvable — créez-le via POST /api/patients/me",
        )
    return patient


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[AlertRead],
    summary="Lister mes alertes",
)
def list_alerts(
    resolved: Optional[bool] = Query(
        default=None,
        description="Filtrer par statut : `true` = résolues, `false` = actives, omis = toutes",
    ),
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> List[Alert]:
    """
    Retourne les alertes de la patiente connectée, triées de la plus récente
    à la plus ancienne.

    Les alertes sont créées automatiquement lorsqu'une mesure IoT est partagée
    avec le statut `alert` (via `POST /api/measurements/{id}/share`).

    Paramètre optionnel `?resolved=false` pour ne voir que les alertes actives.
    """
    patient = _get_patient_or_404(current_user, db)

    query = db.query(Alert).filter(Alert.patient_id == patient.id)

    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)

    return query.order_by(Alert.time.desc()).all()


@router.get(
    "/{alert_id}",
    response_model=AlertRead,
    summary="Détail d'une alerte",
)
def get_alert(
    alert_id: int,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> Alert:
    """Retourne le détail d'une alerte spécifique appartenant à la patiente connectée."""
    patient = _get_patient_or_404(current_user, db)

    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.patient_id == patient.id,
    ).first()

    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerte introuvable",
        )
    return alert
