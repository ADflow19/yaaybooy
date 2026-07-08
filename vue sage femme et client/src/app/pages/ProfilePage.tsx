import { useState, type FormEvent } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/Card";
import { User, Phone, MapPin, Calendar, Languages, Bell, Download, ChevronRight, LogOut, X, Save } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useApiCall } from "../../hooks/useApiCall";
import { patientService } from "../../api/patientService";
import { measurementService } from "../../api/measurementService";
import { useAuth } from "../../context/AuthContext";

// ── Mini-modal d'édition d'un champ (texte, number, date, select) ────────────
function EditFieldModal({
  label, value, type = "text", options,
  onSave, onClose,
}: {
  label: string; value: string; type?: string;
  options?: string[];
  onSave: (v: string) => Promise<void>; onClose: () => void;
}) {
  const [val, setVal] = useState(value);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try { await onSave(val); onClose(); }
    catch (e: unknown) {
      setErr((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Erreur");
    }
    finally { setSaving(false); }
  }

  const inputCls = "w-full px-4 py-2.5 text-sm bg-[#FFF9F5] border border-[#F2A7A7]/30 rounded-xl outline-none focus:ring-2 focus:ring-[#C96B4B]/20 focus:border-[#C96B4B]";

  return (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Modifier : {label}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {options ? (
            <select value={val} onChange={(e) => setVal(e.target.value)} className={inputCls}>
              <option value="">— Sélectionner —</option>
              {options.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          ) : (
            <input
              type={type} value={val} onChange={(e) => setVal(e.target.value)}
              className={inputCls}
            />
          )}
          {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-xl">{err}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Annuler</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white text-sm font-semibold flex items-center justify-center gap-1 disabled:opacity-60">
              <Save size={14} /> {saving ? "…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { data: patient, refetch } = useApiCall(() => patientService.getMe());
  const { data: measurements } = useApiCall(() => measurementService.list());

  // Quel champ est en cours d'édition
  const [editing, setEditing] = useState<null | "name" | "phone" | "village" | "dpa" | "blood_type" | "age" | "weeks">(null);

  const trimester = patient
    ? patient.weeks <= 13 ? "1er Trimestre"
    : patient.weeks <= 26 ? "2ème Trimestre"
    : "3ème Trimestre"
    : "2ème Trimestre";

  const latestBp   = measurements?.find((m) => m.type === "blood-pressure");
  const latestHr   = measurements?.find((m) => m.type === "heart-rate");
  const latestTemp = measurements?.find((m) => m.type === "temperature");

  function handleLogout() { logout(); navigate("/login", { replace: true }); }

  async function saveField(
    field: "name" | "phone" | "village" | "dpa" | "blood_type" | "age" | "weeks",
    value: string
  ) {
    const parsed: Record<string, unknown> = {};
    if (field === "age" || field === "weeks") {
      parsed[field] = value ? Number(value) : undefined;
    } else {
      parsed[field] = value || undefined;
    }
    await patientService.updateMe(parsed as Parameters<typeof patientService.updateMe>[0]);
    refetch();
  }

  // Config des champs éditables — inclut blood_type, age, weeks
  const infoFields: {
    key: "name" | "phone" | "village" | "dpa" | "blood_type" | "age" | "weeks";
    icon: React.ElementType;
    label: string;
    value: string;
    type?: string;
    inputEl?: "select" | "input";
    options?: string[];
  }[] = [
    { key: "name",       icon: User,     label: "Nom complet",        value: patient?.name        ?? "",  type: "text" },
    { key: "phone",      icon: Phone,    label: "Téléphone",          value: patient?.phone       ?? "",  type: "tel" },
    { key: "village",    icon: MapPin,   label: "Village / Adresse",  value: patient?.village     ?? "",  type: "text" },
    { key: "dpa",        icon: Calendar, label: "Date prévue (DPA)",  value: patient?.dpa         ?? "",  type: "date" },
    {
      key: "blood_type", icon: User, label: "Groupe sanguin",
      value: patient?.blood_type ?? "",
      inputEl: "select",
      options: ["A+","A-","B+","B-","AB+","AB-","O+","O-"],
    },
    { key: "age",   icon: User, label: "Âge",           value: patient?.age   != null ? String(patient.age)   : "", type: "number" },
    { key: "weeks", icon: User, label: "Semaines (SA)",  value: patient?.weeks != null ? String(patient.weeks) : "", type: "number" },
  ];

  return (
    <div className="pb-8">
      <Header greeting="Mon" name="Profil" />

      {/* Modal d'édition */}
      {editing && (
        <EditFieldModal
          label={infoFields.find((f) => f.key === editing)!.label}
          value={infoFields.find((f) => f.key === editing)!.value}
          type={infoFields.find((f) => f.key === editing)!.type}
          options={infoFields.find((f) => f.key === editing)!.options}
          onSave={(v) => saveField(editing, v)}
          onClose={() => setEditing(null)}
        />
      )}

      <div className="max-w-4xl mx-auto px-8 mt-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card gradient className="text-center py-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B] rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg">
              👩🏾
            </div>
            <h2 className="font-['Playfair_Display'] text-2xl text-gray-800 mb-1">
              {patient?.name ?? user?.email ?? "—"}
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              {patient ? `${patient.weeks} semaines de grossesse` : "Profil à compléter"}
            </p>
            <span className="text-xs bg-[#C96B4B]/10 text-[#C96B4B] px-3 py-1 rounded-full font-semibold">{trimester}</span>
          </Card>
        </motion.div>

        {/* Informations personnelles — chaque item ouvre le modal d'édition */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-4">Informations Personnelles</h3>
          <div className="space-y-3">
            {infoFields.map(({ key, icon: Icon, label, value }) => (
              <Card
                key={key}
                className="flex items-center justify-between cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setEditing(key)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F2A7A7]/20 rounded-full flex items-center justify-center">
                    <Icon size={20} className="text-[#C96B4B]" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {value
                        ? (key === "dpa"
                          ? new Date(value).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                          : value)
                        : <span className="text-gray-400 font-normal">Non renseigné — cliquer pour modifier</span>}
                    </div>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Paramètres — informatifs uniquement pour l'instant */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-4">Paramètres</h3>
          <div className="space-y-3">
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F2A7A7]/20 rounded-full flex items-center justify-center">
                  <Languages size={20} className="text-[#C96B4B]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Langue</div>
                  <div className="text-sm font-semibold text-gray-800">Français / Wolof</div>
                </div>
              </div>
            </Card>

            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#F7C5A0]/20 rounded-full flex items-center justify-center">
                  <Bell size={20} className="text-[#C96B4B]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Notifications</div>
                  <div className="text-sm font-semibold text-gray-800">Activées</div>
                </div>
              </div>
              <div className="w-12 h-6 bg-gradient-to-r from-[#F2A7A7] to-[#C96B4B] rounded-full p-0.5">
                <div className="w-5 h-5 bg-white rounded-full ml-auto shadow-sm" />
              </div>
            </Card>

            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#B07590]/20 rounded-full flex items-center justify-center">
                  <Download size={20} className="text-[#B07590]" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Mode Offline</div>
                  <div className="text-sm font-semibold text-gray-800">Données synchronisées</div>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Historique des mesures */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="font-['Playfair_Display'] text-lg text-gray-800 mb-4">Historique des Mesures</h3>
          <Card>
            <div className="space-y-3">
              {[
                { label: "Dernière mesure de tension", value: latestBp?.value  ?? "Non mesuré" },
                { label: "Rythme cardiaque",           value: latestHr?.value  ?? "Non mesuré" },
                { label: "Température",                value: latestTemp?.value ?? "Non mesuré" },
              ].map(({ label, value }, i, arr) => (
                <div key={label} className={`flex items-center justify-between ${i < arr.length - 1 ? "pb-3 border-b border-gray-100" : ""}`}>
                  <div className="text-sm text-gray-600">{label}</div>
                  <div className="text-sm font-semibold text-gray-800">{value}</div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Déconnexion */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <button
            onClick={handleLogout}
            className="w-full bg-red-50 border border-red-100 text-red-600 py-3 rounded-2xl font-semibold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Se déconnecter
          </button>
        </motion.div>
      </div>
    </div>
  );
}
