import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "../context/AuthContext";
import { ChatbotWidget } from "./components/ChatbotWidget";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      {/* Bulle flottante IA — visible sur toutes les pages authentifiées */}
      <ChatbotWidget />
    </AuthProvider>
  );
}
