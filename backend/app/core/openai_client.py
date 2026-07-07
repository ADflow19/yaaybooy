"""
Client Groq partagé — instancié une seule fois au démarrage.
L'API Groq est compatible avec le SDK openai, mais on utilise
le SDK officiel groq pour éviter tout conflit de dépendances.
Si GROQ_API_KEY n'est pas définie, le client reste None et le endpoint
/api/chatbot/message retourne un message clair plutôt que de crasher.
"""
from typing import Optional
from groq import AsyncGroq
from app.core.config import settings

# Réexporté sous l'ancien nom pour ne pas casser chatbot.py
openai_client: Optional[AsyncGroq] = (
    AsyncGroq(api_key=settings.GROQ_API_KEY)
    if settings.GROQ_API_KEY
    else None
)
