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

/**
 * Query Keys
 *
 * Centralized query key factory for cache management.
 */
export const queryKeys = {
  query: (q: string) => ["query", q] as const,
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
