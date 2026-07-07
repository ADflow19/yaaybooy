import { apiClient } from "./client";
import type { MeasurementCreate, MeasurementRead, MeasurementSharedRead } from "./types";

export const measurementService = {
  /** GET /api/measurements — liste des mesures de la patiente. */
  list(): Promise<MeasurementRead[]> {
    return apiClient.get<MeasurementRead[]>("/api/measurements").then((r) => r.data);
  },

  /** POST /api/measurements — enregistre une nouvelle mesure. */
  create(payload: MeasurementCreate): Promise<MeasurementRead> {
    return apiClient.post<MeasurementRead>("/api/measurements", payload).then((r) => r.data);
  },

  /**
   * POST /api/measurements/{id}/share — partage la mesure avec la sage-femme.
   * Si le statut est "alert", une alerte est automatiquement créée.
   */
  share(id: number): Promise<MeasurementSharedRead> {
    return apiClient
      .post<MeasurementSharedRead>(`/api/measurements/${id}/share`)
      .then((r) => r.data);
  },

  /** DELETE /api/measurements/{id} — supprime une mesure. */
  delete(id: number): Promise<void> {
    return apiClient.delete(`/api/measurements/${id}`).then(() => undefined);
  },
};
