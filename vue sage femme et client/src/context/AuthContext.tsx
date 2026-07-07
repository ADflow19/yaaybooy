import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "../api/authService";
import type { UserRead, UserRole } from "../api/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  /** Utilisateur connecté, null si non authentifié, undefined pendant le chargement initial. */
  user: UserRead | null | undefined;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Authentifie l'utilisateur et persiste le token dans sessionStorage. */
  login: (email: string, password: string) => Promise<void>;
  /** Supprime le token et réinitialise l'état. */
  logout: () => void;
}

// ─── Contexte ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRead | null | undefined>(undefined); // undefined = init
  const [token, setToken] = useState<string | null>(
    () => sessionStorage.getItem("access_token")
  );
  const [isLoading, setIsLoading] = useState(true);

  // Au montage : si un token est déjà présent, vérifie qu'il est encore valide
  useEffect(() => {
    const stored = sessionStorage.getItem("access_token");
    if (!stored) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    authService
      .me()
      .then((u) => {
        setUser(u);
        // Rafraîchit le cache localStorage au cas où il serait désynchronisé
        sessionStorage.setItem("user", JSON.stringify(u));
      })
      .catch(() => {
        // Token invalide ou expiré
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("user");
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const tokenData = await authService.login(email, password);
    sessionStorage.setItem("access_token", tokenData.access_token);
    setToken(tokenData.access_token);

    // Charge le profil immédiatement après le login
    const me = await authService.me();
    sessionStorage.setItem("user", JSON.stringify(me));
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
    }),
    [user, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
