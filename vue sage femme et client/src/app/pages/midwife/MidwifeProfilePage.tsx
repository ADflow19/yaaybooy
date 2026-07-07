import { useState } from "react";
import { useNavigate } from "react-router";
import {
  MapPin, Mail, Award, Clock,
  Edit2, Bell, Globe, Shield, ChevronRight, LogOut, X, Check,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const certifications = [
  { title: "Sage-femme d'État", org: "École Nationale de Sages-Femmes du Sénégal", year: "2016" },
  { title: "Spécialisation — Grossesses à haut risque", org: "CHU de Dakar", year: "2019" },
  { title: "Formation en télémédecine obstétricale", org: "OMS / Ministère de la Santé", year: "2022" },
];

const LANGUAGES = [
  { code: "fr", label: "Français" },
  { code: "wo", label: "Wolof" },
  { code: "ar", label: "Arabe" },
];

const HORAIRES_OPTIONS = [
  "Lun–Ven, 8h–17h",
  "Lun–Sam, 8h–17h",
  "Lun–Ven, 7h–15h",
  "Lun–Ven, 9h–18h",
  "24h/24 — Garde",
];

export function MidwifeProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ── État profil ────────────────────────────────────────────────────────────
  const [editingProfile, setEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState(
    user?.email?.split("@")[0] ?? "Sage-femme"
  );
  const [nameInput, setNameInput] = useState(displayName);

  // ── État paramètres ────────────────────────────────────────────────────────
  const [language, setLanguage]         = useState("fr");
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [horaire, setHoraire]           = useState("Lun–Ven, 8h–17h");

  // Quel modal de paramètre est ouvert
  const [openModal, setOpenModal] = useState<"langue" | "horaires" | "confidentialite" | "notifications" | null>(null);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  function handleLogout() { logout(); navigate("/login", { replace: true }); }

  function handleSaveName() {
    if (nameInput.trim()) setDisplayName(nameInput.trim());
    setEditingProfile(false);
    showToast("Nom mis à jour ✓");
  }

  function handleSaveLanguage(code: string) {
    setLanguage(code);
    setOpenModal(null);
    showToast(`Langue modifiée : ${LANGUAGES.find((l) => l.code === code)?.label} ✓`);
  }

  function handleSaveHoraire(h: string) {
    setHoraire(h);
    setOpenModal(null);
    showToast("Horaires mis à jour ✓");
  }

  function toggleNotif() {
    setNotifEnabled((v) => !v);
    showToast(notifEnabled ? "Notifications désactivées" : "Notifications activées ✓");
    setOpenModal(null);
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const emailInitials = displayName
    .split(/[._\s-]/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || "SF";

  const currentLangLabel = LANGUAGES.find((l) => l.code === language)?.label ?? "Français";

  const settingsItems = [
    {
      icon: Bell,   label: "Notifications",
      desc: notifEnabled ? "Alertes temps réel activées" : "Notifications désactivées",
      action: notifEnabled ? "Désactiver" : "Activer",
      onClick: () => setOpenModal("notifications"),
    },
    {
      icon: Globe,  label: "Langue",
      desc: currentLangLabel,
      action: "Modifier",
      onClick: () => setOpenModal("langue"),
    },
    {
      icon: Shield, label: "Confidentialité",
      desc: "Données patients chiffrées",
      action: "Voir",
      onClick: () => setOpenModal("confidentialite"),
    },
    {
      icon: Clock,  label: "Horaires de travail",
      desc: horaire,
      action: "Modifier",
      onClick: () => setOpenModal("horaires"),
    },
  ];

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-5">

      {/* ── Toast ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-xs font-medium px-4 py-2.5 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* ── Modal : édition du profil ── */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setEditingProfile(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Modifier le profil</h3>
              <button onClick={() => setEditingProfile(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nom affiché</label>
                <input
                  type="text" value={nameInput} autoFocus
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  className="w-full px-4 py-2.5 text-sm bg-white border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Email</label>
                <input type="text" value={user?.email ?? ""} disabled
                  className="w-full px-4 py-2.5 text-sm bg-muted border border-border rounded-xl text-muted-foreground cursor-not-allowed" />
                <p className="text-[10px] text-muted-foreground mt-1">L'email ne peut pas être modifié ici.</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setEditingProfile(false)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                Annuler
              </button>
              <button onClick={handleSaveName}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1">
                <Check size={14} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal : sélection de langue ── */}
      {openModal === "langue" && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Choisir la langue</h3>
              <button onClick={() => setOpenModal(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSaveLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    language === lang.code
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {lang.label}
                  {language === lang.code && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal : horaires ── */}
      {openModal === "horaires" && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Horaires de travail</h3>
              <button onClick={() => setOpenModal(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-2">
              {HORAIRES_OPTIONS.map((h) => (
                <button
                  key={h}
                  onClick={() => handleSaveHoraire(h)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                    horaire === h
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-foreground border-border hover:bg-muted"
                  }`}
                >
                  {h}
                  {horaire === h && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal : notifications ── */}
      {openModal === "notifications" && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Notifications</h3>
              <button onClick={() => setOpenModal(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {notifEnabled
                ? "Les alertes en temps réel sont actuellement activées."
                : "Les notifications sont désactivées. Vous ne recevrez pas d'alertes."}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setOpenModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">
                Annuler
              </button>
              <button onClick={toggleNotif}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors ${
                  notifEnabled ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"
                }`}>
                {notifEnabled ? "Désactiver" : "Activer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal : confidentialité ── */}
      {openModal === "confidentialite" && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setOpenModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-foreground">Confidentialité</h3>
              <button onClick={() => setOpenModal(null)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><Check size={14} className="text-primary mt-0.5 shrink-0" /> Données patients chiffrées en transit (HTTPS)</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-primary mt-0.5 shrink-0" /> Authentification par token JWT</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-primary mt-0.5 shrink-0" /> Accès limité à vos propres patientes</li>
              <li className="flex items-start gap-2"><Check size={14} className="text-primary mt-0.5 shrink-0" /> Session expirée après 60 minutes d'inactivité</li>
            </ul>
            <button onClick={() => setOpenModal(null)}
              className="w-full mt-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-serif font-semibold text-foreground">Mon Profil</h1>
        <button
          onClick={() => { setNameInput(displayName); setEditingProfile(true); }}
          className="flex items-center gap-1.5 border border-border bg-white text-sm text-foreground px-3 py-2 rounded-xl hover:bg-muted transition-colors"
        >
          <Edit2 size={13} /> Modifier
        </button>
      </div>

      {/* ── Profile card ── */}
      <div className="bg-gradient-to-br from-[#F7C5A0]/30 to-[#F2A7A7]/20 rounded-2xl border border-[#F7C5A0]/40 p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F7C5A0] flex items-center justify-center text-xl font-bold text-[#C96B4B] shrink-0">
            {emailInitials}
          </div>
          <div>
            <h2 className="text-lg font-serif font-bold text-foreground">{displayName}</h2>
            <p className="text-sm text-muted-foreground">Sage-femme certifiée</p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin size={11} className="text-primary" />
              Centre de Santé
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
            <Mail size={13} className="text-primary shrink-0" />
            <span className="truncate">{user?.email ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={13} className="text-primary" />
            <span>{horaire}</span>
          </div>
        </div>
      </div>

      {/* ── Certifications ── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
          <Award size={15} className="text-primary" />
          <h2 className="text-sm font-semibold text-foreground font-serif">Certifications & Formations</h2>
        </div>
        <div className="divide-y divide-border">
          {certifications.map((cert) => (
            <div key={cert.title} className="px-5 py-3.5">
              <p className="text-sm font-semibold text-foreground">{cert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{cert.org}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-0.5">{cert.year}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Paramètres ── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground font-serif">Paramètres</h2>
        </div>
        <div className="divide-y divide-border">
          {settingsItems.map((s) => (
            <button
              key={s.label}
              onClick={s.onClick}
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <s.icon size={14} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                {s.action} <ChevronRight size={12} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Déconnexion ── */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 bg-red-50 border border-red-100 text-red-600 py-3 rounded-2xl font-semibold text-sm hover:bg-red-100 transition-colors"
      >
        <LogOut size={16} /> Se déconnecter
      </button>
    </div>
  );
}
