import {
  useState, useRef, useEffect, useCallback,
  type FormEvent, type KeyboardEvent,
} from "react";
import {
  MessageCircle, X, Send, Loader2, Bot, User,
  AlertCircle, Mic, MicOff, Volume2, VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { chatbotService, type ChatMessage } from "../../api/chatbotService";
import { useAuth } from "../../context/AuthContext";
import { useVoiceChat } from "../../hooks/useVoiceChat";

// ── Thème selon le rôle ────────────────────────────────────────────────────────
function useTheme(role: string | null) {
  if (role === "sage_femme") {
    return {
      bubble:       "bg-primary text-white shadow-primary/30",
      header:       "bg-primary",
      userMsg:      "bg-primary text-white",
      assistantMsg: "bg-muted text-foreground",
      sendBtn:      "bg-primary hover:bg-primary/90",
      focusRing:    "focus:ring-primary/30",
      dot:          "bg-primary",
      micActive:    "bg-red-500 hover:bg-red-600",
      micIdle:      "bg-primary/10 hover:bg-primary/20 text-primary",
      label:        "Yaay — Aide clinique",
    };
  }
  return {
    bubble:       "bg-gradient-to-br from-[#C96B4B] to-[#B07590] text-white shadow-[#C96B4B]/30",
    header:       "bg-gradient-to-r from-[#C96B4B] to-[#B07590]",
    userMsg:      "bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white",
    assistantMsg: "bg-[#FFF0EC] text-gray-800",
    sendBtn:      "bg-gradient-to-r from-[#C96B4B] to-[#B07590] hover:opacity-90",
    focusRing:    "focus:ring-[#C96B4B]/30",
    dot:          "bg-[#C96B4B]",
    micActive:    "bg-red-500 hover:bg-red-600",
    micIdle:      "bg-[#C96B4B]/10 hover:bg-[#C96B4B]/20 text-[#C96B4B]",
    label:        "Yaay — Assistante grossesse",
  };
}

// ── Bulle d'un message ─────────────────────────────────────────────────────────
function MessageBubble({
  msg, theme,
}: {
  msg: ChatMessage & { error?: boolean };
  theme: ReturnType<typeof useTheme>;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? "bg-gray-200" : theme.dot + " opacity-90"
      }`}>
        {isUser ? <User size={12} className="text-gray-500" /> : <Bot size={12} className="text-white" />}
      </div>
      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
        isUser
          ? theme.userMsg + " rounded-tr-sm"
          : msg.error
            ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm"
            : theme.assistantMsg + " rounded-tl-sm"
      }`}>
        {msg.error && <AlertCircle size={12} className="inline mr-1 mb-0.5" />}
        {msg.content}
      </div>
    </div>
  );
}

// ── Indicateur "en train de taper" ────────────────────────────────────────────
function TypingIndicator({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <div className="flex gap-2">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${theme.dot} opacity-90`}>
        <Bot size={12} className="text-white" />
      </div>
      <div className={`px-3 py-2.5 rounded-2xl rounded-tl-sm ${theme.assistantMsg}`}>
        <span className="flex gap-1 items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  );
}

// ── Indicateur d'écoute (animation onde) ─────────────────────────────────────
function ListeningIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium w-fit">
      <span className="relative flex w-2 h-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
        <span className="relative inline-flex rounded-full w-2 h-2 bg-red-500" />
      </span>
      Écoute en cours…
    </div>
  );
}

// ── Widget principal ───────────────────────────────────────────────────────────
export function ChatbotWidget() {
  const { role, isAuthenticated } = useAuth();
  const theme = useTheme(role);

  const [open,     setOpen]     = useState(false);
  const [input,    setInput]    = useState("");
  const [typing,   setTyping]   = useState(false);
  const [history,  setHistory]  = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<(ChatMessage & { error?: boolean })[]>([
    {
      role: "assistant",
      content: role === "sage_femme"
        ? "Bonjour ! Je suis Yaay, votre assistant clinique. Comment puis-je vous aider ?"
        : "Asalaam maleekum ! Je suis Yaay 🌸\nJe réponds à vos questions sur la grossesse. En cas de symptôme inquiétant, contactez votre sage-femme.",
    },
  ]);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const {
    isListening, isSpeaking, ttsEnabled,
    sttSupported, ttsSupported,
    voiceError, interimText,
    startListening, stopListening,
    speak, stopSpeaking, toggleTts,
    clearVoiceError,
  } = useVoiceChat();

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, isListening]);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // ── Envoi d'un message (texte ou transcription vocale) ─────────────────────
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setTyping(true);

    try {
      const res = await chatbotService.sendMessage({
        message: trimmed,
        conversation_history: history,
      });
      setHistory(res.conversation_history);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
      if (ttsEnabled && ttsSupported) speak(res.reply);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Je suis temporairement indisponible. Réessayez dans un instant.", error: true },
      ]);
    } finally {
      setTyping(false);
    }
  }, [typing, history, ttsEnabled, ttsSupported, speak]);

  // ── Guard : ne rien afficher si non authentifié (APRÈS tous les hooks) ──────
  if (!isAuthenticated) return null;

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  // ── Micro : bascule écoute / arrêt ────────────────────────────────────────
  function handleMicClick() {
    if (isListening) {
      stopListening();
    } else {
      startListening((transcript) => {
        // Affiche le transcript dans l'input puis envoie
        setInput(transcript);
        sendMessage(transcript);
      });
    }
  }

  return (
    <>
      {/* ── Fenêtre de chat ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-border bg-white"
            style={{ maxHeight: "min(540px, calc(100vh - 100px))" }}
          >
            {/* Header */}
            <div className={`${theme.header} px-4 py-3 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{theme.label}</p>
                  <p className="text-white/70 text-[10px]">
                    {isListening ? "🎙 Écoute…" : isSpeaking ? "🔊 Parle…" : "En ligne"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Bouton TTS — uniquement si supporté */}
                {ttsSupported && (
                  <button
                    onClick={isSpeaking ? stopSpeaking : toggleTts}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                      isSpeaking
                        ? "bg-white/30 hover:bg-white/40"
                        : ttsEnabled
                          ? "bg-white/20 hover:bg-white/30"
                          : "bg-white/10 hover:bg-white/20 opacity-60"
                    }`}
                    aria-label={isSpeaking ? "Arrêter la lecture" : ttsEnabled ? "Désactiver la voix" : "Activer la voix"}
                    title={isSpeaking ? "Arrêter" : ttsEnabled ? "Voix activée — cliquer pour désactiver" : "Activer la lecture vocale"}
                  >
                    {isSpeaking
                      ? <VolumeX size={13} className="text-white" />
                      : ttsEnabled
                        ? <Volume2 size={13} className="text-white" />
                        : <VolumeX size={13} className="text-white" />
                    }
                  </button>
                )}

                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                  aria-label="Fermer le chat"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            </div>

            {/* Bandeau info compatibilité STT */}
            {!sttSupported && (
              <div className="px-3 py-2 bg-amber-50 border-b border-amber-100 text-amber-700 text-[11px] flex items-start gap-1.5">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                <span>Reconnaissance vocale non disponible sur ce navigateur. Continuez en texte.</span>
              </div>
            )}

            {/* Erreur vocale (dismissable) */}
            <AnimatePresence>
              {voiceError && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-3 py-2 bg-red-50 border-b border-red-100 text-red-600 text-[11px] flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5">
                      <AlertCircle size={12} className="shrink-0 mt-0.5" />
                      <span>{voiceError}</span>
                    </div>
                    <button onClick={clearVoiceError} className="shrink-0 hover:opacity-70" aria-label="Fermer">
                      <X size={11} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-white">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} theme={theme} />
              ))}
              {typing && <TypingIndicator theme={theme} />}
              {isListening && (
                <div className="space-y-2">
                  <ListeningIndicator />
                  {interimText && (
                    <p className="text-xs text-muted-foreground italic px-1">{interimText}</p>
                  )}
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Zone de saisie */}
            <form
              onSubmit={handleSubmit}
              className="shrink-0 px-3 py-3 border-t border-border bg-white flex items-center gap-2"
            >
              {/* Bouton micro */}
              {sttSupported && (
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={typing}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    isListening
                      ? theme.micActive + " text-white animate-pulse"
                      : theme.micIdle
                  }`}
                  aria-label={isListening ? "Arrêter l'écoute" : "Parler"}
                  title={isListening ? "Cliquer pour arrêter" : "Cliquer pour parler"}
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              )}

              {/* Champ texte */}
              <input
                ref={inputRef}
                type="text"
                value={isListening ? interimText || "" : input}
                onChange={(e) => { if (!isListening) setInput(e.target.value); }}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Parlez…" : "Écrivez votre message…"}
                disabled={typing || isListening}
                className={`flex-1 text-sm px-3 py-2 rounded-xl border border-border bg-[#FFF9F5] outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isListening ? "italic text-muted-foreground" : ""
                }`}
                aria-label="Message"
              />

              {/* Bouton envoyer */}
              <button
                type="submit"
                disabled={(!input.trim() && !isListening) || typing || isListening}
                className={`${theme.sendBtn} w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0`}
                aria-label="Envoyer"
              >
                {typing
                  ? <Loader2 size={15} className="animate-spin" />
                  : <Send size={15} />
                }
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bouton flottant ── */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        className={`fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center ${theme.bubble} transition-shadow`}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat IA"}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="close"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={22} />
              </motion.div>
            : <motion.div key="open"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle size={22} />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </>
  );
}
