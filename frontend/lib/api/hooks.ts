/**
 * API Hooks
 *
 * Custom React Query hooks for interacting with the backend API.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiClient } from "./client";
import type { paths } from "./schema";
import type {
  Conversation,
  ConversationListResponse,
  CreateConversationRequest,
  Message,
  SendMessageRequest,
} from "./conversation-types";

/**
 * Type definitions for API responses
 */
type QueryResponse =
  paths["/query"]["get"]["responses"]["200"]["content"]["application/json"];
type DocumentListResponse =
  paths["/documents"]["get"]["responses"]["200"]["content"]["application/json"];
type DocumentDetailResponse =
  paths["/documents/{document_id}"]["get"]["responses"]["200"]["content"]["application/json"];
type DocumentBySectionResponse =
  paths["/documents/section/{section_number}"]["get"]["responses"]["200"]["content"]["application/json"];

/**
 * Query Keys
 *
 * Centralized query key factory for cache management.
 */
export const queryKeys = {
  query: (q: string) => ["query", q] as const,
  documents: ["documents"] as const,
  document: (id: string) => ["documents", id] as const,
  documentBySection: (section: string) =>
    ["documents", "section", section] as const,
  conversations: ["conversations"] as const,
  conversation: (id: string) => ["conversations", id] as const,
};

/**
 * useQueryDocuments Hook
 *
 * Queries the backend for legal document information based on a query string.
 *
 * @param q - The query string
 * @param options - Additional React Query options
 * @returns Query result with response and citations
 */
export function useQueryDocuments(
  q: string,
  options?: Omit<UseQueryOptions<QueryResponse>, "queryKey" | "queryFn">
) {
  return useQuery<QueryResponse>({
    queryKey: queryKeys.query(q),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/query", {
        params: {
          query: { q },
        },
      });

      if (error) {
        throw new Error(error.detail?.[0]?.msg || "Failed to query documents");
      }

      return data;
    },
    enabled: q.length > 0, // Only run query if search string is not empty
    ...options,
  });
}

/**
 * useQueryDocumentsMutation Hook
 *
 * Mutation version of useQueryDocuments for manual triggering.
 * Useful for form submissions or button clicks.
 *
 * @returns Mutation result
 */
export function useQueryDocumentsMutation() {
  return useMutation({
    mutationFn: async (q: string) => {
      const { data, error } = await apiClient.GET("/query", {
        params: {
          query: { q },
        },
      });

      if (error) {
        throw new Error(error.detail?.[0]?.msg || "Failed to query documents");
      }

      return data;
    },
  });
}

/**
 * useDocuments Hook
 *
 * Fetches all documents with their summaries.
 *
 * @param options - Additional React Query options
 * @returns Query result with all documents
 */
export function useDocuments(
  options?: Omit<UseQueryOptions<DocumentListResponse>, "queryKey" | "queryFn">
) {
  return useQuery<DocumentListResponse>({
    queryKey: queryKeys.documents,
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/documents");

      if (error) {
        throw new Error("Failed to fetch documents");
      }

      return data;
    },
    ...options,
  });
}

/**
 * useDocument Hook
 *
 * Fetches a specific document by its ID.
 *
 * @param documentId - The document ID
 * @param options - Additional React Query options
 * @returns Query result with document details
 */
export function useDocument(
  documentId: string,
  options?: Omit<
    UseQueryOptions<DocumentDetailResponse>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<DocumentDetailResponse>({
    queryKey: queryKeys.document(documentId),
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/documents/{document_id}", {
        params: {
          path: { document_id: documentId },
        },
      });

      if (error) {
        throw new Error("Failed to fetch document");
      }

      return data;
    },
    enabled: !!documentId,
    ...options,
  });
}

/**
 * useDocumentBySection Hook
 *
 * Fetches a specific document by its section number.
 *
 * @param sectionNumber - The section number (e.g., "1.1")
 * @param options - Additional React Query options
 * @returns Query result with document details
 */
export function useDocumentBySection(
  sectionNumber: string,
  options?: Omit<
    UseQueryOptions<DocumentBySectionResponse>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<DocumentBySectionResponse>({
    queryKey: queryKeys.documentBySection(sectionNumber),
    queryFn: async () => {
      const { data, error } = await apiClient.GET(
        "/documents/section/{section_number}",
        {
          params: {
            path: { section_number: sectionNumber },
          },
        }
      );

      if (error) {
        throw new Error("Failed to fetch document");
      }

      return data;
    },
    enabled: !!sectionNumber,
    ...options,
  });
}

/**
 * Conversation Hooks
 */

/**
 * useConversations Hook
 *
 * Fetches all conversations sorted by most recently updated.
 *
 * @param options - Additional React Query options
 * @returns Query result with all conversations
 */
export function useConversations(
  options?: Omit<
    UseQueryOptions<ConversationListResponse>,
    "queryKey" | "queryFn"
  >
) {
  return useQuery<ConversationListResponse>({
    queryKey: queryKeys.conversations,
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/conversations`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      return response.json();
    },
    ...options,
  });
}

/**
 * useConversation Hook
 *
 * Fetches a specific conversation by ID.
 *
 * @param conversationId - The conversation ID
 * @param options - Additional React Query options
 * @returns Query result with conversation details
 */
export function useConversation(
  conversationId: string | undefined,
  options?: Omit<UseQueryOptions<Conversation>, "queryKey" | "queryFn">
) {
  return useQuery<Conversation>({
    queryKey: queryKeys.conversation(conversationId || ""),
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/conversations/${conversationId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      return response.json();
    },
    enabled: !!conversationId,
    ...options,
  });
}

/**
 * useCreateConversation Hook
 *
 * Creates a new conversation.
 *
 * @returns Mutation result
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateConversationRequest = {}) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      return response.json() as Promise<Conversation>;
    },
    onSuccess: () => {
      // Invalidate conversations list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

/**
 * useSendMessage Hook
 *
 * Sends a message in a conversation and gets AI response.
 *
 * @returns Mutation result
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      return response.json() as Promise<Message>;
    },
    onSuccess: (_, variables) => {
      // Invalidate the specific conversation to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversation(variables.conversationId),
      });
      // Also invalidate conversations list to update timestamps
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

/**
 * useDeleteConversation Hook
 *
 * Deletes a conversation.
 *
 * @returns Mutation result
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/conversations/${conversationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate conversations list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}
