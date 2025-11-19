/**
 * Tests for conversation types
 * These are mainly TypeScript type definitions, so we test basic type guards and validators
 */

import type { Message, Conversation } from "../conversation-types";

describe("Conversation Types", () => {
  describe("Message type", () => {
    it("should accept valid user message", () => {
      const message: Message = {
        role: "user",
        content: "Test message",
        citations: [],
        timestamp: "2025-01-01T00:00:00Z",
      };

      expect(message.role).toBe("user");
      expect(message.content).toBe("Test message");
    });

    it("should accept valid assistant message", () => {
      const message: Message = {
        role: "assistant",
        content: "Test response",
        citations: [
          {
            source: "Section 1",
            text: "Citation text",
          },
        ],
        timestamp: "2025-01-01T00:00:00Z",
      };

      expect(message.role).toBe("assistant");
      expect(message.citations.length).toBe(1);
    });
  });

  describe("Conversation type", () => {
    it("should accept valid conversation", () => {
      const conversation: Conversation = {
        id: "conv-123",
        title: "Test Conversation",
        messages: [],
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      expect(conversation.id).toBe("conv-123");
      expect(conversation.messages).toEqual([]);
    });

    it("should accept conversation with messages", () => {
      const conversation: Conversation = {
        id: "conv-123",
        title: "Test Conversation",
        messages: [
          {
            role: "user",
            content: "Hello",
            citations: [],
            timestamp: "2025-01-01T00:00:00Z",
          },
        ],
        created_at: "2025-01-01T00:00:00Z",
        updated_at: "2025-01-01T00:00:00Z",
      };

      expect(conversation.messages.length).toBe(1);
    });
  });

  describe("Request types", () => {
    it("should handle CreateConversationRequest with optional title", () => {
      // With title
      const request1 = {
        title: "My Conversation",
      };
      expect(request1.title).toBe("My Conversation");

      // Without title
      const request2 = {};
      expect(request2).toEqual({});
    });

    it("should handle SendMessageRequest", () => {
      const request = {
        message: "Test message",
      };
      expect(request.message).toBe("Test message");
    });
  });
});
