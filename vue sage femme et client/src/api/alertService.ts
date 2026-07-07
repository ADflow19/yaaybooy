import { apiClient } from "./client";
import type { AlertRead } from "./types";

export const alertService = {
  /**
   * GET /api/alerts — alertes de la patiente connectée.
   * @param resolved  undefined = toutes, true = résolues, false = actives
   */
  list(resolved?: boolean): Promise<AlertRead[]> {
    const params = resolved !== undefined ? { resolved } : {};
    return apiClient.get<AlertRead[]>("/api/alerts", { params }).then((r) => r.data);
  },

  /** GET /api/alerts/{id} — détail d'une alerte. */
  get(id: number): Promise<AlertRead> {
    return apiClient.get<AlertRead>(`/api/alerts/${id}`).then((r) => r.data);
  },
};
