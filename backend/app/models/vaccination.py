import enum
from datetime import date as date_type
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Enum as SAEnum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

if TYPE_CHECKING:
    from app.models.patient import Patient


class VaccinationStatus(str, enum.Enum):
    done = "done"
    upcoming = "upcoming"


class Vaccination(Base):
    __tablename__ = "vaccinations"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey("patients.id"), nullable=False)

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    date: Mapped[Optional[date_type]] = mapped_column(default=None)
    status: Mapped[VaccinationStatus] = mapped_column(
        SAEnum(VaccinationStatus, name="vaccinationstatus", create_constraint=True),
        default=VaccinationStatus.upcoming,
    )

    patient: Mapped["Patient"] = relationship("Patient", back_populates="vaccinations")
