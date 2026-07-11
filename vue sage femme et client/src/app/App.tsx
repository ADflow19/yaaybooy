import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "../context/AuthContext";
import { ChatbotWidget } from "./components/ChatbotWidget";
import { IncomingCallBanner } from "./components/IncomingCallBanner";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      {/* Bannière appel vidéo entrant — visible uniquement pour les patientes */}
      <IncomingCallBanner />
      {/* Bulle flottante IA — visible sur toutes les pages authentifiées */}
      <ChatbotWidget />
    </AuthProvider>
  );
}
