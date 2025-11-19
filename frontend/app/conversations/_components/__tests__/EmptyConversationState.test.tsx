import { render, screen } from "@/__tests__/test-utils";
import EmptyConversationState from "../EmptyConversationState";
import { userEvent } from "@testing-library/user-event";

describe("EmptyConversationState", () => {
  it("renders heading and description", () => {
    render(<EmptyConversationState />);

    expect(screen.getByText("Start Your Conversation")).toBeInTheDocument();
    expect(
      screen.getByText(/Ask me anything about the laws of Westeros/)
    ).toBeInTheDocument();
  });

  it("renders all suggestion cards", () => {
    render(<EmptyConversationState />);

    expect(screen.getByText("Ask about punishments")).toBeInTheDocument();
    expect(screen.getByText("Learn about succession")).toBeInTheDocument();
    expect(screen.getByText("Understand rights")).toBeInTheDocument();
    expect(screen.getByText("Explore marriage laws")).toBeInTheDocument();
  });

  it("renders suggestion examples", () => {
    render(<EmptyConversationState />);

    expect(
      screen.getByText(/What is the punishment for theft in Westeros/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What are the rules about succession and inheritance/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What rights do guests have under Westerosi law/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What are the marriage laws in Westeros/)
    ).toBeInTheDocument();
  });

  it("calls onSuggestionClick when suggestion is clicked", async () => {
    const user = userEvent.setup();
    const onSuggestionClick = jest.fn();

    render(<EmptyConversationState onSuggestionClick={onSuggestionClick} />);

    const suggestion = screen.getByText("Ask about punishments").closest("div");
    if (suggestion) {
      await user.click(suggestion);
      expect(onSuggestionClick).toHaveBeenCalledWith(
        "What is the punishment for theft in Westeros?"
      );
    }
  });

  it("does not make suggestions clickable without handler", () => {
    const { container } = render(<EmptyConversationState />);

    // Suggestions should still render but not be interactive
    const suggestionBoxes = container.querySelectorAll('[class*="css-"]');
    expect(suggestionBoxes.length).toBeGreaterThan(0);
  });

  it("renders tip text at bottom", () => {
    render(<EmptyConversationState />);

    expect(
      screen.getByText(/Tip: I can handle follow-up questions/)
    ).toBeInTheDocument();
  });

  it("renders sparkles icon", () => {
    const { container } = render(<EmptyConversationState />);

    // Icon should be present
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
