from datetime import date, datetime
from pydantic import BaseModel
from typing import Optional
from app.models.consultation import ConsultationType


class ConsultationBase(BaseModel):
    date: date
    sa: Optional[str] = None
    type: Optional[ConsultationType] = ConsultationType.routine
    notes: Optional[str] = None
    provider: Optional[str] = None


class ConsultationCreate(ConsultationBase):
    pass


class ConsultationUpdate(BaseModel):
    date: Optional[date] = None
    sa: Optional[str] = None
    type: Optional[ConsultationType] = None
    notes: Optional[str] = None
    provider: Optional[str] = None


class ConsultationRead(ConsultationBase):
    id: int
    patient_id: int
    created_at: datetime

    model_config = {"from_attributes": True}
