import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../api/types";

interface Props {
  /** Rôle requis pour accéder à la route. */
  role: UserRole;
  children: React.ReactNode;
}

/**
 * Guard de navigation.
 * - Non authentifié → /login (avec redirect de retour)
 * - Mauvais rôle  → accueil du bon espace
 * - Chargement initial → spinner léger
 */
export function RequireAuth({ role, children }: Props) {
  const { isAuthenticated, isLoading, role: userRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F5]">
        <div className="w-8 h-8 border-2 border-[#C96B4B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (userRole !== role) {
    return <Navigate to={userRole === "sage_femme" ? "/sage-femme" : "/"} replace />;
  }

  return <>{children}</>;
}
