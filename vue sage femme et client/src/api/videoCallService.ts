import { apiClient } from "./client";

// Type local — VideoCallResponse n'est pas encore dans types.ts
export interface VideoCallResponse {
  room_name: string;
  jitsi_url: string;
}

export const videoCallService = {
  /**
   * POST /api/appointments/{id}/start-call
   * Démarre ou rejoint la consultation vidéo d'un RDV planifié.
   * Accessible aux deux rôles (patiente + sage-femme).
   * Idempotent : retourne toujours le même room_name pour un RDV donné.
   */
  startAppointmentCall(appointmentId: number): Promise<VideoCallResponse> {
    return apiClient
      .post<VideoCallResponse>(`/api/appointments/${appointmentId}/start-call`)
      .then((r) => r.data);
  },

  /**
   * POST /api/calls/instant?patient_id={id}
   * Appel spontané d'une sage-femme vers une patiente.
   * Génère une room éphémère unique à chaque appel.
   */
  instantCall(patientId: number): Promise<VideoCallResponse> {
    return apiClient
      .post<VideoCallResponse>(`/api/calls/instant`, null, {
        params: { patient_id: patientId },
      })
      .then((r) => r.data);
  },
};
