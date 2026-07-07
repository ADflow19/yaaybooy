import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Ajouter le dossier backend au path pour que les imports app.* fonctionnent
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# ── 1. Config applicative ──────────────────────────────────────────────────────
from app.core.config import settings

# ── 2. Base déclarative ────────────────────────────────────────────────────────
from app.db.session import Base

# ── 3. Tous les modèles — DOIT être fait avant d'accéder à Base.metadata ───────
# L'import de chaque classe enregistre la table dans Base.metadata.
# Sans ces imports, autogenerate ne voit aucune table et génère des migrations vides.
from app.models.user import User  # noqa: F401
from app.models.patient import Patient  # noqa: F401
from app.models.alert import Alert  # noqa: F401
from app.models.appointment import Appointment  # noqa: F401
from app.models.measurement import Measurement  # noqa: F401
from app.models.baby_journal import BabyJournalEntry  # noqa: F401
from app.models.consultation import Consultation  # noqa: F401
from app.models.vaccination import Vaccination  # noqa: F401

# ── 4. Config Alembic ──────────────────────────────────────────────────────────
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Surcharge de l'URL depuis les settings (ignore la valeur placeholder dans alembic.ini)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Base.metadata contient maintenant toutes les tables grâce aux imports ci-dessus
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Génère le SQL sans connexion active (utile pour revue ou dry-run)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Applique les migrations sur une connexion active."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
