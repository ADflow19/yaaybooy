import { apiClient } from "./client";
import type { RegisterPayload, Token, UserRead } from "./types";

export const authService = {
  /** Crée un nouveau compte utilisateur. */
  register(payload: RegisterPayload): Promise<UserRead> {
    return apiClient.post<UserRead>("/api/auth/register", payload).then((r) => r.data);
  },

  /**
   * Authentifie l'utilisateur.
   * Le backend attend un form-urlencoded (OAuth2PasswordRequestForm).
   */
  login(email: string, password: string): Promise<Token> {
    const body = new URLSearchParams({ username: email, password });
    return apiClient
      .post<Token>("/api/auth/login", body, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
      .then((r) => r.data);
  },

  /** Retourne le profil de l'utilisateur connecté (vérifie le token). */
  me(): Promise<UserRead> {
    return apiClient.get<UserRead>("/api/auth/me").then((r) => r.data);
  },
};
