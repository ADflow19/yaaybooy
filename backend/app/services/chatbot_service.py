"""
Service chatbot — Groq (Llama 3) avec function calling.
L'API Groq est compatible avec le protocole OpenAI Chat Completions,
donc la logique de boucle tool_call reste identique.
"""
import json
import logging
from typing import Any

from groq import AsyncGroq
from groq import APIStatusError, APITimeoutError, APIConnectionError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.user import User, UserRole
from app.models.patient import Patient
from app.models.measurement import Measurement
from app.models.alert import Alert
from app.models.appointment import Appointment

logger = logging.getLogger(__name__)

# ── Prompts système ────────────────────────────────────────────────────────────

SYSTEM_PATIENTE = """Tu es Yaay, un assistant bienveillant dédié aux femmes enceintes.
Tu réponds en français, avec chaleur et empathie.

Règles strictes :
- Tu n'es PAS un médecin. Tu ne poses JAMAIS de diagnostic.
- Pour tout symptôme inquiétant (saignement, douleur intense, fièvre élevée, diminution des mouvements
  du bébé), tu recommandes TOUJOURS de contacter immédiatement la sage-femme ou les urgences.
- Tu peux expliquer des notions générales sur la grossesse, les trimestres, l'alimentation,
  les examens courants, mais tu restes dans les limites d'une information grand public.
- Si tu interroges les données de la patiente via tes outils, présente-les de manière simple
  et rassurante, sans alarmisme inutile.
- Sois concise : préfère 2-3 phrases claires à un long paragraphe."""

SYSTEM_SAGE_FEMME = """Tu es Yaay, un assistant clinique et administratif pour sages-femmes.
Tu réponds en français, avec un ton professionnel et précis.

Capacités :
- Aide à la synthèse des dossiers patients, interprétation de constantes, rappels de protocoles.
- Tu peux interroger les données des patientes via tes outils pour fournir des résumés ciblés.
- Pour les questions cliniques complexes, tu rappelles de consulter les référentiels HAS/OMS en vigueur.
- Tu ne génères jamais d'ordonnances ni de prescriptions.
- Si une donnée patient est hors norme, tu le signales clairement avec le seuil de référence."""

# ── Définitions des tools ──────────────────────────────────────────────────────

TOOLS_PATIENTE = [
    {
        "type": "function",
        "function": {
            "name": "get_my_measurements",
            "description": "Récupère les dernières mesures IoT de la patiente connectée "
                           "(tension artérielle, rythme cardiaque, température, mouvements fœtaux).",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_next_appointment",
            "description": "Retourne le prochain rendez-vous à venir de la patiente connectée.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_my_alerts",
            "description": "Retourne les alertes médicales actives (non résolues) de la patiente connectée.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
]

TOOLS_SAGE_FEMME = [
    {
        "type": "function",
        "function": {
            "name": "get_patient_summary",
            "description": "Retourne un résumé complet d'une patiente : profil, dernières mesures partagées, "
                           "alertes actives et prochain rendez-vous.",
            "parameters": {
                "type": "object",
                "properties": {
                    "patient_id": {
                        "type": "integer",
                        "description": "L'identifiant numérique de la patiente.",
                    }
                },
                "required": ["patient_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_active_alerts",
            "description": "Liste toutes les alertes médicales actives pour toutes les patientes, "
                           "triées par sévérité décroissante.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
]

# ── Exécution des tools ───────────────────────────────────────────────────────

def execute_tool_patiente(tool_name: str, tool_args: dict, current_user: User, db: Session) -> str:
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        return json.dumps({"error": "Profil patiente introuvable."})

    if tool_name == "get_my_measurements":
        rows = (
            db.query(Measurement)
            .filter(Measurement.patient_id == patient.id)
            .order_by(Measurement.recorded_at.desc())
            .limit(8).all()
        )
        data = [{"type": m.type.value, "value": m.value, "status": m.status.value,
                 "message": m.message, "recorded_at": str(m.recorded_at)} for m in rows]
        return json.dumps({"measurements": data} if data else {"message": "Aucune mesure enregistrée."})

    if tool_name == "get_my_next_appointment":
        from datetime import datetime, timezone
        appt = (
            db.query(Appointment)
            .filter(Appointment.patient_id == patient.id,
                    Appointment.scheduled_at >= datetime.now(timezone.utc))
            .order_by(Appointment.scheduled_at.asc()).first()
        )
        if not appt:
            return json.dumps({"message": "Aucun rendez-vous à venir."})
        return json.dumps({"type": appt.type.value, "scheduled_at": str(appt.scheduled_at),
                           "duration_minutes": appt.duration, "note": appt.note})

    if tool_name == "get_my_alerts":
        rows = (
            db.query(Alert)
            .filter(Alert.patient_id == patient.id, Alert.resolved == False)  # noqa: E712
            .order_by(Alert.time.desc()).all()
        )
        data = [{"title": a.title, "severity": a.severity.value, "category": a.category.value,
                 "value": a.value, "normal": a.normal, "note": a.note, "time": str(a.time)}
                for a in rows]
        return json.dumps({"alerts": data} if data else {"message": "Aucune alerte active."})

    return json.dumps({"error": f"Tool inconnu : {tool_name}"})


def execute_tool_sage_femme(tool_name: str, tool_args: dict, current_user: User, db: Session) -> str:
    if tool_name == "get_patient_summary":
        patient_id = tool_args.get("patient_id")
        if not patient_id:
            return json.dumps({"error": "patient_id manquant."})
        patient = db.get(Patient, int(patient_id))
        if not patient:
            return json.dumps({"error": "Patiente introuvable."})

        from datetime import datetime, timezone
        measurements = (
            db.query(Measurement)
            .filter(Measurement.patient_id == patient.id, Measurement.shared_with_midwife == True)  # noqa: E712
            .order_by(Measurement.recorded_at.desc()).limit(5).all()
        )
        active_alerts = (
            db.query(Alert)
            .filter(Alert.patient_id == patient.id, Alert.resolved == False)  # noqa: E712
            .order_by(Alert.time.desc()).all()
        )
        next_appt = (
            db.query(Appointment)
            .filter(Appointment.patient_id == patient.id,
                    Appointment.scheduled_at >= datetime.now(timezone.utc))
            .order_by(Appointment.scheduled_at.asc()).first()
        )
        return json.dumps({
            "patient": {"id": patient.id, "name": patient.name, "age": patient.age,
                        "weeks": patient.weeks, "risk": patient.risk.value,
                        "blood_type": patient.blood_type, "gravida": patient.gravida,
                        "para": patient.para, "dpa": str(patient.dpa) if patient.dpa else None},
            "recent_measurements": [{"type": m.type.value, "value": m.value,
                                      "status": m.status.value, "at": str(m.recorded_at)}
                                     for m in measurements],
            "active_alerts": [{"title": a.title, "severity": a.severity.value,
                                "value": a.value, "note": a.note} for a in active_alerts],
            "next_appointment": {"type": next_appt.type.value,
                                  "scheduled_at": str(next_appt.scheduled_at),
                                  "note": next_appt.note} if next_appt else None,
        })

    if tool_name == "list_active_alerts":
        rows = (
            db.query(Alert).filter(Alert.resolved == False)  # noqa: E712
            .order_by(Alert.time.desc()).all()
        )
        data = [{"patient_id": a.patient_id, "title": a.title, "severity": a.severity.value,
                 "value": a.value, "weeks": a.weeks, "time": str(a.time)} for a in rows]
        return json.dumps({"active_alerts": data} if data else {"message": "Aucune alerte active."})

    return json.dumps({"error": f"Tool inconnu : {tool_name}"})


# ── Messages de repli ─────────────────────────────────────────────────────────

FALLBACK_QUOTA   = "Le service IA est temporairement saturé (quota atteint). Réessayez dans quelques instants."
FALLBACK_TIMEOUT = "La réponse a pris trop de temps. Vérifiez votre connexion et réessayez."
FALLBACK_NETWORK = "Impossible de joindre le service IA. Vérifiez la connectivité réseau."
FALLBACK_NO_KEY  = "Le chatbot IA n'est pas configuré. Ajoutez GROQ_API_KEY dans les variables d'environnement."
FALLBACK_GENERIC = "Une erreur inattendue est survenue. Réessayez dans un moment."

MAX_TOOL_ROUNDS = 5


async def chat(
    client: AsyncGroq,
    user_message: str,
    conversation_history: list,
    current_user: User,
    db: Session,
) -> str:
    """
    Boucle principale : appel Groq → tool calls → exécution DB → réponse finale.
    Retourne toujours une str.
    """
    is_patiente   = current_user.role == UserRole.patiente
    system_prompt = SYSTEM_PATIENTE if is_patiente else SYSTEM_SAGE_FEMME
    tools         = TOOLS_PATIENTE  if is_patiente else TOOLS_SAGE_FEMME
    tool_executor = execute_tool_patiente if is_patiente else execute_tool_sage_femme

    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(conversation_history)
    messages.append({"role": "user", "content": user_message})

    try:
        for _round in range(MAX_TOOL_ROUNDS):
            response = await client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                tools=tools,
                tool_choice="auto",
                temperature=0.4,
                max_tokens=1024,
            )

            choice = response.choices[0]

            # Réponse texte finale
            if choice.finish_reason == "stop":
                return choice.message.content or ""

            # Tool calls demandés
            if choice.finish_reason == "tool_calls":
                assistant_msg = choice.message
                # Groq retourne un objet ChatCompletionMessage — on le sérialise pour messages[]
                messages.append({
                    "role": "assistant",
                    "content": assistant_msg.content or "",
                    "tool_calls": [
                        {
                            "id": tc.id,
                            "type": "function",
                            "function": {"name": tc.function.name, "arguments": tc.function.arguments},
                        }
                        for tc in (assistant_msg.tool_calls or [])
                    ],
                })

                for tc in (assistant_msg.tool_calls or []):
                    tool_name = tc.function.name
                    try:
                        tool_args = json.loads(tc.function.arguments or "{}")
                    except json.JSONDecodeError:
                        tool_args = {}

                    logger.info("Groq tool call: %s(%s) user=%s", tool_name, tool_args, current_user.id)
                    result = tool_executor(tool_name, tool_args, current_user, db)

                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": result,
                    })
                continue

            break  # finish_reason inattendu

        return "Je n'ai pas pu formuler une réponse complète. Veuillez reformuler votre question."

    except APIStatusError as e:
        if e.status_code == 429:
            logger.warning("Groq quota: %s", e)
            return FALLBACK_QUOTA
        if e.status_code in (500, 503):
            logger.error("Groq server error %d: %s", e.status_code, e)
            return FALLBACK_GENERIC
        logger.error("Groq APIStatusError %d: %s", e.status_code, e)
        return FALLBACK_GENERIC

    except APITimeoutError:
        logger.warning("Groq timeout user=%s", current_user.id)
        return FALLBACK_TIMEOUT

    except APIConnectionError:
        logger.error("Groq connexion impossible")
        return FALLBACK_NETWORK

    except Exception as e:
        logger.exception("Erreur inattendue chatbot: %s", e)
        return FALLBACK_GENERIC
