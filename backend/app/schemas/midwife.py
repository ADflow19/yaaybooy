"""
Schémas spécifiques à l'espace sage-femme.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, field_validator

from app.models.appointment import AppointmentType
from app.schemas.alert import AlertRead
from app.schemas.appointment import AppointmentRead
from app.schemas.consultation import ConsultationRead
from app.schemas.measurement import MeasurementRead
from app.schemas.patient import PatientRead
from app.schemas.vaccination import VaccinationRead


class PatientDossierRead(PatientRead):
    """
    Dossier complet d'une patiente tel que vu par la sage-femme.
    Étend PatientRead avec toutes les sous-ressources associées.
    Seules les mesures marquées shared_with_midwife=True sont incluses.
    """
    alerts: List[AlertRead] = []
    appointments: List[AppointmentRead] = []
    measurements: List[MeasurementRead] = []
    consultations: List[ConsultationRead] = []
    vaccinations: List[VaccinationRead] = []


class AppointmentMidwifeCreate(BaseModel):
    """
    Création de RDV par la sage-femme.
    Contrairement à AppointmentCreate (patiente), aucune contrainte de date future :
    la sage-femme peut saisir rétroactivement un compte-rendu de consultation.
    """
    scheduled_at: datetime
    duration: Optional[int] = 30
    type: Optional[AppointmentType] = AppointmentType.routine
    weeks: Optional[int] = None
    note: Optional[str] = None

    @field_validator("duration")
    @classmethod
    def duration_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (5 <= v <= 480):
            raise ValueError("La durée doit être comprise entre 5 et 480 minutes")
        return v

    @field_validator("weeks")
    @classmethod
    def weeks_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (0 <= v <= 45):
            raise ValueError("Le nombre de semaines doit être compris entre 0 et 45")
        return v
