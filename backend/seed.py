"""
Script de seed — insère des données de test pour pouvoir tester la vue sage-femme.
Usage : docker-compose exec api python seed.py

Ce script est idempotent : il vérifie l'existence avant d'insérer.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from datetime import date, datetime, timedelta, timezone
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.models.patient import Patient, RiskLevel
from app.models.alert import Alert, AlertSeverity, AlertCategory
from app.models.appointment import Appointment, AppointmentType
from app.models.measurement import Measurement, MeasurementType, MeasurementStatus
from app.models.consultation import Consultation, ConsultationType
from app.models.vaccination import Vaccination, VaccinationStatus
from app.core.security import hash_password

db = SessionLocal()

# ── Sage-femme ─────────────────────────────────────────────────────────────────
sf_email = "sagefemme@test.com"
sf = db.query(User).filter(User.email == sf_email).first()
if not sf:
    sf = User(
        email=sf_email,
        hashed_password=hash_password("password123"),
        role=UserRole.sage_femme,
    )
    db.add(sf)
    db.flush()
    print(f"✅ Sage-femme créée : {sf_email} / password123")
else:
    print(f"ℹ️  Sage-femme déjà existante : {sf_email}")

# ── Patientes ──────────────────────────────────────────────────────────────────
patients_data = [
    dict(email="fatou@test.com",   name="Fatou Diallo",   age=28, weeks=32, risk=RiskLevel.normal, blood_type="A+",  phone="+221 77 123 45 67", village="Thiès",     gravida=2, para=1, dpa=date(2025, 8, 12)),
    dict(email="rokhaya@test.com", name="Rokhaya Ndiaye", age=34, weeks=36, risk=RiskLevel.high,   blood_type="O-",  phone="+221 76 234 56 78", village="Mbour",     gravida=3, para=2, dpa=date(2025, 7, 21)),
    dict(email="mariama@test.com", name="Mariama Sow",    age=24, weeks=28, risk=RiskLevel.normal, blood_type="B+",  phone="+221 70 345 67 89", village="Thiès",     gravida=1, para=0, dpa=date(2025, 9, 14)),
    dict(email="ndeye@test.com",   name="Ndèye Diop",     age=31, weeks=38, risk=RiskLevel.watch,  blood_type="AB+", phone="+221 78 456 78 90", village="Tivaouane", gravida=4, para=3, dpa=date(2025, 6, 26)),
    dict(email="adja@test.com",    name="Adja Mbaye",     age=22, weeks=20, risk=RiskLevel.normal, blood_type="A+",  phone="+221 77 567 89 01", village="Thiès",     gravida=1, para=0, dpa=date(2025, 11, 5)),
]

created_patients = []
for pd in patients_data:
    email = pd.pop("email")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            hashed_password=hash_password("password123"),
            role=UserRole.patiente,
        )
        db.add(user)
        db.flush()

    patient = db.query(Patient).filter(Patient.user_id == user.id).first()
    if not patient:
        patient = Patient(user_id=user.id, **pd)
        db.add(patient)
        db.flush()
        print(f"✅ Patiente créée : {email}")
    else:
        print(f"ℹ️  Patiente déjà existante : {email}")

    created_patients.append(patient)

db.commit()

# Refresh pour avoir les IDs
for p in created_patients:
    db.refresh(p)

fatou, rokhaya, mariama, ndeye, adja = created_patients

# ── Mesures (partagées avec la sage-femme) ─────────────────────────────────────
measurements_to_add = [
    Measurement(patient_id=rokhaya.id, type=MeasurementType.blood_pressure, value="158/98 mmHg", status=MeasurementStatus.alert,   message="Hypertension sévère", shared_with_midwife=True),
    Measurement(patient_id=rokhaya.id, type=MeasurementType.heart_rate,     value="92 bpm",      status=MeasurementStatus.normal,  message="Rythme stable",       shared_with_midwife=True),
    Measurement(patient_id=fatou.id,   type=MeasurementType.blood_pressure, value="118/76 mmHg", status=MeasurementStatus.normal,  message="Tension normale",     shared_with_midwife=True),
    Measurement(patient_id=ndeye.id,   type=MeasurementType.baby_movements, value="4 mouvements",status=MeasurementStatus.alert,   message="Mouvements réduits",  shared_with_midwife=True),
]
if not db.query(Measurement).filter(Measurement.patient_id == rokhaya.id).first():
    for m in measurements_to_add:
        db.add(m)
    print("✅ Mesures IoT créées")

# ── Alertes ────────────────────────────────────────────────────────────────────
if not db.query(Alert).filter(Alert.patient_id == rokhaya.id).first():
    db.add(Alert(
        patient_id=rokhaya.id, weeks=36,
        severity=AlertSeverity.critical, category=AlertCategory.bp,
        title="Hypertension sévère", value="158/98 mmHg", normal="< 140/90",
        note="Protéinurie +2. Pré-éclampsie suspectée. Hospitalisation recommandée.",
        resolved=False,
    ))
    db.add(Alert(
        patient_id=ndeye.id, weeks=38,
        severity=AlertSeverity.high, category=AlertCategory.movement,
        title="Mouvements fœtaux réduits", value="< 10 mouvements / 12h", normal="> 10 mouvements",
        note="La patiente signale une baisse des mouvements depuis hier soir.",
        resolved=False,
    ))
    db.add(Alert(
        patient_id=mariama.id, weeks=28,
        severity=AlertSeverity.medium, category=AlertCategory.weight,
        title="Prise de poids rapide", value="+3.2 kg / 2 sem.", normal="< 1 kg / sem.",
        note="Oedèmes aux chevilles. Surveillance accrue recommandée.",
        resolved=False,
    ))
    print("✅ Alertes créées")

# ── Rendez-vous ────────────────────────────────────────────────────────────────
today = datetime.now(timezone.utc)
if not db.query(Appointment).filter(Appointment.midwife_id == sf.id).first():
    appts = [
        Appointment(patient_id=fatou.id,   midwife_id=sf.id, scheduled_at=today + timedelta(days=2, hours=1),  duration=30, type=AppointmentType.routine, weeks=32),
        Appointment(patient_id=mariama.id,  midwife_id=sf.id, scheduled_at=today + timedelta(days=3, hours=2),  duration=45, type=AppointmentType.routine, weeks=28),
        Appointment(patient_id=rokhaya.id,  midwife_id=sf.id, scheduled_at=today + timedelta(days=1, hours=3),  duration=30, type=AppointmentType.urgent,  weeks=36, note="TA élevée à surveiller"),
        Appointment(patient_id=ndeye.id,    midwife_id=sf.id, scheduled_at=today + timedelta(hours=4),          duration=60, type=AppointmentType.birth,   weeks=38, note="DPA imminente"),
        Appointment(patient_id=adja.id,     midwife_id=sf.id, scheduled_at=today + timedelta(days=7, hours=2),  duration=45, type=AppointmentType.first,   weeks=20),
    ]
    for a in appts:
        db.add(a)
    print("✅ Rendez-vous créés")

# ── Notes cliniques ────────────────────────────────────────────────────────────
if not db.query(Consultation).filter(Consultation.patient_id == rokhaya.id).first():
    db.add(Consultation(
        patient_id=rokhaya.id, midwife_id=sf.id,
        date=date.today() - timedelta(days=14), sa="34 SA", type=ConsultationType.routine,
        notes="Bonne présentation fœtale. BCF 148 bpm. TA 132/84. Prise de poids normale.",
        provider="Sage-femme de test",
    ))
    db.add(Consultation(
        patient_id=rokhaya.id, midwife_id=sf.id,
        date=date.today() - timedelta(days=1), sa="36 SA", type=ConsultationType.urgente,
        notes="TA 158/98 mmHg. Protéinurie +2. Suspicion pré-éclampsie. Hospitalisation recommandée.",
        provider="Sage-femme de test",
    ))
    print("✅ Notes cliniques créées")

# ── Vaccinations ───────────────────────────────────────────────────────────────
if not db.query(Vaccination).filter(Vaccination.patient_id == fatou.id).first():
    db.add(Vaccination(patient_id=fatou.id, name="BCG",           date=date.today() - timedelta(days=60),  status=VaccinationStatus.done))
    db.add(Vaccination(patient_id=fatou.id, name="Polio 1",       date=date.today() - timedelta(days=30),  status=VaccinationStatus.done))
    db.add(Vaccination(patient_id=fatou.id, name="Pentavalent 1", date=date.today() - timedelta(days=30),  status=VaccinationStatus.done))
    db.add(Vaccination(patient_id=fatou.id, name="Polio 2",       date=date.today() + timedelta(days=15),  status=VaccinationStatus.upcoming))
    print("✅ Vaccinations créées")

db.commit()
db.close()

print("\n🎉 Seed terminé !")
print("\nComptes disponibles :")
print("  Sage-femme : sagefemme@test.com / password123")
print("  Patiente 1 : fatou@test.com     / password123  (32 SA, normal)")
print("  Patiente 2 : rokhaya@test.com   / password123  (36 SA, risque élevé ⚠️)")
print("  Patiente 3 : mariama@test.com   / password123  (28 SA, normal)")
print("  Patiente 4 : ndeye@test.com     / password123  (38 SA, à surveiller)")
print("  Patiente 5 : adja@test.com      / password123  (20 SA, normal)")
