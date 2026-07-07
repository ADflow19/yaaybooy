import { apiClient } from "./client";
import type {
  AlertRead,
  AlertUpdate,
  AppointmentRead,
  ConsultationCreate,
  ConsultationRead,
  PatientDossierRead,
  PatientRead,
  PatientUpdate,
  RiskLevel,
  VaccinationCreate,
  VaccinationRead,
} from "./types";

export const midwifeService = {
  // ── Patientes ────────────────────────────────────────────────────────────────

  /**
   * GET /api/midwife/patients — liste toutes les patientes.
   * @param search   recherche par nom
   * @param risk     filtre par niveau de risque
   * @param sortBy   tri : "name" | "risk" | "weeks" | "next_visit"
   */
  listPatients(
    search?: string,
    risk?: RiskLevel,
    sortBy: "name" | "risk" | "weeks" | "next_visit" = "name"
  ): Promise<PatientRead[]> {
    const params: Record<string, unknown> = { sort_by: sortBy };
    if (search) params.search = search;
    if (risk) params.risk = risk;
    return apiClient.get<PatientRead[]>("/api/midwife/patients", { params }).then((r) => r.data);
  },

  /** GET /api/midwife/patients/{id} — dossier complet d'une patiente. */
  getPatient(id: number): Promise<PatientDossierRead> {
    return apiClient.get<PatientDossierRead>(`/api/midwife/patients/${id}`).then((r) => r.data);
  },

  /** PATCH /api/midwife/patients/{id} — met à jour le profil d'une patiente. */
  updatePatient(id: number, payload: PatientUpdate): Promise<PatientRead> {
    return apiClient
      .patch<PatientRead>(`/api/midwife/patients/${id}`, payload)
      .then((r) => r.data);
  },

  // ── Alertes ──────────────────────────────────────────────────────────────────

  /**
   * GET /api/midwife/alerts — toutes les alertes de toutes les patientes.
   * @param resolved   undefined = toutes, false = actives, true = résolues
   * @param severity   filtre par sévérité
   */
  listAlerts(resolved?: boolean, severity?: string): Promise<AlertRead[]> {
    const params: Record<string, unknown> = {};
    if (resolved !== undefined) params.resolved = resolved;
    if (severity) params.severity = severity;
    return apiClient.get<AlertRead[]>("/api/midwife/alerts", { params }).then((r) => r.data);
  },

  /** PATCH /api/midwife/alerts/{id} — résoudre / annoter une alerte. */
  updateAlert(id: number, payload: AlertUpdate): Promise<AlertRead> {
    return apiClient
      .patch<AlertRead>(`/api/midwife/alerts/${id}`, payload)
      .then((r) => r.data);
  },

  // ── Agenda ───────────────────────────────────────────────────────────────────

  /**
   * GET /api/midwife/appointments — agenda de la sage-femme connectée.
   * @param upcomingOnly  true = seulement les RDV futurs
   * @param unassigned    true = RDV sans sage-femme assignée
   */
  listAppointments(upcomingOnly?: boolean, unassigned?: boolean): Promise<AppointmentRead[]> {
    const params: Record<string, unknown> = {};
    if (upcomingOnly) params.upcoming_only = true;
    if (unassigned) params.unassigned = true;
    return apiClient
      .get<AppointmentRead[]>("/api/midwife/appointments", { params })
      .then((r) => r.data);
  },

  // ── Notes cliniques ──────────────────────────────────────────────────────────

  /** GET /api/midwife/patients/{id}/notes — notes cliniques d'une patiente. */
  listNotes(patientId: number): Promise<ConsultationRead[]> {
    return apiClient
      .get<ConsultationRead[]>(`/api/midwife/patients/${patientId}/notes`)
      .then((r) => r.data);
  },

  /** POST /api/midwife/patients/{id}/notes — ajoute une note clinique. */
  createNote(patientId: number, payload: ConsultationCreate): Promise<ConsultationRead> {
    return apiClient
      .post<ConsultationRead>(`/api/midwife/patients/${patientId}/notes`, payload)
      .then((r) => r.data);
  },

  // ── Vaccinations ─────────────────────────────────────────────────────────────

  /** GET /api/midwife/patients/{id}/vaccinations */
  listVaccinations(patientId: number): Promise<VaccinationRead[]> {
    return apiClient
      .get<VaccinationRead[]>(`/api/midwife/patients/${patientId}/vaccinations`)
      .then((r) => r.data);
  },

  /** POST /api/midwife/patients/{id}/vaccinations */
  createVaccination(patientId: number, payload: VaccinationCreate): Promise<VaccinationRead> {
    return apiClient
      .post<VaccinationRead>(`/api/midwife/patients/${patientId}/vaccinations`, payload)
      .then((r) => r.data);
  },
};
