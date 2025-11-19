import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  useQueryDocuments,
  useQueryDocumentsMutation,
  useDocuments,
  useDocument,
  useDocumentBySection,
  useConversations,
  useConversation,
  useCreateConversation,
  useSendMessage,
  useDeleteConversation,
  queryKeys,
} from "../hooks";
import { apiClient } from "../client";

// Mock the API client
jest.mock("../client", () => ({
  apiClient: {
    GET: jest.fn(),
  },
  apiConfig: {
    baseUrl: "http://localhost:8000",
  },
}));

// Mock global fetch
global.fetch = jest.fn();

const createWrapper = () => {
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
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
};

describe("API Hooks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("queryKeys", () => {
    it("generates correct query keys", () => {
      expect(queryKeys.query("test")).toEqual(["query", "test"]);
      expect(queryKeys.documents).toEqual(["documents"]);
      expect(queryKeys.document("123")).toEqual(["documents", "123"]);
      expect(queryKeys.documentBySection("1.1")).toEqual([
        "documents",
        "section",
        "1.1",
      ]);
      expect(queryKeys.conversations).toEqual(["conversations"]);
      expect(queryKeys.conversation("conv1")).toEqual([
        "conversations",
        "conv1",
      ]);
    });
  });

  describe("useQueryDocuments", () => {
    it("fetches documents successfully", async () => {
      const mockData = {
        response: "Test response",
        citations: [],
      };

      (apiClient.GET as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const { result } = renderHook(() => useQueryDocuments("test query"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(apiClient.GET).toHaveBeenCalledWith("/query", {
        params: {
          query: { q: "test query" },
        },
      });
    });

    it("handles errors correctly", async () => {
      (apiClient.GET as jest.Mock).mockResolvedValue({
        data: null,
        error: { detail: [{ msg: "Error message" }] },
      });

      const { result } = renderHook(() => useQueryDocuments("test query"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
    });

    it("does not run query when string is empty", () => {
      const { result } = renderHook(() => useQueryDocuments(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(apiClient.GET).not.toHaveBeenCalled();
    });
  });

  describe("useQueryDocumentsMutation", () => {
    it("executes mutation successfully", async () => {
      const mockData = {
        response: "Test response",
        citations: [],
      };

      (apiClient.GET as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const { result } = renderHook(() => useQueryDocumentsMutation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("test query");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe("useDocuments", () => {
    it("fetches all documents successfully", async () => {
      const mockData = {
        documents: [
          { id: "1", section: "1.1", title: "Doc 1" },
          { id: "2", section: "1.2", title: "Doc 2" },
        ],
      };

      (apiClient.GET as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(apiClient.GET).toHaveBeenCalledWith("/documents");
    });

    it("handles errors", async () => {
      (apiClient.GET as jest.Mock).mockResolvedValue({
        data: null,
        error: { detail: "Error" },
      });

      const { result } = renderHook(() => useDocuments(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe("useDocument", () => {
    it("fetches specific document successfully", async () => {
      const mockData = {
        id: "123",
        section: "1.1",
        title: "Test Doc",
        content: "Test content",
      };

      (apiClient.GET as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const { result } = renderHook(() => useDocument("123"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(apiClient.GET).toHaveBeenCalledWith("/documents/{document_id}", {
        params: {
          path: { document_id: "123" },
        },
      });
    });

    it("does not fetch when documentId is empty", () => {
      const { result } = renderHook(() => useDocument(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(apiClient.GET).not.toHaveBeenCalled();
    });
  });

  describe("useDocumentBySection", () => {
    it("fetches document by section successfully", async () => {
      const mockData = {
        id: "123",
        section: "1.1",
        title: "Test Doc",
      };

      (apiClient.GET as jest.Mock).mockResolvedValue({
        data: mockData,
        error: null,
      });

      const { result } = renderHook(() => useDocumentBySection("1.1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(apiClient.GET).toHaveBeenCalledWith(
        "/documents/section/{section_number}",
        {
          params: {
            path: { section_number: "1.1" },
          },
        }
      );
    });
  });

  describe("useConversations", () => {
    it("fetches all conversations successfully", async () => {
      const mockData = {
        total: 2,
        conversations: [
          { id: "1", title: "Conv 1", messages: [] },
          { id: "2", title: "Conv 2", messages: [] },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useConversations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("handles fetch errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useConversations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe("useConversation", () => {
    it("fetches specific conversation successfully", async () => {
      const mockData = {
        id: "conv1",
        title: "Test Conversation",
        messages: [],
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useConversation("conv1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("does not fetch when conversationId is undefined", () => {
      const { result } = renderHook(() => useConversation(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe("useCreateConversation", () => {
    it("creates conversation successfully", async () => {
      const mockData = {
        id: "new-conv",
        title: "New Conversation",
        messages: [],
        created_at: "2025-01-01",
        updated_at: "2025-01-01",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useCreateConversation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ title: "New Conversation" });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/conversations",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ title: "New Conversation" }),
        })
      );
    });

    it("handles errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useCreateConversation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({});

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe("useSendMessage", () => {
    it("sends message successfully", async () => {
      const mockData = {
        role: "assistant",
        content: "Response",
        citations: [],
        timestamp: "2025-01-01",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useSendMessage(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        conversationId: "conv1",
        message: "Hello",
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/conversations/conv1/messages",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ message: "Hello" }),
        })
      );
    });
  });

  describe("useDeleteConversation", () => {
    it("deletes conversation successfully", async () => {
      const mockData = { success: true };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const { result } = renderHook(() => useDeleteConversation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("conv1");

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/conversations/conv1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
    });

    it("handles errors", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
      });

      const { result } = renderHook(() => useDeleteConversation(), {
        wrapper: createWrapper(),
      });

      result.current.mutate("conv1");

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
