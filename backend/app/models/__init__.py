# Importer tous les modèles ici pour qu'Alembic les détecte via Base.metadata
from app.models.user import User
from app.models.patient import Patient
from app.models.alert import Alert
from app.models.appointment import Appointment
from app.models.measurement import Measurement
from app.models.baby_journal import BabyJournalEntry
from app.models.consultation import Consultation
from app.models.vaccination import Vaccination

__all__ = [
    "User",
    "Patient",
    "Alert",
    "Appointment",
    "Measurement",
    "BabyJournalEntry",
    "Consultation",
    "Vaccination",
]
