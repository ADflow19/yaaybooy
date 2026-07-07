// ─── Auth ──────────────────────────────────────────────────────────────────────

export type UserRole = "patiente" | "sage_femme";

export interface UserRead {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  role: UserRole;
}

// ─── Patient ──────────────────────────────────────────────────────────────────

export type RiskLevel = "high" | "watch" | "normal";

export interface PatientRead {
  id: number;
  user_id: number;
  name: string;
  age: number | null;
  weeks: number;
  dpa: string | null;           // ISO date "YYYY-MM-DD"
  last_visit: string | null;
  next_visit: string | null;
  risk: RiskLevel;
  blood_type: string | null;
  phone: string | null;
  village: string | null;
  gravida: number;
  para: number;
  photo: string | null;
}

export interface PatientUpdate {
  name?: string;
  age?: number;
  weeks?: number;
  dpa?: string;
  last_visit?: string;
  next_visit?: string;
  risk?: RiskLevel;
  blood_type?: string;
  phone?: string;
  village?: string;
  gravida?: number;
  para?: number;
  photo?: string;
}

// ─── Measurement ──────────────────────────────────────────────────────────────

export type MeasurementType = "blood-pressure" | "heart-rate" | "temperature" | "baby-movements";
export type MeasurementStatus = "normal" | "warning" | "alert";

export interface MeasurementRead {
  id: number;
  patient_id: number;
  type: MeasurementType;
  value: string;
  status: MeasurementStatus;
  message: string | null;
  shared_with_midwife: boolean;
  recorded_at: string;
}

export interface MeasurementCreate {
  type: MeasurementType;
  value: string;
  status: MeasurementStatus;
  message?: string;
}

export interface MeasurementSharedRead extends MeasurementRead {
  alert_created: AlertRead | null;
}

// ─── Alert ────────────────────────────────────────────────────────────────────

export type AlertSeverity = "critical" | "high" | "medium" | "resolved";
export type AlertCategory = "bp" | "glycemia" | "movement" | "weight" | "heartrate" | "other";

export interface AlertRead {
  id: number;
  patient_id: number;
  weeks: number | null;
  severity: AlertSeverity;
  category: AlertCategory;
  title: string;
  value: string | null;
  normal: string | null;
  note: string | null;
  time: string;
  resolved: boolean;
}

export interface AlertUpdate {
  resolved?: boolean;
  note?: string;
  severity?: AlertSeverity;
}

// ─── Appointment ──────────────────────────────────────────────────────────────

export type AppointmentType = "routine" | "urgent" | "birth" | "first";

export interface AppointmentRead {
  id: number;
  patient_id: number;
  midwife_id: number | null;
  scheduled_at: string;         // ISO datetime
  duration: number;             // minutes
  type: AppointmentType;
  weeks: number | null;
  note: string | null;
}

export interface AppointmentCreate {
  scheduled_at: string;
  duration?: number;
  type?: AppointmentType;
  weeks?: number;
  note?: string;
}

export interface AppointmentUpdate {
  scheduled_at?: string;
  duration?: number;
  type?: AppointmentType;
  weeks?: number;
  note?: string;
}

// ─── BabyJournal ──────────────────────────────────────────────────────────────

export interface BabyJournalRead {
  id: number;
  patient_id: number;
  title: string;
  content: string | null;
  photo_url: string | null;
  weeks: number | null;
  created_at: string;
  updated_at: string;
}

export interface BabyJournalCreate {
  title: string;
  content?: string;
  photo_url?: string;
  weeks?: number;
}

export interface BabyJournalUpdate {
  title?: string;
  content?: string;
  photo_url?: string;
  weeks?: number;
}

// ─── Consultation ─────────────────────────────────────────────────────────────

export type ConsultationType = "Urgente" | "Routine";

export interface ConsultationRead {
  id: number;
  patient_id: number;
  date: string;
  sa: string | null;
  type: ConsultationType;
  notes: string | null;
  provider: string | null;
  created_at: string;
}

export interface ConsultationCreate {
  date: string;
  sa?: string;
  type?: ConsultationType;
  notes?: string;
  provider?: string;
}

// ─── Vaccination ──────────────────────────────────────────────────────────────

export type VaccinationStatus = "done" | "upcoming";

export interface VaccinationRead {
  id: number;
  patient_id: number;
  name: string;
  date: string | null;
  status: VaccinationStatus;
}

// ─── Midwife dossier ─────────────────────────────────────────────────────────

export interface PatientDossierRead extends PatientRead {
  alerts: AlertRead[];
  appointments: AppointmentRead[];
  measurements: MeasurementRead[];
  consultations: ConsultationRead[];
  vaccinations: VaccinationRead[];
}
