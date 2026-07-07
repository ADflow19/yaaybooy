from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import require_patiente
from app.db.session import get_db
from app.models.baby_journal import BabyJournalEntry
from app.models.patient import Patient
from app.models.user import User
from app.schemas.baby_journal import BabyJournalCreate, BabyJournalRead, BabyJournalUpdate

router = APIRouter(prefix="/api/baby-journal", tags=["baby-journal"])


# ── Helpers internes ──────────────────────────────────────────────────────────

def _get_patient_or_404(current_user: User, db: Session) -> Patient:
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profil patiente introuvable — créez-le via POST /api/patients/me",
        )
    return patient


def _get_entry_or_404(entry_id: int, patient: Patient, db: Session) -> BabyJournalEntry:
    entry = db.query(BabyJournalEntry).filter(
        BabyJournalEntry.id == entry_id,
        BabyJournalEntry.patient_id == patient.id,
    ).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrée de journal introuvable",
        )
    return entry


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=List[BabyJournalRead],
    summary="Lister les entrées du journal bébé",
)
def list_entries(
    weeks: Optional[int] = Query(
        default=None,
        ge=0,
        le=45,
        description="Filtrer les entrées par semaine d'aménorrhée",
    ),
    limit: int = Query(default=20, ge=1, le=100, description="Nombre max de résultats"),
    offset: int = Query(default=0, ge=0, description="Décalage pour la pagination"),
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> List[BabyJournalEntry]:
    """
    Retourne les entrées du journal bébé de la patiente connectée,
    triées de la plus récente à la plus ancienne.

    Filtres optionnels :
    - `?weeks=28` — entrées d'une semaine précise
    - `?limit=10&offset=0` — pagination
    """
    patient = _get_patient_or_404(current_user, db)

    query = db.query(BabyJournalEntry).filter(
        BabyJournalEntry.patient_id == patient.id
    )

    if weeks is not None:
        query = query.filter(BabyJournalEntry.weeks == weeks)

    return (
        query
        .order_by(BabyJournalEntry.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )


@router.post(
    "",
    response_model=BabyJournalRead,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une entrée au journal bébé",
)
def create_entry(
    payload: BabyJournalCreate,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> BabyJournalEntry:
    """
    Crée une nouvelle entrée dans le journal bébé de la patiente connectée.
    `title` est obligatoire. `photo_url` doit être une URL valide si fournie.
    """
    patient = _get_patient_or_404(current_user, db)

    # photo_url est un AnyHttpUrl Pydantic — on le sérialise en str pour SQLAlchemy
    data = payload.model_dump()
    if data.get("photo_url") is not None:
        data["photo_url"] = str(data["photo_url"])

    entry = BabyJournalEntry(**data, patient_id=patient.id)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get(
    "/{entry_id}",
    response_model=BabyJournalRead,
    summary="Détail d'une entrée",
)
def get_entry(
    entry_id: int,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> BabyJournalEntry:
    """Retourne le détail d'une entrée spécifique du journal."""
    patient = _get_patient_or_404(current_user, db)
    return _get_entry_or_404(entry_id, patient, db)


@router.patch(
    "/{entry_id}",
    response_model=BabyJournalRead,
    summary="Modifier une entrée du journal",
)
def update_entry(
    entry_id: int,
    payload: BabyJournalUpdate,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> BabyJournalEntry:
    """
    Met à jour partiellement une entrée du journal bébé.
    Seuls les champs fournis dans le body sont modifiés.
    """
    patient = _get_patient_or_404(current_user, db)
    entry = _get_entry_or_404(entry_id, patient, db)

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Aucun champ à mettre à jour fourni",
        )

    # photo_url est un AnyHttpUrl Pydantic — sérialiser en str pour SQLAlchemy
    if "photo_url" in updates and updates["photo_url"] is not None:
        updates["photo_url"] = str(updates["photo_url"])

    for field, value in updates.items():
        setattr(entry, field, value)

    db.commit()
    db.refresh(entry)
    return entry


@router.delete(
    "/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une entrée du journal",
)
def delete_entry(
    entry_id: int,
    current_user: User = Depends(require_patiente),
    db: Session = Depends(get_db),
) -> None:
    """Supprime définitivement une entrée du journal bébé."""
    patient = _get_patient_or_404(current_user, db)
    entry = _get_entry_or_404(entry_id, patient, db)
    db.delete(entry)
    db.commit()
