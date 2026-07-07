import enum
from datetime import date as date_type
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Enum as SAEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.alert import Alert
    from app.models.appointment import Appointment
    from app.models.measurement import Measurement
    from app.models.baby_journal import BabyJournalEntry
    from app.models.consultation import Consultation
    from app.models.vaccination import Vaccination


class RiskLevel(str, enum.Enum):
    high = "high"
    watch = "watch"
    normal = "normal"


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[Optional[int]] = mapped_column(default=None)
    weeks: Mapped[int] = mapped_column(default=0)               # semaines d'aménorrhée
    dpa: Mapped[Optional[date_type]] = mapped_column(default=None)   # date prévue d'accouchement
    last_visit: Mapped[Optional[date_type]] = mapped_column(default=None)
    next_visit: Mapped[Optional[date_type]] = mapped_column(default=None)
    risk: Mapped[RiskLevel] = mapped_column(
        SAEnum(RiskLevel, name="risklevel", create_constraint=True),
        default=RiskLevel.normal,
    )
    blood_type: Mapped[Optional[str]] = mapped_column(String(5), default=None)
    phone: Mapped[Optional[str]] = mapped_column(String(20), default=None)
    village: Mapped[Optional[str]] = mapped_column(String(255), default=None)
    gravida: Mapped[int] = mapped_column(default=0)             # nb de grossesses totales
    para: Mapped[int] = mapped_column(default=0)                # nb d'accouchements
    photo: Mapped[Optional[str]] = mapped_column(String, default=None)  # initiales ou URL

    # ── Relations ──────────────────────────────────────────────────────────────
    user: Mapped["User"] = relationship("User", back_populates="patient_profile")
    alerts: Mapped[List["Alert"]] = relationship(
        "Alert", back_populates="patient", cascade="all, delete-orphan"
    )
    appointments: Mapped[List["Appointment"]] = relationship(
        "Appointment",
        back_populates="patient",
        foreign_keys="Appointment.patient_id",
        cascade="all, delete-orphan",
    )
    measurements: Mapped[List["Measurement"]] = relationship(
        "Measurement", back_populates="patient", cascade="all, delete-orphan"
    )
    baby_journal: Mapped[List["BabyJournalEntry"]] = relationship(
        "BabyJournalEntry", back_populates="patient", cascade="all, delete-orphan"
    )
    consultations: Mapped[List["Consultation"]] = relationship(
        "Consultation", back_populates="patient", cascade="all, delete-orphan"
    )
    vaccinations: Mapped[List["Vaccination"]] = relationship(
        "Vaccination", back_populates="patient", cascade="all, delete-orphan"
    )
