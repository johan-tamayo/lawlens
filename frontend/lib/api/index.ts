/**
 * API Module Exports
 *
 * Centralized exports for the API client, hooks, and types.
 */

export { apiClient, apiConfig } from "./client";
export {
  useQueryDocuments,
  useQueryDocumentsMutation,
  useDocuments,
  useDocument,
  useDocumentBySection,
  queryKeys,
} from "./hooks";
export type { paths, components } from "./schema";
