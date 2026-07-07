import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { Heart, User, Phone, MapPin, Baby } from "lucide-react";
import { patientService } from "../../api/patientService";

export function CreateProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", village: "",
    weeks: "", gravida: "1", para: "0",
    blood_type: "", dpa: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await patientService.createMe({
        name:       form.name,
        phone:      form.phone     || undefined,
        village:    form.village   || undefined,
        weeks:      form.weeks     ? Number(form.weeks)   : 0,
        gravida:    Number(form.gravida),
        para:       Number(form.para),
        blood_type: form.blood_type || undefined,
        dpa:        form.dpa        || undefined,
        risk:       "normal",
      } as Parameters<typeof patientService.createMe>[0]);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Erreur lors de la création du profil");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-3 text-sm bg-[#FFF9F5] border border-[#F2A7A7]/30 rounded-xl outline-none focus:ring-2 focus:ring-[#C96B4B]/20 focus:border-[#C96B4B] transition-all";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F5] via-[#F7C5A0]/20 to-[#F2A7A7]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B] flex items-center justify-center shadow-lg mb-3">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-['Playfair_Display'] text-gray-800">Yaay Booy</h1>
          <p className="text-sm text-gray-500 mt-1">Créer votre profil médical</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 space-y-4">

          {/* Nom */}
          <div>
            <label className={labelCls}>
              <User size={12} className="inline mr-1" /> Nom complet *
            </label>
            <input required type="text" className={inputCls}
              placeholder="Aminata Diallo"
              value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>

          {/* Téléphone */}
          <div>
            <label className={labelCls}>
              <Phone size={12} className="inline mr-1" /> Téléphone
            </label>
            <input type="tel" className={inputCls}
              placeholder="+221 77 123 45 67"
              value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>

          {/* Village */}
          <div>
            <label className={labelCls}>
              <MapPin size={12} className="inline mr-1" /> Village / Localité
            </label>
            <input type="text" className={inputCls}
              placeholder="Thiès"
              value={form.village} onChange={(e) => set("village", e.target.value)} />
          </div>

          {/* Semaines + DPA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Semaines (SA)</label>
              <input type="number" min="0" max="45" className={inputCls}
                placeholder="24"
                value={form.weeks} onChange={(e) => set("weeks", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>DPA</label>
              <input type="date" className={inputCls}
                value={form.dpa} onChange={(e) => set("dpa", e.target.value)} />
            </div>
          </div>

          {/* Gravida + Para */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                <Baby size={12} className="inline mr-1" /> Nb grossesses
              </label>
              <input type="number" min="0" className={inputCls}
                value={form.gravida} onChange={(e) => set("gravida", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Nb accouchements</label>
              <input type="number" min="0" className={inputCls}
                value={form.para} onChange={(e) => set("para", e.target.value)} />
            </div>
          </div>

          {/* Groupe sanguin */}
          <div>
            <label className={labelCls}>Groupe sanguin</label>
            <select className={inputCls}
              value={form.blood_type} onChange={(e) => set("blood_type", e.target.value)}>
              <option value="">— Sélectionner —</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60">
            {loading ? "Enregistrement…" : "Créer mon profil"}
          </button>
        </form>
      </div>
    </div>
  );
}
