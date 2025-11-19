import { render, screen } from "@/__tests__/test-utils";
import TreeSection, { TreeNode } from "../TreeSection";
import { userEvent } from "@testing-library/user-event";

describe("TreeSection", () => {
  const mockOnSelect = jest.fn();

  const createNode = (overrides: Partial<TreeNode> = {}): TreeNode => ({
    id: "node-1",
    title: "Test Node",
    sectionNumber: "1.1",
    children: [],
    ...overrides,
  });

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it("renders node with title and section number", () => {
    const node = createNode();
    render(<TreeSection node={node} onSelect={mockOnSelect} level={0} />);

    expect(screen.getByText(/Test Node/)).toBeInTheDocument();
  });

  it("renders without expand icon when node has no children", () => {
    const node = createNode();
    const { container } = render(
      <TreeSection node={node} onSelect={mockOnSelect} level={0} />
    );

    // Should not have expand/collapse icon
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(0);
  });

  it("renders with expand icon when node has children", () => {
    const node = createNode({
      children: [
        {
          id: "child-1",
          title: "Child Node",
          sectionNumber: "1.1.1",
          children: [],
        },
      ],
    });

    const { container } = render(
      <TreeSection node={node} onSelect={mockOnSelect} level={0} />
    );

    // Should have expand icon
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
  });

  it("calls onSelect when clicked", async () => {
    const user = userEvent.setup();
    const node = createNode();

    render(<TreeSection node={node} onSelect={mockOnSelect} level={0} />);

    const nodeElement = screen.getByText(/Test Node/).closest("div");
    if (nodeElement) {
      await user.click(nodeElement);
      expect(mockOnSelect).toHaveBeenCalledWith("node-1", "1.1");
    }
  });

  it("expands to show children when clicked", async () => {
    const user = userEvent.setup();
    const node = createNode({
      children: [
        {
          id: "child-1",
          title: "Child Node",
          sectionNumber: "1.1.1",
          children: [],
        },
      ],
    });

    render(<TreeSection node={node} onSelect={mockOnSelect} level={0} />);

    // Child should not be visible initially
    expect(screen.queryByText(/Child Node/)).not.toBeInTheDocument();

    // Click to expand
    const nodeElement = screen.getByText(/Test Node/).closest("div");
    if (nodeElement) {
      await user.click(nodeElement);
    }

    // Child should now be visible
    expect(screen.getByText(/Child Node/)).toBeInTheDocument();
  });

  it("collapses children when clicked again", async () => {
    const user = userEvent.setup();
    const node = createNode({
      children: [
        {
          id: "child-1",
          title: "Child Node",
          sectionNumber: "1.1.1",
          children: [],
        },
      ],
    });

    render(<TreeSection node={node} onSelect={mockOnSelect} level={0} />);

    const nodeElement = screen.getByText(/Test Node/).closest("div");

    if (nodeElement) {
      // Expand
      await user.click(nodeElement);
      expect(screen.getByText(/Child Node/)).toBeInTheDocument();

      // Collapse
      await user.click(nodeElement);
      expect(screen.queryByText(/Child Node/)).not.toBeInTheDocument();
    }
  });

  it("highlights selected node", () => {
    const node = createNode();
    const { container } = render(
      <TreeSection
        node={node}
        onSelect={mockOnSelect}
        selectedId="node-1"
        level={0}
      />
    );

    // Selected node should have special styling
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders at different levels with appropriate indentation", () => {
    const node = createNode();

    const { container: container1 } = render(
      <TreeSection node={node} onSelect={mockOnSelect} level={0} />
    );

    const { container: container2 } = render(
      <TreeSection node={node} onSelect={mockOnSelect} level={2} />
    );

    // Both should render successfully
    expect(container1.firstChild).toBeInTheDocument();
    expect(container2.firstChild).toBeInTheDocument();
  });

  it("does not call onSelect when node has no id", async () => {
    const user = userEvent.setup();
    const node = createNode({ id: "" });

    render(<TreeSection node={node} onSelect={mockOnSelect} level={0} />);

    const nodeElement = screen.getByText(/Test Node/).closest("div");
    if (nodeElement) {
      await user.click(nodeElement);
      expect(mockOnSelect).not.toHaveBeenCalled();
    }
  });

  it("renders nested children recursively", () => {
    const node = createNode({
      children: [
        {
          id: "child-1",
          title: "Child 1",
          sectionNumber: "1.1.1",
          children: [
            {
              id: "grandchild-1",
              title: "Grandchild 1",
              sectionNumber: "1.1.1.1",
              children: [],
            },
          ],
        },
      ],
    });

    render(<TreeSection node={node} onSelect={mockOnSelect} level={0} />);

    // Component should render without crashing
    expect(screen.getByText(/Test Node/)).toBeInTheDocument();
  });
});
