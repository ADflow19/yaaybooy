import { apiClient } from "./client";
import type { BabyJournalCreate, BabyJournalRead, BabyJournalUpdate } from "./types";

export const babyJournalService = {
  /**
   * GET /api/baby-journal — entrées du journal.
   * @param weeks   filtre par semaine d'aménorrhée
   * @param limit   pagination (défaut 20)
   * @param offset  pagination (défaut 0)
   */
  list(weeks?: number, limit = 20, offset = 0): Promise<BabyJournalRead[]> {
    const params: Record<string, unknown> = { limit, offset };
    if (weeks !== undefined) params.weeks = weeks;
    return apiClient.get<BabyJournalRead[]>("/api/baby-journal", { params }).then((r) => r.data);
  },

  /** GET /api/baby-journal/{id} — détail d'une entrée. */
  get(id: number): Promise<BabyJournalRead> {
    return apiClient.get<BabyJournalRead>(`/api/baby-journal/${id}`).then((r) => r.data);
  },

  /** POST /api/baby-journal — crée une entrée. */
  create(payload: BabyJournalCreate): Promise<BabyJournalRead> {
    return apiClient.post<BabyJournalRead>("/api/baby-journal", payload).then((r) => r.data);
  },

  /** PATCH /api/baby-journal/{id} — met à jour une entrée. */
  update(id: number, payload: BabyJournalUpdate): Promise<BabyJournalRead> {
    return apiClient.patch<BabyJournalRead>(`/api/baby-journal/${id}`, payload).then((r) => r.data);
  },

  /** DELETE /api/baby-journal/{id} — supprime une entrée. */
  delete(id: number): Promise<void> {
    return apiClient.delete(`/api/baby-journal/${id}`).then(() => undefined);
  },
};
