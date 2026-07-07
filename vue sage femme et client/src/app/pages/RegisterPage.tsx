import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../api/authService";
import type { UserRole } from "../../api/types";
import { Heart, Eye, EyeOff } from "lucide-react";

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("patiente");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setLoading(true);
    try {
      await authService.register({ email, password, role });
      // Connecte immédiatement après l'inscription
      await login(email, password);
      navigate(role === "sage_femme" ? "/sage-femme" : "/", { replace: true });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F5] via-[#F7C5A0]/20 to-[#F2A7A7]/10 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F2A7A7] to-[#C96B4B] flex items-center justify-center shadow-lg mb-3">
            <Heart size={28} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-['Playfair_Display'] text-gray-800">Yaay Booy</h1>
          <p className="text-sm text-gray-500 mt-1">Créer votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 space-y-4">
          {/* Rôle */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Je suis…</label>
            <div className="grid grid-cols-2 gap-2">
              {(["patiente", "sage_femme"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                    role === r
                      ? "bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white border-transparent shadow-sm"
                      : "bg-[#FFF9F5] text-gray-600 border-[#F2A7A7]/30"
                  }`}
                >
                  {r === "patiente" ? "Patiente" : "Sage-femme"}
                </button>
              ))}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              className="w-full px-4 py-3 text-sm bg-[#FFF9F5] border border-[#F2A7A7]/30 rounded-xl outline-none focus:ring-2 focus:ring-[#C96B4B]/20 focus:border-[#C96B4B] transition-all"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Mot de passe <span className="text-gray-400 font-normal">(8 caractères min.)</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 text-sm bg-[#FFF9F5] border border-[#F2A7A7]/30 rounded-xl outline-none focus:ring-2 focus:ring-[#C96B4B]/20 focus:border-[#C96B4B] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPwd ? "Masquer" : "Afficher"}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#C96B4B] to-[#B07590] text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Création du compte…" : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-[#C96B4B] font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
