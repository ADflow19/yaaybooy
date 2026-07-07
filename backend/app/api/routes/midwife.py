from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.dependencies import require_sage_femme
from app.db.session import get_db
from app.models.alert import Alert
from app.models.appointment import Appointment
from app.models.consultation import Consultation
from app.models.measurement import Measurement
from app.models.patient import Patient, RiskLevel
from app.models.user import User
from app.models.vaccination import Vaccination
from app.schemas.alert import AlertRead, AlertUpdate
from app.schemas.appointment import AppointmentRead, AppointmentUpdate
from app.schemas.consultation import ConsultationCreate, ConsultationRead, ConsultationUpdate
from app.schemas.midwife import AppointmentMidwifeCreate, PatientDossierRead
from app.schemas.patient import PatientRead, PatientUpdate
from app.schemas.vaccination import VaccinationCreate, VaccinationRead, VaccinationUpdate

router = APIRouter(prefix="/api/midwife", tags=["midwife"])


# ── Helpers internes ──────────────────────────────────────────────────────────

def _get_patient_or_404(patient_id: int, db: Session) -> Patient:
    patient = db.get(Patient, patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patiente introuvable",
        )
    return patient


def _build_dossier(patient: Patient, db: Session) -> PatientDossierRead:
    """
    Assemble le dossier complet d'une patiente.
    Les mesures sont filtrées sur shared_with_midwife=True.
    """
    shared_measurements = (
        db.query(Measurement)
        .filter(
            Measurement.patient_id == patient.id,
            Measurement.shared_with_midwife.is_(True),
        )
        .order_by(Measurement.recorded_at.desc())
        .all()
    )

    return PatientDossierRead(
        # Champs PatientRead
        id=patient.id,
        user_id=patient.user_id,
        name=patient.name,
        age=patient.age,
        weeks=patient.weeks,
        dpa=patient.dpa,
        last_visit=patient.last_visit,
        next_visit=patient.next_visit,
        risk=patient.risk,
        blood_type=patient.blood_type,
        phone=patient.phone,
        village=patient.village,
        gravida=patient.gravida,
        para=patient.para,
        photo=patient.photo,
        # Sous-ressources
        alerts=patient.alerts,
        appointments=patient.appointments,
        measurements=shared_measurements,
        consultations=patient.consultations,
        vaccinations=patient.vaccinations,
    )


# ── Patientes ─────────────────────────────────────────────────────────────────

@router.get(
    "/patients",
    response_model=List[PatientRead],
    summary="Lister toutes les patientes",
)
def list_patients(
    search: Optional[str] = Query(
        default=None,
        description="Recherche par nom (insensible à la casse)",
    ),
    risk: Optional[RiskLevel] = Query(
        default=None,
        description="Filtrer par niveau de risque : high, watch, normal",
    ),
    sort_by: str = Query(
        default="name",
        pattern="^(name|risk|weeks|next_visit)$",
        description="Champ de tri : name, risk, weeks, next_visit",
    ),
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> List[Patient]:
    """
    Retourne toutes les patientes enregistrées.

    Filtres optionnels :
    - `?search=fatou` — filtre par nom (contient, insensible à la casse)
    - `?risk=high` — filtre par niveau de risque
    - `?sort_by=next_visit` — tri par date de prochain RDV
    """
    query = db.query(Patient)

    if search:
        query = query.filter(Patient.name.ilike(f"%{search}%"))

    if risk:
        query = query.filter(Patient.risk == risk)

    sort_col = {
        "name":       Patient.name,
        "risk":       Patient.risk,
        "weeks":      Patient.weeks.desc(),
        "next_visit": Patient.next_visit,
    }.get(sort_by, Patient.name)

    return query.order_by(sort_col).all()


@router.get(
    "/patients/{patient_id}",
    response_model=PatientDossierRead,
    summary="Dossier complet d'une patiente",
)
def get_patient_dossier(
    patient_id: int,
    current_user: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> PatientDossierRead:
    """
    Retourne le dossier médical complet d'une patiente :
    profil + alertes + rendez-vous + mesures partagées
    + notes cliniques + vaccinations.
    """
    patient = (
        db.query(Patient)
        .options(
            joinedload(Patient.alerts),
            joinedload(Patient.appointments),
            joinedload(Patient.consultations),
            joinedload(Patient.vaccinations),
        )
        .filter(Patient.id == patient_id)
        .first()
    )
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patiente introuvable",
        )
    return _build_dossier(patient, db)


@router.patch(
    "/patients/{patient_id}",
    response_model=PatientRead,
    summary="Mettre à jour le profil d'une patiente",
)
def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> Patient:
    """Met à jour partiellement le profil médical d'une patiente."""
    patient = _get_patient_or_404(patient_id, db)

    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Aucun champ à mettre à jour fourni",
        )
    for field, val in updates.items():
        setattr(patient, field, val)
    db.commit()
    db.refresh(patient)
    return patient


# ── Alertes ───────────────────────────────────────────────────────────────────

@router.get(
    "/alerts",
    response_model=List[AlertRead],
    summary="Toutes les alertes (toutes patientes)",
)
def list_all_alerts(
    resolved: Optional[bool] = Query(
        default=None,
        description="`false` = actives uniquement, `true` = résolues, omis = toutes",
    ),
    severity: Optional[str] = Query(
        default=None,
        description="Filtrer par sévérité : critical, high, medium, resolved",
    ),
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> List[Alert]:
    """
    Retourne toutes les alertes de toutes les patientes, triées par date décroissante.
    C'est la vue tableau de bord de la sage-femme.
    """
    query = db.query(Alert)

    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)

    if severity:
        query = query.filter(Alert.severity == severity)

    return query.order_by(Alert.time.desc()).all()


@router.get(
    "/patients/{patient_id}/alerts",
    response_model=List[AlertRead],
    summary="Alertes d'une patiente",
)
def list_patient_alerts(
    patient_id: int,
    resolved: Optional[bool] = Query(default=None),
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> List[Alert]:
    _get_patient_or_404(patient_id, db)
    query = db.query(Alert).filter(Alert.patient_id == patient_id)
    if resolved is not None:
        query = query.filter(Alert.resolved == resolved)
    return query.order_by(Alert.time.desc()).all()


@router.patch(
    "/alerts/{alert_id}",
    response_model=AlertRead,
    summary="Résoudre / modifier une alerte",
)
def update_alert(
    alert_id: int,
    payload: AlertUpdate,
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> Alert:
    """Permet de marquer une alerte comme résolue ou d'ajouter une note."""
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerte introuvable",
        )
    updates = payload.model_dump(exclude_unset=True)
    for field, val in updates.items():
        setattr(alert, field, val)
    db.commit()
    db.refresh(alert)
    return alert


# ── Agenda ────────────────────────────────────────────────────────────────────

@router.get(
    "/appointments",
    response_model=List[AppointmentRead],
    summary="Agenda de la sage-femme connectée",
)
def list_midwife_appointments(
    upcoming_only: bool = Query(
        default=False,
        description="Si `true`, retourne uniquement les RDV à venir",
    ),
    unassigned: bool = Query(
        default=False,
        description="Si `true`, retourne les RDV sans sage-femme assignée (en attente)",
    ),
    current_user: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> List[Appointment]:
    """
    Retourne les rendez-vous de la sage-femme connectée, triés par date croissante.

    - `?upcoming_only=true` — uniquement les RDV futurs
    - `?unassigned=true` — RDV créés par les patientes sans sage-femme assignée
    """
    if unassigned:
        query = db.query(Appointment).filter(Appointment.midwife_id.is_(None))
    else:
        query = db.query(Appointment).filter(
            Appointment.midwife_id == current_user.id
        )

    if upcoming_only:
        query = query.filter(
            Appointment.scheduled_at >= datetime.now(timezone.utc)
        )

    return query.order_by(Appointment.scheduled_at.asc()).all()


@router.post(
    "/patients/{patient_id}/appointments",
    response_model=AppointmentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un RDV pour une patiente",
)
def create_midwife_appointment(
    patient_id: int,
    payload: AppointmentMidwifeCreate,
    current_user: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> Appointment:
    """Crée un rendez-vous et l'assigne automatiquement à la sage-femme connectée."""
    _get_patient_or_404(patient_id, db)
    appt = Appointment(
        **payload.model_dump(),
        patient_id=patient_id,
        midwife_id=current_user.id,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


@router.patch(
    "/appointments/{appt_id}",
    response_model=AppointmentRead,
    summary="Modifier un RDV",
)
def update_midwife_appointment(
    appt_id: int,
    payload: AppointmentUpdate,
    current_user: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> Appointment:
    """
    Met à jour un RDV assigné à la sage-femme connectée.
    Permet aussi d'assigner un RDV non assigné en passant `midwife_id`
    (géré via PATCH /appointments/{id} par la sage-femme).
    """
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id,
        Appointment.midwife_id == current_user.id,
    ).first()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendez-vous introuvable ou non assigné à ce compte",
        )
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Aucun champ à mettre à jour fourni",
        )
    for field, val in updates.items():
        setattr(appt, field, val)
    db.commit()
    db.refresh(appt)
    return appt


@router.delete(
    "/appointments/{appt_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Annuler un RDV",
)
def delete_midwife_appointment(
    appt_id: int,
    current_user: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> None:
    appt = db.query(Appointment).filter(
        Appointment.id == appt_id,
        Appointment.midwife_id == current_user.id,
    ).first()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendez-vous introuvable",
        )
    db.delete(appt)
    db.commit()


# ── Notes cliniques ───────────────────────────────────────────────────────────

@router.get(
    "/patients/{patient_id}/notes",
    response_model=List[ConsultationRead],
    summary="Notes cliniques d'une patiente",
)
def list_patient_notes(
    patient_id: int,
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> List[Consultation]:
    _get_patient_or_404(patient_id, db)
    return (
        db.query(Consultation)
        .filter(Consultation.patient_id == patient_id)
        .order_by(Consultation.date.desc())
        .all()
    )


@router.post(
    "/patients/{patient_id}/notes",
    response_model=ConsultationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une note clinique",
)
def create_note(
    patient_id: int,
    payload: ConsultationCreate,
    current_user: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> Consultation:
    """
    Crée une note clinique liée à la patiente.
    `midwife_id` est automatiquement renseigné avec l'id de la sage-femme connectée.
    """
    _get_patient_or_404(patient_id, db)
    note = Consultation(
        **payload.model_dump(),
        patient_id=patient_id,
        midwife_id=current_user.id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.patch(
    "/patients/{patient_id}/notes/{note_id}",
    response_model=ConsultationRead,
    summary="Modifier une note clinique",
)
def update_note(
    patient_id: int,
    note_id: int,
    payload: ConsultationUpdate,
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> Consultation:
    note = db.query(Consultation).filter(
        Consultation.id == note_id,
        Consultation.patient_id == patient_id,
    ).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note clinique introuvable",
        )
    updates = payload.model_dump(exclude_unset=True)
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Aucun champ à mettre à jour fourni",
        )
    for field, val in updates.items():
        setattr(note, field, val)
    db.commit()
    db.refresh(note)
    return note


@router.delete(
    "/patients/{patient_id}/notes/{note_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une note clinique",
)
def delete_note(
    patient_id: int,
    note_id: int,
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> None:
    note = db.query(Consultation).filter(
        Consultation.id == note_id,
        Consultation.patient_id == patient_id,
    ).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note clinique introuvable",
        )
    db.delete(note)
    db.commit()


# ── Vaccinations ──────────────────────────────────────────────────────────────

@router.get(
    "/patients/{patient_id}/vaccinations",
    response_model=List[VaccinationRead],
    summary="Vaccinations d'une patiente",
)
def list_vaccinations(
    patient_id: int,
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> List[Vaccination]:
    _get_patient_or_404(patient_id, db)
    return (
        db.query(Vaccination)
        .filter(Vaccination.patient_id == patient_id)
        .order_by(Vaccination.date.asc())
        .all()
    )


@router.post(
    "/patients/{patient_id}/vaccinations",
    response_model=VaccinationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter une vaccination",
)
def create_vaccination(
    patient_id: int,
    payload: VaccinationCreate,
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> Vaccination:
    _get_patient_or_404(patient_id, db)
    vax = Vaccination(**payload.model_dump(), patient_id=patient_id)
    db.add(vax)
    db.commit()
    db.refresh(vax)
    return vax


@router.patch(
    "/patients/{patient_id}/vaccinations/{vax_id}",
    response_model=VaccinationRead,
    summary="Modifier une vaccination",
)
def update_vaccination(
    patient_id: int,
    vax_id: int,
    payload: VaccinationUpdate,
    _: User = Depends(require_sage_femme),
    db: Session = Depends(get_db),
) -> Vaccination:
    vax = db.query(Vaccination).filter(
        Vaccination.id == vax_id,
        Vaccination.patient_id == patient_id,
    ).first()
    if not vax:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vaccination introuvable",
        )
    updates = payload.model_dump(exclude_unset=True)
    for field, val in updates.items():
        setattr(vax, field, val)
    db.commit()
    db.refresh(vax)
    return vax
