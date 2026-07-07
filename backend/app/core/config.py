import json
from typing import List
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
    # Déclaré str pour que pydantic-settings ne tente pas de parser en JSON
    # avant le validator. Toutes ces formes sont acceptées dans .env :
    #   CORS_ORIGINS=http://localhost:5173
    #   CORS_ORIGINS=http://localhost:5173, https://monapp.com
    #   CORS_ORIGINS=["http://localhost:5173","https://monapp.com"]
    CORS_ORIGINS: str = "http://localhost:5173"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors(cls, v: object) -> str:
        """
        Normalise CORS_ORIGINS en une chaîne JSON ["url1","url2"].
        On stocke en str pour contourner le pré-parsing de pydantic-settings ;
        la propriété cors_origins_list expose la liste finale.
        """
        if isinstance(v, list):
            return json.dumps([o.strip() for o in v if str(o).strip()])
        if isinstance(v, str):
            stripped = v.strip()
            # Déjà une liste JSON
            if stripped.startswith("["):
                parsed = json.loads(stripped)
                return json.dumps([o.strip() for o in parsed if str(o).strip()])
            # Chaîne séparée par virgules
            items = [o.strip() for o in stripped.split(",") if o.strip()]
            return json.dumps(items)
        raise ValueError(f"Type inattendu pour CORS_ORIGINS : {type(v)}")

    @property
    def cors_origins_list(self) -> List[str]:
        """Liste des origines CORS prête à passer à CORSMiddleware."""
        return json.loads(self.CORS_ORIGINS)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
