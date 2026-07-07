import { apiClient } from "./client";
import type { AppointmentCreate, AppointmentRead, AppointmentUpdate, AppointmentType } from "./types";

export const appointmentService = {
  /**
   * GET /api/appointments — liste des rendez-vous de la patiente.
   * @param upcomingOnly  true = seulement les RDV futurs
   * @param type          filtre par type
   */
  list(upcomingOnly?: boolean, type?: AppointmentType): Promise<AppointmentRead[]> {
    const params: Record<string, unknown> = {};
    if (upcomingOnly) params.upcoming_only = true;
    if (type) params.type = type;
    return apiClient.get<AppointmentRead[]>("/api/appointments", { params }).then((r) => r.data);
  },

  /** POST /api/appointments — crée un rendez-vous. */
  create(payload: AppointmentCreate): Promise<AppointmentRead> {
    return apiClient.post<AppointmentRead>("/api/appointments", payload).then((r) => r.data);
  },

  /** PATCH /api/appointments/{id} — met à jour un rendez-vous. */
  update(id: number, payload: AppointmentUpdate): Promise<AppointmentRead> {
    return apiClient.patch<AppointmentRead>(`/api/appointments/${id}`, payload).then((r) => r.data);
  },

  /** DELETE /api/appointments/{id} — annule un rendez-vous. */
  delete(id: number): Promise<void> {
    return apiClient.delete(`/api/appointments/${id}`).then(() => undefined);
  },
};
