import json
from typing import List, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ── Base de données ───────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:5173"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: object) -> str:
        if isinstance(v, list):
            return json.dumps([o.strip() for o in v if str(o).strip()])
        if isinstance(v, str):
            stripped = v.strip()
            if stripped.startswith("["):
                parsed = json.loads(stripped)
                return json.dumps([o.strip() for o in parsed if str(o).strip()])
            items = [o.strip() for o in stripped.split(",") if o.strip()]
            return json.dumps(items)
        raise ValueError(f"Type inattendu pour CORS_ORIGINS : {type(v)}")

    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    # ── Groq (chatbot IA — tier gratuit) ─────────────────────────────────────
    # Obtenir sur https://console.groq.com/keys
    # Laisser vide pour désactiver le chatbot sans erreur au démarrage
    GROQ_API_KEY: Optional[str] = None
    # Modèle Groq — llama-3.3-70b-versatile recommandé (rapide + gratuit)
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
