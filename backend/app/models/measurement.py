import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum as SAEnum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.patient import Patient


class MeasurementType(str, enum.Enum):
    blood_pressure = "blood-pressure"
    heart_rate = "heart-rate"
    temperature = "temperature"
    baby_movements = "baby-movements"


class MeasurementStatus(str, enum.Enum):
    normal = "normal"
    warning = "warning"
    alert = "alert"


class Measurement(Base):
    __tablename__ = "measurements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)

    type: Mapped[MeasurementType] = mapped_column(
        SAEnum(MeasurementType, name="measurementtype", create_constraint=True),
        nullable=False,
    )
    value: Mapped[str] = mapped_column(String(100), nullable=False)  # ex: "120/80 mmHg"
    status: Mapped[MeasurementStatus] = mapped_column(
        SAEnum(MeasurementStatus, name="measurementstatus", create_constraint=True),
        nullable=False,
    )
    message: Mapped[Optional[str]] = mapped_column(String(255), default=None)
    shared_with_midwife: Mapped[bool] = mapped_column(default=False)
    recorded_at: Mapped[datetime] = mapped_column(server_default=func.now())

    patient: Mapped["Patient"] = relationship("Patient", back_populates="measurements")
