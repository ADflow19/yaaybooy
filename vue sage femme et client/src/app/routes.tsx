import { createBrowserRouter } from "react-router";
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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
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
  {
    path: "/sage-femme",
    Component: MidwifeLayout,
    children: [
      { index: true, Component: MidwifeDashboard },
      { path: "patientes", Component: PatientListPage },
      { path: "patientes/:id", Component: PatientRecordPage },
      { path: "agenda", Component: MidwifeCalendarPage },
      { path: "alertes", Component: MidwifeAlertsPage },
      { path: "profil", Component: MidwifeProfilePage },
    ],
  },
]);
