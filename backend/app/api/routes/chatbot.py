from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.openai_client import openai_client
from app.db.session import get_db
from app.models.user import User
from app.services.chatbot_service import FALLBACK_NO_KEY, chat

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])


# ── Schémas ────────────────────────────────────────────────────────────────────

class ConversationMessage(BaseModel):
    """Un message dans l'historique de conversation."""
    role: str          # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    # Historique optionnel des échanges précédents (max 20 messages côté client)
    conversation_history: Optional[List[ConversationMessage]] = []


class ChatResponse(BaseModel):
    reply: str
    # Retourne l'historique mis à jour pour que le client puisse le conserver
    conversation_history: List[ConversationMessage]


# ── Endpoint ───────────────────────────────────────────────────────────────────

@router.post(
    "/message",
    response_model=ChatResponse,
    summary="Envoyer un message au chatbot IA",
    description=(
        "Accessible aux patientes et aux sages-femmes. "
        "Le comportement du modèle et les outils disponibles sont adaptés au rôle de l'utilisateur. "
        "Inclure `conversation_history` pour maintenir le contexte entre les messages."
    ),
)
async def send_message(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponse:
    """
    Traite un message utilisateur et retourne la réponse du modèle.
    La boucle tool → exécution → réponse est entièrement gérée côté serveur.
    """
    if openai_client is None:
        # Clé non configurée — service désactivé mais l'app reste opérationnelle
        return ChatResponse(
            reply=FALLBACK_NO_KEY,
            conversation_history=payload.conversation_history or [],
        )

    # Limite l'historique à 20 messages pour éviter de dépasser le context window
    history = [m.model_dump() for m in (payload.conversation_history or [])][-20:]

    reply = await chat(
        client=openai_client,
        user_message=payload.message.strip(),
        conversation_history=history,
        current_user=current_user,
        db=db,
    )

    # Construit l'historique mis à jour à retourner au client
    updated_history = history + [
        {"role": "user",      "content": payload.message},
        {"role": "assistant", "content": reply},
    ]

    return ChatResponse(
        reply=reply,
        conversation_history=[ConversationMessage(**m) for m in updated_history],
    )
