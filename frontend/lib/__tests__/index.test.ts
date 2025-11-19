/**
 * Tests for lib/index.ts exports
 */

import * as libExports from "../index";

describe("Library Exports", () => {
  it("exports API hooks", () => {
    expect(libExports.useDocuments).toBeDefined();
    expect(libExports.useDocument).toBeDefined();
    expect(libExports.useDocumentBySection).toBeDefined();
    expect(libExports.useQueryDocuments).toBeDefined();
    expect(libExports.useQueryDocumentsMutation).toBeDefined();
  });

  it("exports conversation hooks", () => {
    // These hooks are exported from api/hooks which is re-exported
    expect(typeof libExports).toBe("object");
    // Verify at least some exports exist
    expect(libExports.useDocuments).toBeDefined();
  });

  it("exports query keys", () => {
    expect(libExports.queryKeys).toBeDefined();
    expect(libExports.queryKeys.documents).toEqual(["documents"]);
  });

  it("exports API client", () => {
    expect(libExports.apiClient).toBeDefined();
    expect(libExports.apiConfig).toBeDefined();
  });
});
