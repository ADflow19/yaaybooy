import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { chatbotService, type ChatMessage } from "../../api/chatbotService";
import { useAuth } from "../../context/AuthContext";

// ── Couleurs selon le rôle ─────────────────────────────────────────────────────
function useTheme(role: string | null) {
  if (role === "sage_femme") {
    return {
      bubble:   "bg-primary text-white shadow-primary/30",
      header:   "bg-primary",
      userMsg:  "bg-primary text-white",
      assistantMsg: "bg-muted text-foreground",
      sendBtn:  "bg-primary hover:bg-primary/90",
      focusRing: "focus:ring-primary/30",
      dot:      "bg-primary",
      label:    "Yaay — Aide clinique",
    };
  }
  return {
    bubble:   "bg-gradient-to-br from-[#C96B4B] to-[#B07590] text-white shadow-[#C96B4B]/30",
    header:   "bg-gradient-to-r from-[#C96B4B] to-[#B07590]",
    userMsg:  "bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white",
    assistantMsg: "bg-[#FFF0EC] text-gray-800",
    sendBtn:  "bg-gradient-to-r from-[#C96B4B] to-[#B07590] hover:opacity-90",
    focusRing: "focus:ring-[#C96B4B]/30",
    dot:      "bg-[#C96B4B]",
    label:    "Yaay — Assistante grossesse",
  };
}

// ── Bulle d'un message ─────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  theme,
}: {
  msg: ChatMessage & { error?: boolean };
  theme: ReturnType<typeof useTheme>;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? "bg-gray-200" : theme.dot + " opacity-90"
      }`}>
        {isUser
          ? <User size={12} className="text-gray-500" />
          : <Bot size={12} className="text-white" />
        }
      </div>

      {/* Texte */}
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? theme.userMsg + " rounded-tr-sm"
            : msg.error
              ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm"
              : theme.assistantMsg + " rounded-tl-sm"
        }`}
      >
        {msg.error && <AlertCircle size={12} className="inline mr-1 mb-0.5" />}
        {msg.content}
      </div>
    </div>
  );
}

// ── Skeleton "en train de taper" ───────────────────────────────────────────────
function TypingIndicator({ theme }: { theme: ReturnType<typeof useTheme> }) {
  return (
    <div className="flex gap-2 flex-row">
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

// ── Widget principal ───────────────────────────────────────────────────────────
export function ChatbotWidget() {
  const { role, isAuthenticated } = useAuth();
  const theme = useTheme(role);

  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [typing,  setTyping]  = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<(ChatMessage & { error?: boolean })[]>([
    {
      role: "assistant",
      content: role === "sage_femme"
        ? "Bonjour ! Je suis Yaay, votre assistant clinique. Je peux vous aider à consulter des dossiers, synthétiser des alertes ou répondre à vos questions. Comment puis-je vous aider ?"
        : "Asalaam maleekum ! Je suis Yaay, votre assistante grossesse 🌸\nJe suis là pour répondre à vos questions sur la grossesse. Pour tout symptôme inquiétant, contactez toujours votre sage-femme.",
    },
  ]);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  const messagesRef  = useRef<HTMLDivElement>(null);

  // Scroll au dernier message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Focus input à l'ouverture
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  // Ne pas afficher si non authentifié
  if (!isAuthenticated) return null;

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || typing) return;

    setInput("");

    // Affiche le message utilisateur immédiatement
    const userMsg: ChatMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setTyping(true);

    try {
      const res = await chatbotService.sendMessage({
        message: text,
        conversation_history: history,
      });

      setHistory(res.conversation_history);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Je suis temporairement indisponible. Réessayez dans un instant.",
          error: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
            style={{ maxHeight: "min(520px, calc(100vh - 100px))" }}
          >
            {/* Header */}
            <div className={`${theme.header} px-4 py-3 flex items-center justify-between shrink-0`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold leading-tight">{theme.label}</p>
                  <p className="text-white/70 text-[10px]">En ligne</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                aria-label="Fermer le chat"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-white"
            >
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} theme={theme} />
              ))}
              {typing && <TypingIndicator theme={theme} />}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="shrink-0 px-3 py-3 border-t border-border bg-white flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Écrivez votre message…"
                disabled={typing}
                className={`flex-1 text-sm px-3 py-2 rounded-xl border border-border bg-[#FFF9F5] outline-none focus:ring-2 ${theme.focusRing} focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Message"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
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
            ? <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X size={22} />
              </motion.div>
            : <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle size={22} />
              </motion.div>
          }
        </AnimatePresence>
      </motion.button>
    </>
  );
}
