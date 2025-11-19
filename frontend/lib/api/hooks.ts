/**
 * API Hooks
 *
 * Custom React Query hooks for interacting with the backend API.
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiClient } from "./client";
import type { paths } from "./schema";

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
