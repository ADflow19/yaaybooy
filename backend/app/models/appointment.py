import enum
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum as SAEnum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.patient import Patient
    from app.models.user import User


class AppointmentType(str, enum.Enum):
    routine = "routine"
    urgent = "urgent"
    birth = "birth"
    first = "first"


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)
    # Nullable : un RDV peut être créé par la patiente sans sage-femme assignée
    midwife_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), default=None)

    scheduled_at: Mapped[datetime] = mapped_column(nullable=False)
    duration: Mapped[int] = mapped_column(default=30)   # en minutes
    type: Mapped[AppointmentType] = mapped_column(
        SAEnum(AppointmentType, name="appointmenttype", create_constraint=True),
        default=AppointmentType.routine,
    )
    weeks: Mapped[Optional[int]] = mapped_column(default=None)
    note: Mapped[Optional[str]] = mapped_column(Text, default=None)

    patient: Mapped["Patient"] = relationship(
        "Patient", back_populates="appointments", foreign_keys=[patient_id]
    )
    midwife: Mapped[Optional["User"]] = relationship(
        "User", back_populates="midwife_appointments", foreign_keys=[midwife_id]
    )
