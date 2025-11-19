import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ChakraProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };

// Mock data helpers
export const createMockConversation = (overrides = {}) => ({
  id: "conv-123",
  title: "Test Conversation",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  messages: [],
  ...overrides,
});

export const createMockMessage = (overrides = {}) => ({
  id: "msg-123",
  role: "user" as const,
  content: "Test message",
  timestamp: "2025-01-01T00:00:00Z",
  citations: [],
  ...overrides,
});

export const createMockDocument = (overrides = {}) => ({
  id: "doc-123",
  section: "1.1",
  title: "Test Document",
  content: "Test content",
  summary: "Test summary",
  ...overrides,
});
