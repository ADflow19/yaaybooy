from datetime import date
from pydantic import BaseModel
from typing import Optional
from app.models.vaccination import VaccinationStatus


class VaccinationBase(BaseModel):
    name: str
    date: Optional[date] = None
    status: Optional[VaccinationStatus] = VaccinationStatus.upcoming


class VaccinationCreate(VaccinationBase):
    pass


class VaccinationUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
    status: Optional[VaccinationStatus] = None


class VaccinationRead(VaccinationBase):
    id: int
    patient_id: int

    model_config = {"from_attributes": True}
