import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum as SAEnum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.patient import Patient


class AlertSeverity(str, enum.Enum):
    critical = "critical"
    high = "high"
    medium = "medium"
    resolved = "resolved"


class AlertCategory(str, enum.Enum):
    bp = "bp"
    glycemia = "glycemia"
    movement = "movement"
    weight = "weight"
    heartrate = "heartrate"
    other = "other"


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)

    weeks: Mapped[Optional[int]] = mapped_column(default=None)
    severity: Mapped[AlertSeverity] = mapped_column(
        SAEnum(AlertSeverity, name="alertseverity", create_constraint=True),
        nullable=False,
    )
    category: Mapped[AlertCategory] = mapped_column(
        SAEnum(AlertCategory, name="alertcategory", create_constraint=True),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[Optional[str]] = mapped_column(String(100), default=None)   # ex: "158/98 mmHg"
    normal: Mapped[Optional[str]] = mapped_column(String(100), default=None)  # ex: "< 140/90"
    time: Mapped[datetime] = mapped_column(server_default=func.now())
    note: Mapped[Optional[str]] = mapped_column(Text, default=None)
    resolved: Mapped[bool] = mapped_column(default=False)

    patient: Mapped["Patient"] = relationship("Patient", back_populates="alerts")
