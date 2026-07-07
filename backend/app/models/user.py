import enum
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Enum as SAEnum, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.patient import Patient
    from app.models.appointment import Appointment
    from app.models.consultation import Consultation


class UserRole(str, enum.Enum):
    patiente = "patiente"
    sage_femme = "sage_femme"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole, name="userrole", create_constraint=True),
        default=UserRole.patiente,
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    # Relation 1-1 : compte → profil patiente
    patient_profile: Mapped[Optional["Patient"]] = relationship(
        "Patient", back_populates="user", uselist=False
    )
    # Rendez-vous dont cette sage-femme est responsable
    midwife_appointments: Mapped[List["Appointment"]] = relationship(
        "Appointment",
        back_populates="midwife",
        foreign_keys="Appointment.midwife_id",
    )
    # Notes cliniques rédigées par cette sage-femme
    consultations: Mapped[List["Consultation"]] = relationship(
        "Consultation",
        back_populates="midwife",
        foreign_keys="Consultation.midwife_id",
    )
