from datetime import date
from typing import Optional
from pydantic import BaseModel, field_validator
from app.models.patient import RiskLevel


class PatientBase(BaseModel):
    name: str
    age: Optional[int] = None
    weeks: Optional[int] = 0
    dpa: Optional[date] = None
    last_visit: Optional[date] = None
    next_visit: Optional[date] = None
    risk: Optional[RiskLevel] = RiskLevel.normal
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    gravida: Optional[int] = 0
    para: Optional[int] = 0
    photo: Optional[str] = None


class PatientCreate(PatientBase):
    """Tous les champs de PatientBase — name est requis à la création."""
    pass


class PatientUpdate(BaseModel):
    """
    Schéma PATCH : tous les champs sont Optional et sans valeur par défaut.
    Seuls les champs explicitement envoyés dans le body seront mis à jour
    grâce à model_dump(exclude_unset=True) dans le handler.
    """
    name: Optional[str] = None
    age: Optional[int] = None
    weeks: Optional[int] = None
    dpa: Optional[date] = None
    last_visit: Optional[date] = None
    next_visit: Optional[date] = None
    risk: Optional[RiskLevel] = None
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    village: Optional[str] = None
    gravida: Optional[int] = None
    para: Optional[int] = None
    photo: Optional[str] = None

    @field_validator("weeks")
    @classmethod
    def weeks_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (0 <= v <= 45):
            raise ValueError("Le nombre de semaines doit être compris entre 0 et 45")
        return v

    @field_validator("gravida", "para")
    @classmethod
    def non_negative(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("La valeur ne peut pas être négative")
        return v


class PatientRead(PatientBase):
    id: int
    user_id: int

    model_config = {"from_attributes": True}
