import { useState, type FormEvent } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { Syringe, Camera, Plus, BookOpen, X, Save } from "lucide-react";
import { motion } from "motion/react";
import { useApiCall } from "../../hooks/useApiCall";
import { patientService } from "../../api/patientService";
import { babyJournalService } from "../../api/babyJournalService";

// ── Modal : nouvelle note ─────────────────────────────────────────────────────
function NewNoteModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title,   setTitle]   = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Le titre est requis"); return; }
    setLoading(true); setError(null);
    try {
      await babyJournalService.create({ title: title.trim(), content: content.trim() || undefined });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Erreur lors de la création");
    } finally { setLoading(false); }
  }

  const inputCls = "w-full px-4 py-2.5 text-sm bg-[#FFF9F5] border border-[#F2A7A7]/30 rounded-xl outline-none focus:ring-2 focus:ring-[#C96B4B]/20 focus:border-[#C96B4B]";

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800">Nouvelle note</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Premier sourire ✨" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Contenu</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder="Décrivez ce moment…" rows={4}
              className={inputCls + " resize-none"} />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-xl">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-60">
              <Save size={14} />{loading ? "…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal : nouvelle photo (URL) ──────────────────────────────────────────────
function NewPhotoModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title,    setTitle]    = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Le titre est requis"); return; }
    if (!photoUrl.trim()) { setError("L'URL de la photo est requise"); return; }
    setLoading(true); setError(null);
    try {
      await babyJournalService.create({ title: title.trim(), photo_url: photoUrl.trim() });
      onCreated();
      onClose();
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Erreur lors de l'ajout");
    } finally { setLoading(false); }
  }

  const inputCls = "w-full px-4 py-2.5 text-sm bg-[#FFF9F5] border border-[#F2A7A7]/30 rounded-xl outline-none focus:ring-2 focus:ring-[#C96B4B]/20 focus:border-[#C96B4B]";

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800">Ajouter une photo</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Titre *</label>
            <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Première photo 📸" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">URL de la photo *</label>
            <input required type="url" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://…" className={inputCls} />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-xl">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-60">
              <Save size={14} />{loading ? "…" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BabyJournalPage() {
  const [activeTab,   setActiveTab]   = useState<"vaccinations" | "photos" | "notes">("vaccinations");
  const [showNote,    setShowNote]    = useState(false);
  const [showPhoto,   setShowPhoto]   = useState(false);

  const { data: patient } = useApiCall(() => patientService.getMe());
  const { data: entries, loading: journalLoading, error: journalError, refetch } =
    useApiCall(() => babyJournalService.list());

  const notes  = (entries ?? []).filter((e) => !e.photo_url);
  const photos = (entries ?? []).filter((e) => !!e.photo_url);

  const TAB_BTN = (tab: typeof activeTab, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
        activeTab === tab
          ? "bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white shadow-md"
          : "bg-white text-gray-600 border border-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="pb-8">
      <Header greeting="Journal de" name="Bébé" />

      {showNote  && <NewNoteModal  onClose={() => setShowNote(false)}  onCreated={refetch} />}
      {showPhoto && <NewPhotoModal onClose={() => setShowPhoto(false)} onCreated={refetch} />}

      <div className="max-w-4xl mx-auto px-8 mt-6 space-y-6">
        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card gradient className="text-center py-6">
            <div className="text-6xl mb-3">👶🏾</div>
            <h2 className="font-['Playfair_Display'] text-2xl text-gray-800 mb-1">
              {patient?.name ?? "Votre bébé"}
            </h2>
            <p className="text-sm text-gray-600">
              {patient?.dpa
                ? `DPA : ${new Date(patient.dpa).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
                : "Journal de suivi"}
            </p>
            {patient?.weeks != null && (
              <p className="text-xs text-[#C96B4B] font-semibold mt-2">{patient.weeks} semaines</p>
            )}
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex gap-2 mb-4">
            {TAB_BTN("vaccinations", "Vaccinations")}
            {TAB_BTN("photos", "Photos")}
            {TAB_BTN("notes", "Notes")}
          </div>

          {/* ── Vaccinations ── */}
          {activeTab === "vaccinations" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <Syringe size={20} className="text-[#C96B4B]" /> Carnet de vaccination
                  </h3>
                </div>
                <p className="text-sm text-gray-500 text-center py-4">
                  Les vaccinations seront visibles ici une fois saisies par votre sage-femme.
                </p>
              </Card>
            </motion.div>
          )}

          {/* ── Photos ── */}
          {activeTab === "photos" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <button
                onClick={() => setShowPhoto(true)}
                className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <Camera size={20} /> Ajouter une photo
              </button>

              {journalLoading && (
                <div className="grid grid-cols-2 gap-3 animate-pulse">
                  {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-square bg-gray-200 rounded-2xl" />)}
                </div>
              )}

              {!journalLoading && photos.length === 0 && (
                <Card className="text-center py-10">
                  <Camera size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">Aucune photo pour l'instant</p>
                </Card>
              )}

              {!journalLoading && photos.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((e) => (
                    <Card key={e.id} className="aspect-square overflow-hidden p-0">
                      <img src={e.photo_url!} alt={e.title} className="w-full h-full object-cover rounded-2xl" />
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Notes ── */}
          {activeTab === "notes" && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <button
                onClick={() => setShowNote(true)}
                className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
              >
                <Plus size={20} /> Ajouter une note
              </button>

              {journalLoading && (
                <div className="space-y-3 animate-pulse">
                  {[1, 2].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-2xl" />)}
                </div>
              )}

              {journalError && (
                <Card className="border-red-100 bg-red-50">
                  <p className="text-sm text-red-600">{journalError}</p>
                </Card>
              )}

              {!journalLoading && notes.length === 0 && !journalError && (
                <Card className="text-center py-10">
                  <BookOpen size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">Aucune note pour l'instant</p>
                  <p className="text-xs text-gray-400 mt-1">Commencez à écrire vos souvenirs ✨</p>
                </Card>
              )}

              {!journalLoading && notes.map((e) => (
                <Card key={e.id}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-gray-500">
                      {new Date(e.created_at).toLocaleString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <span className="text-xl">💕</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">{e.title}</p>
                  {e.content && <p className="text-sm text-gray-700">{e.content}</p>}
                </Card>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
