/**
 * API Client Configuration
 *
 * Creates a typed API client using openapi-fetch with the generated schema types.
 */

import createClient from "openapi-fetch";
import type { paths } from "./schema";

// Base URL for the API - can be configured via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Typed API client instance
 */
export const apiClient = createClient<paths>({
  baseUrl: API_BASE_URL,
});

/**
 * API configuration
 */
export const apiConfig = {
  baseUrl: API_BASE_URL,
} as const;
