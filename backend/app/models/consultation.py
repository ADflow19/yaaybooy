import enum
from datetime import date as date_type, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum as SAEnum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.patient import Patient
    from app.models.user import User


class ConsultationType(str, enum.Enum):
    urgente = "Urgente"
    routine = "Routine"


class Consultation(Base):
    __tablename__ = "consultations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)
    # Sage-femme ayant rédigé la note (nullable si saisie rétroactive)
    midwife_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"), default=None)

    date: Mapped[date_type] = mapped_column(nullable=False)
    sa: Mapped[Optional[str]] = mapped_column(String(10), default=None)  # ex: "28 SA"
    type: Mapped[ConsultationType] = mapped_column(
        SAEnum(ConsultationType, name="consultationtype", create_constraint=True),
        default=ConsultationType.routine,
    )
    notes: Mapped[Optional[str]] = mapped_column(Text, default=None)
    provider: Mapped[Optional[str]] = mapped_column(String(255), default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    patient: Mapped["Patient"] = relationship("Patient", back_populates="consultations")
    # Navigation depuis user.consultations → toutes les notes rédigées par cette SF
    midwife: Mapped[Optional["User"]] = relationship(
        "User", back_populates="consultations", foreign_keys=[midwife_id]
    )
