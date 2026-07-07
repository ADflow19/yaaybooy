from datetime import datetime
from typing import Optional

from pydantic import BaseModel, AnyHttpUrl, field_validator


class BabyJournalBase(BaseModel):
    title: str
    content: Optional[str] = None
    photo_url: Optional[AnyHttpUrl] = None
    weeks: Optional[int] = None


class BabyJournalCreate(BabyJournalBase):

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Le titre ne peut pas être vide")
        return v.strip()

    @field_validator("weeks")
    @classmethod
    def weeks_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (0 <= v <= 45):
            raise ValueError("Le nombre de semaines doit être compris entre 0 et 45")
        return v


class BabyJournalUpdate(BaseModel):
    """PATCH sémantique — tous les champs sont optionnels sans valeur par défaut."""
    title: Optional[str] = None
    content: Optional[str] = None
    photo_url: Optional[AnyHttpUrl] = None
    weeks: Optional[int] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Le titre ne peut pas être vide")
        return v.strip() if v else v

    @field_validator("weeks")
    @classmethod
    def weeks_range(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and not (0 <= v <= 45):
            raise ValueError("Le nombre de semaines doit être compris entre 0 et 45")
        return v


class BabyJournalRead(BabyJournalBase):
    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
