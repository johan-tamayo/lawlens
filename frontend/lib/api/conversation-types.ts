/**
 * TypeScript types for conversations API
 */

import { components } from "./schema";

export type Citation = components["schemas"]["Citation"];

export interface Message {
  role: "user" | "assistant";
  content: string;
  citations: Citation[];
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface ConversationListResponse {
  total: number;
  conversations: Conversation[];
}

export interface CreateConversationRequest {
  title?: string;
}

export interface SendMessageRequest {
  message: string;
}
