from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import auth, patient, measurements, alerts, appointments, baby_journal, midwife
from app.api.routes.chatbot import router as chatbot_router

app = FastAPI(
    title="Yaaybooy API",
    description="Backend suivi de grossesse — espace Patiente & Sage-femme",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(patient.router)
app.include_router(measurements.router)
app.include_router(alerts.router)
app.include_router(appointments.router)
app.include_router(baby_journal.router)
app.include_router(midwife.router)
app.include_router(chatbot_router)


@app.get("/", tags=["health"])
def health_check():
    return {"status": "ok", "service": "yaaybooy-api"}
