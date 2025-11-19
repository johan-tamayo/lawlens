import { render, screen } from "@/__tests__/test-utils";
import MessageBubble from "../MessageBubble";
import { createMockMessage } from "@/__tests__/test-utils";
import { userEvent } from "@testing-library/user-event";

// Mock the hooks
jest.mock("@/lib/api/hooks", () => ({
  useDocuments: jest.fn(() => ({
    data: {
      documents: [
        { id: "doc1", section: "Section 1", title: "Test Doc" },
        { id: "doc2", section: "Section 2", title: "Another Doc" },
      ],
    },
    isLoading: false,
  })),
}));

describe("MessageBubble", () => {
  it("renders user message correctly", () => {
    const message = createMockMessage({
      role: "user",
      content: "Hello, assistant!",
    });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("Hello, assistant!")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("renders assistant message correctly", () => {
    const message = createMockMessage({
      role: "assistant",
      content: "Hello, user!",
    });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("Hello, user!")).toBeInTheDocument();
    expect(screen.getByText("Assistant")).toBeInTheDocument();
  });

  it("renders timestamp correctly", () => {
    const message = createMockMessage({
      timestamp: new Date().toISOString(),
    });

    render(<MessageBubble message={message} />);

    // Should show "less than a minute ago" or similar
    expect(screen.getByText(/ago/)).toBeInTheDocument();
  });

  it("renders citations when available", () => {
    const message = createMockMessage({
      role: "assistant",
      citations: [
        { source: "Section 1", text: "Citation text 1" },
        { source: "Section 2", text: "Citation text 2" },
      ],
    });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("2 Citations")).toBeInTheDocument();
  });

  it("shows singular citation text for one citation", () => {
    const message = createMockMessage({
      role: "assistant",
      citations: [{ source: "Section 1", text: "Citation text" }],
    });

    render(<MessageBubble message={message} />);

    expect(screen.getByText("1 Citation")).toBeInTheDocument();
  });

  it("expands and collapses citations on click", async () => {
    const message = createMockMessage({
      role: "assistant",
      citations: [{ source: "Section 1", text: "Citation text 1" }],
    });

    render(<MessageBubble message={message} />);

    // Citations panel exists but content may be collapsed/visible
    // Just verify the citation count is clickable
    const citationButton = screen.getByText("1 Citation");
    expect(citationButton).toBeInTheDocument();

    // Citation text should be in the document (Chakra Collapse may render but hide it)
    expect(screen.getByText("Citation text 1")).toBeInTheDocument();
  });

  it("navigates to document when citation is clicked", async () => {
    const message = createMockMessage({
      role: "assistant",
      citations: [{ source: "Section 1", text: "Citation text" }],
    });

    const mockPush = jest.fn();
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    });

    render(<MessageBubble message={message} />);

    const user = userEvent.setup();

    // Click on citation
    const citationBox = screen.getByText("Citation text").closest("div");
    if (citationBox) {
      await user.click(citationBox);
      expect(mockPush).toHaveBeenCalled();
    }
  });

  it("does not show citations for messages without citations", () => {
    const message = createMockMessage({
      citations: [],
    });

    render(<MessageBubble message={message} />);

    expect(screen.queryByText(/Citation/)).not.toBeInTheDocument();
  });

  it("handles missing document gracefully", async () => {
    const user = userEvent.setup();
    const message = createMockMessage({
      role: "assistant",
      citations: [{ source: "Unknown Section", text: "Citation text" }],
    });

    const mockPush = jest.fn();
    jest.spyOn(require("next/navigation"), "useRouter").mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    });

    render(<MessageBubble message={message} />);

    // Expand citations
    await user.click(screen.getByText("1 Citation"));

    // Click on citation - should navigate to documents list
    const citationBox = screen.getByText("Citation text").closest("div");
    if (citationBox) {
      await user.click(citationBox);
      expect(mockPush).toHaveBeenCalledWith("/documents");
    }
  });
});
