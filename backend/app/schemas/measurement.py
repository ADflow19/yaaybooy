from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from app.models.measurement import MeasurementType, MeasurementStatus
from app.schemas.alert import AlertRead


class MeasurementBase(BaseModel):
    type: MeasurementType
    value: str
    status: MeasurementStatus
    message: Optional[str] = None


class MeasurementCreate(MeasurementBase):
    pass


class MeasurementRead(MeasurementBase):
    id: int
    patient_id: int
    shared_with_midwife: bool
    recorded_at: datetime

    model_config = {"from_attributes": True}


class MeasurementSharedRead(MeasurementRead):
    """Réponse enrichie du endpoint /share : inclut l'alerte créée si status=alert."""
    alert_created: Optional[AlertRead] = None
