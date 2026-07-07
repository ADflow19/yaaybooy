import { createBrowserRouter, Navigate } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { HomePage } from "./pages/HomePage";
import { IoTMeasurePage } from "./pages/IoTMeasurePage";
import { AlertPage } from "./pages/AlertPage";
import { PregnancyPage } from "./pages/PregnancyPage";
import { BabyJournalPage } from "./pages/BabyJournalPage";
import { CalendarPage } from "./pages/CalendarPage";
import { ProfilePage } from "./pages/ProfilePage";
import { MidwifeLayout } from "./layouts/MidwifeLayout";
import { MidwifeDashboard } from "./pages/midwife/MidwifeDashboard";
import { PatientListPage } from "./pages/midwife/PatientListPage";
import { PatientRecordPage } from "./pages/midwife/PatientRecordPage";
import { MidwifeCalendarPage } from "./pages/midwife/MidwifeCalendarPage";
import { MidwifeAlertsPage } from "./pages/midwife/MidwifeAlertsPage";
import { MidwifeProfilePage } from "./pages/midwife/MidwifeProfilePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
  // ── Auth (pas de layout) ──────────────────────────────────────────────────
  { path: "/login", Component: LoginPage },
  { path: "/register", Component: RegisterPage },

  // ── Espace patiente ───────────────────────────────────────────────────────
  {
    path: "/",
    element: (
      <RequireAuth role="patiente">
        <RootLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, Component: HomePage },
      { path: "mesure", Component: IoTMeasurePage },
      { path: "alerte", Component: AlertPage },
      { path: "grossesse", Component: PregnancyPage },
      { path: "bebe", Component: BabyJournalPage },
      { path: "agenda", Component: CalendarPage },
      { path: "profil", Component: ProfilePage },
    ],
  },

  // ── Espace sage-femme ─────────────────────────────────────────────────────
  {
    path: "/sage-femme",
    element: (
      <RequireAuth role="sage_femme">
        <MidwifeLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, Component: MidwifeDashboard },
      { path: "patientes", Component: PatientListPage },
      { path: "patientes/:id", Component: PatientRecordPage },
      { path: "agenda", Component: MidwifeCalendarPage },
      { path: "alertes", Component: MidwifeAlertsPage },
      { path: "profil", Component: MidwifeProfilePage },
    ],
  },

  // ── Fallback ──────────────────────────────────────────────────────────────
  { path: "*", element: <Navigate to="/" replace /> },
]);
