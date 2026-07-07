import { apiClient } from "./client";
import type { PatientRead, PatientUpdate } from "./types";

export const patientService = {
  /** GET /api/patients/me — profil de la patiente connectée. */
  getMe(): Promise<PatientRead> {
    return apiClient.get<PatientRead>("/api/patients/me").then((r) => r.data);
  },

  /** POST /api/patients/me — crée le profil patiente. */
  createMe(payload: Omit<PatientRead, "id" | "user_id">): Promise<PatientRead> {
    return apiClient.post<PatientRead>("/api/patients/me", payload).then((r) => r.data);
  },

  /** PATCH /api/patients/me — met à jour partiellement le profil. */
  updateMe(payload: PatientUpdate): Promise<PatientRead> {
    return apiClient.patch<PatientRead>("/api/patients/me", payload).then((r) => r.data);
  },
};
