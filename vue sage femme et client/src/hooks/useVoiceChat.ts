/**
 * useVoiceChat — Reconnaissance et synthèse vocale via Web Speech API.
 *
 * Compatibilité :
 *   - Chrome Desktop/Android  : reconnaissance + synthèse ✅
 *   - Firefox Desktop         : synthèse ✅ / reconnaissance ❌
 *   - Safari macOS 17+        : synthèse ✅ / reconnaissance partielle ⚠️
 *   - Safari iOS              : synthèse ✅ / reconnaissance ❌
 */
import { useState, useEffect, useRef, useCallback } from "react";

// ── Détection lazy (évite les crashs au chargement si window n'est pas prêt) ──
function getSpeechRecognition() {
  if (typeof window === "undefined") return null;
  return (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition || null;
}

function getSynthesis() {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

export interface VoiceChatState {
  /** true si le micro est actif et écoute l'utilisateur */
  isListening:  boolean;
  /** true si le TTS est en train de lire une réponse */
  isSpeaking:   boolean;
  /** true si la synthèse vocale est activée par l'utilisateur */
  ttsEnabled:   boolean;
  /** true si ce navigateur supporte la reconnaissance vocale */
  sttSupported: boolean;
  /** true si ce navigateur supporte la synthèse vocale */
  ttsSupported: boolean;
  /** Message d'erreur de l'API vocale, null si aucune erreur */
  voiceError:   string | null;
  /** Texte transcrit en temps réel (interim) — pour affichage pendant l'écoute */
  interimText:  string;
}

export interface VoiceChatActions {
  /** Démarre l'écoute. Appelle onTranscript(text) quand la phrase est finale. */
  startListening: (onTranscript: (text: string) => void) => void;
  /** Arrête l'écoute manuellement */
  stopListening:  () => void;
  /** Lit text à voix haute. Annule la lecture en cours si besoin. */
  speak:          (text: string) => void;
  /** Arrête la lecture TTS en cours */
  stopSpeaking:   () => void;
  /** Active ou désactive la lecture automatique des réponses */
  toggleTts:      () => void;
  /** Efface le message d'erreur */
  clearVoiceError: () => void;
}

export function useVoiceChat(): VoiceChatState & VoiceChatActions {
  const [isListening,  setIsListening]  = useState(false);
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [ttsEnabled,   setTtsEnabled]   = useState(false);
  const [voiceError,   setVoiceError]   = useState<string | null>(null);
  const [interimText,  setInterimText]  = useState("");

  const recognitionRef  = useRef<any>(null);
  const onTranscriptRef = useRef<((text: string) => void) | null>(null);

  // Résout les APIs une fois (lazy, safe contre window undefined)
  const SpeechRecognitionAPI = getSpeechRecognition();
  const synthesisAPI         = getSynthesis();

  // ── Nettoyage à la destruction ─────────────────────────────────────────────
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      synthesisAPI?.cancel();
    };
  }, []);

  // ── Reconnaissance vocale ─────────────────────────────────────────────────
  const startListening = useCallback((onTranscript: (text: string) => void) => {
    if (!SpeechRecognitionAPI) {
      setVoiceError(
        "Reconnaissance vocale non disponible sur ce navigateur. " +
        "Utilisez Chrome ou Edge pour cette fonctionnalité."
      );
      return;
    }

    // Annule une session en cours si nécessaire
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang              = "fr-FR";
    recognition.continuous        = false;  // s'arrête après une phrase
    recognition.interimResults    = true;   // résultats partiels en temps réel
    recognition.maxAlternatives   = 1;

    onTranscriptRef.current = onTranscript;

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError(null);
      setInterimText("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final   = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }
      setInterimText(interim);
      if (final && onTranscriptRef.current) {
        setInterimText("");
        onTranscriptRef.current(final.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setInterimText("");
      switch (event.error) {
        case "not-allowed":
        case "permission-denied":
          setVoiceError("Accès au microphone refusé. Autorisez-le dans les paramètres du navigateur.");
          break;
        case "audio-capture":
          setVoiceError("Microphone introuvable ou indisponible. Vérifiez qu'un micro est branché et qu'aucune autre application ne l'utilise.");
          break;
        case "no-speech":
          setVoiceError("Aucune parole détectée. Parlez plus près du microphone.");
          break;
        case "network":
          setVoiceError("Erreur réseau pour la reconnaissance vocale. Vérifiez votre connexion.");
          break;
        case "aborted":
          // Arrêt volontaire — pas une erreur à afficher
          break;
        default:
          setVoiceError(`Erreur vocale : ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText("");
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText("");
  }, []);

  // ── Synthèse vocale ────────────────────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!synthesisAPI) return;

    // Annule toute lecture en cours
    synthesisAPI.cancel();

    // Nettoie le texte : retire les emojis et les astérisques markdown
    const cleanText = text
      .replace(/\p{Emoji}/gu, "")
      .replace(/\*+/g, "")
      .replace(/#{1,6}\s/g, "")
      .trim();

    if (!cleanText) return;

    const utterance  = new SpeechSynthesisUtterance(cleanText);
    utterance.lang   = "fr-FR";
    utterance.rate   = 0.95;   // légèrement plus lent pour la clarté
    utterance.pitch  = 1.0;
    utterance.volume = 1.0;

    // Sélectionne une voix française si disponible
    const voices = synthesisAPI.getVoices();
    const frVoice = voices.find((v) =>
      v.lang.startsWith("fr") && !v.name.toLowerCase().includes("compact")
    );
    if (frVoice) utterance.voice = frVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend   = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesisAPI.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    synthesisAPI?.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleTts = useCallback(() => {
    setTtsEnabled((v) => {
      if (v) synthesisAPI?.cancel(); // coupe la lecture si on désactive
      return !v;
    });
  }, []);

  const clearVoiceError = useCallback(() => setVoiceError(null), []);

  return {
    // state
    isListening,
    isSpeaking,
    ttsEnabled,
    sttSupported: !!SpeechRecognitionAPI,
    ttsSupported: !!synthesisAPI,
    voiceError,
    interimText,
    // actions
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleTts,
    clearVoiceError,
  };
}
