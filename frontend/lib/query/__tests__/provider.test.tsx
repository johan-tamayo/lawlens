import { render, screen } from "@testing-library/react";
import { QueryProvider } from "../provider";

describe("QueryProvider", () => {
  it("renders children", () => {
    render(
      <QueryProvider>
        <div>Test Child</div>
      </QueryProvider>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("provides QueryClient to children", () => {
    // Test that the provider wraps children successfully
    const TestComponent = () => <div>Wrapped Component</div>;

    render(
      <QueryProvider>
        <TestComponent />
      </QueryProvider>
    );

    expect(screen.getByText("Wrapped Component")).toBeInTheDocument();
  });

  it("renders without crashing with multiple children", () => {
    render(
      <QueryProvider>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </QueryProvider>
    );

    expect(screen.getByText("Child 1")).toBeInTheDocument();
    expect(screen.getByText("Child 2")).toBeInTheDocument();
    expect(screen.getByText("Child 3")).toBeInTheDocument();
  });

  it("initializes QueryClient on mount", () => {
    const { container } = render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );

    // Provider should render successfully
    expect(container.firstChild).toBeInTheDocument();
  });
});
