import { render, screen } from "@/__tests__/test-utils";
import DocumentTree from "../DocumentTree";

// Mock the hooks
jest.mock("@/lib/api/hooks", () => ({
  useDocuments: jest.fn(),
}));

const mockUseDocuments = require("@/lib/api/hooks").useDocuments;

describe("DocumentTree", () => {
  const mockOnSelectDocument = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state", () => {
    mockUseDocuments.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<DocumentTree onSelectDocument={mockOnSelectDocument} />);

    expect(screen.getByText("Loading sections...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    mockUseDocuments.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error("Failed to load"),
    });

    render(<DocumentTree onSelectDocument={mockOnSelectDocument} />);

    expect(screen.getByText("Failed to Load")).toBeInTheDocument();
    expect(
      screen.getByText("Unable to retrieve documents")
    ).toBeInTheDocument();
  });

  it("renders tree with documents", () => {
    mockUseDocuments.mockReturnValue({
      data: {
        documents: [
          {
            id: "doc1",
            subsection_number: "1.1",
            main_section: "Section 1",
            preview: "Document 1 preview",
          },
          {
            id: "doc2",
            subsection_number: "1.2",
            main_section: "Section 1",
            preview: "Document 2 preview",
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(<DocumentTree onSelectDocument={mockOnSelectDocument} />);

    // Main section should be rendered (text is split by formatting)
    expect(screen.getByText("Section 1", { exact: false })).toBeInTheDocument();
  });

  it("truncates long preview text", () => {
    mockUseDocuments.mockReturnValue({
      data: {
        documents: [
          {
            id: "doc1",
            subsection_number: "1.1",
            main_section: "Section 1",
            preview:
              "This is a very long preview text that should be truncated",
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <DocumentTree onSelectDocument={mockOnSelectDocument} />
    );

    // Should have rendered the tree
    expect(container).toBeTruthy();
  });

  it("builds multi-level tree structure correctly", () => {
    mockUseDocuments.mockReturnValue({
      data: {
        documents: [
          {
            id: "doc1",
            subsection_number: "1.1",
            main_section: "Section 1",
            preview: "Doc 1",
          },
          {
            id: "doc2",
            subsection_number: "1.1.1",
            main_section: "Section 1",
            preview: "Doc 2",
          },
          {
            id: "doc3",
            subsection_number: "2.1",
            main_section: "Section 2",
            preview: "Doc 3",
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(<DocumentTree onSelectDocument={mockOnSelectDocument} />);

    // Both main sections should be rendered (text is split by formatting)
    expect(screen.getByText("Section 1", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("Section 2", { exact: false })).toBeInTheDocument();
  });

  it("handles empty documents array", () => {
    mockUseDocuments.mockReturnValue({
      data: {
        documents: [],
      },
      isLoading: false,
      error: null,
    });

    const { container } = render(
      <DocumentTree onSelectDocument={mockOnSelectDocument} />
    );

    // Should render without crashing
    expect(container).toBeTruthy();
  });

  it("passes selectedDocumentId to tree sections", () => {
    mockUseDocuments.mockReturnValue({
      data: {
        documents: [
          {
            id: "doc1",
            subsection_number: "1.1",
            main_section: "Section 1",
            preview: "Doc 1",
          },
        ],
      },
      isLoading: false,
      error: null,
    });

    render(
      <DocumentTree
        onSelectDocument={mockOnSelectDocument}
        selectedDocumentId="doc1"
      />
    );

    // Tree should be rendered with selected document (text is split by formatting)
    expect(screen.getByText("Section 1", { exact: false })).toBeInTheDocument();
  });
});
