from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from app.models.alert import AlertSeverity, AlertCategory


class AlertBase(BaseModel):
    weeks: Optional[int] = None
    severity: AlertSeverity
    category: AlertCategory
    title: str
    value: Optional[str] = None
    normal: Optional[str] = None
    note: Optional[str] = None


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    resolved: Optional[bool] = None
    note: Optional[str] = None
    severity: Optional[AlertSeverity] = None


class AlertRead(AlertBase):
    id: int
    patient_id: int
    time: datetime
    resolved: bool

    model_config = {"from_attributes": True}
