import { apiClient } from "./client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history?: ChatMessage[];
}

export interface ChatResponse {
  reply: string;
  conversation_history: ChatMessage[];
}

export const chatbotService = {
  /**
   * POST /api/chatbot/message
   * Envoie un message au chatbot et retourne la réponse + l'historique mis à jour.
   */
  sendMessage(payload: ChatRequest): Promise<ChatResponse> {
    return apiClient
      .post<ChatResponse>("/api/chatbot/message", payload)
      .then((r) => r.data);
  },
};
