"""add jitsi_room_name to appointments

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-07-07

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "appointments",
        sa.Column("jitsi_room_name", sa.String(128), nullable=True, unique=True),
    )


def downgrade() -> None:
    op.drop_column("appointments", "jitsi_room_name")
