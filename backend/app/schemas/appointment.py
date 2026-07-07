from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, field_validator, model_validator
from app.models.appointment import AppointmentType


class AppointmentBase(BaseModel):
    scheduled_at: datetime
    duration: Optional[int] = 30
    type: Optional[AppointmentType] = AppointmentType.routine
    weeks: Optional[int] = None
    note: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    """Création d'un rendez-vous par la patiente."""

    @field_validator("scheduled_at")
    @classmethod
    def must_be_future(cls, v: datetime) -> datetime:
        # Normalise en UTC si le datetime est naïf
        now = datetime.now(timezone.utc)
        v_aware = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        if v_aware <= now:
            raise ValueError("La date du rendez-vous doit être dans le futur")
        return v

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


class AppointmentUpdate(BaseModel):
    """Mise à jour partielle — tous les champs sont optionnels (PATCH sémantique)."""
    scheduled_at: Optional[datetime] = None
    duration: Optional[int] = None
    type: Optional[AppointmentType] = None
    weeks: Optional[int] = None
    note: Optional[str] = None

    @field_validator("scheduled_at")
    @classmethod
    def must_be_future(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is None:
            return v
        now = datetime.now(timezone.utc)
        v_aware = v if v.tzinfo else v.replace(tzinfo=timezone.utc)
        if v_aware <= now:
            raise ValueError("La date du rendez-vous doit être dans le futur")
        return v

    @field_validator("duration")
    @classmethod
    def duration_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (5 <= v <= 480):
            raise ValueError("La durée doit être comprise entre 5 et 480 minutes")
        return v


class AppointmentRead(AppointmentBase):
    id: int
    patient_id: int
    midwife_id: Optional[int] = None

    model_config = {"from_attributes": True}
