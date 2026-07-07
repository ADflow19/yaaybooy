from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_patiente
from app.db.session import get_db
from app.models.user import User
from app.models.patient import Patient
from app.schemas.patient import PatientCreate, PatientRead, PatientUpdate

router = APIRouter(prefix="/api/patients", tags=["patients"])


# ── Helper interne ────────────────────────────────────────────────────────────

def _get_patient_or_404(current_user: User, db: Session) -> Patient:
    """Charge le profil Patient lié au User connecté, ou lève 404."""
    patient = (
        db.query(Patient)
        .filter(Patient.user_id == current_user.id)
        .first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil patiente introuvable — créez-le d'abord via POST /api/patients/me",
        )
    return patient


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "/me",
    response_model=PatientRead,
    summary="Lire mon profil patiente",
)
def get_my_profile(
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> Patient:
    """
    Retourne le profil médical complet de la patiente connectée.
    Protégé : rôle `patiente` requis.
    """
    return _get_patient_or_404(current_user, db)


@router.post(
    "/me",
    response_model=PatientRead,
    status_code=status.HTTP_201_CREATED,
    summary="Créer mon profil patiente",
)
def create_my_profile(
    payload: PatientCreate,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> Patient:
    """
    Crée le profil médical pour la patiente connectée.
    Un seul profil par compte — lève 409 si déjà existant.
    """
    if db.query(Patient).filter(Patient.user_id == current_user.id).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un profil existe déjà pour ce compte",
        )
    patient = Patient(**payload.model_dump(), user_id=current_user.id)
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.patch(
    "/me",
    response_model=PatientRead,
    summary="Mettre à jour mon profil patiente",
)
def update_my_profile(
    payload: PatientUpdate,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> Patient:
    """
    Met à jour partiellement le profil de la patiente connectée.
    Seuls les champs présents dans le body sont modifiés (PATCH sémantique).
    Protégé : rôle `patiente` requis.
    """
    patient = _get_patient_or_404(current_user, db)

    # exclude_unset=True garantit que seuls les champs envoyés sont écrits
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Aucun champ à mettre à jour fourni",
        )

    for field, value in updates.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient
