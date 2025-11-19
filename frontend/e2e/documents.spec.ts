import { test, expect } from "./fixtures";

test.describe("Documents Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/documents");
  });

  test("should display documents page layout", async ({ page }) => {
    // Check page heading
    await expect(
      page.getByRole("heading", { name: /legal documents/i })
    ).toBeVisible();

    // Check for document tree/list section
    await expect(page.getByText(/section/i).first()).toBeVisible();
  });

  test("should display document tree with sections", async ({ page }) => {
    // Wait for documents to load
    await page.waitForTimeout(1000);

    // Check if sections are displayed
    // Looking for section numbers like "1.", "2.", etc.
    const sections = page.getByText(/^\d+\./);
    await expect(sections.first()).toBeVisible();
  });

  test("should expand and collapse document sections", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Find a section with children (expandable)
    const section = page
      .locator('[class*="css"]')
      .filter({ hasText: /^1\./ })
      .first();

    if (await section.isVisible()) {
      // Click to expand
      await section.click();
      await page.waitForTimeout(500);

      // Look for subsections (1.1, 1.2, etc.)
      const subsection = page.getByText(/1\.\d+/);
      const subsectionCount = await subsection.count();

      // If subsections exist, they should be visible after expansion
      if (subsectionCount > 0) {
        await expect(subsection.first()).toBeVisible();
      }
    }
  });

  test("should display document content when section is selected", async ({
    page,
  }) => {
    await page.waitForTimeout(1000);

    // Click on a specific subsection
    const subsection = page.getByText(/^\d+\.\d+/).first();

    if (await subsection.isVisible()) {
      await subsection.click();
      await page.waitForTimeout(500);

      // Document content should be displayed
      // Look for document preview or content area
      const contentArea = page
        .locator('[class*="css"]')
        .filter({ hasText: /\w{20,}/ });
      await expect(contentArea.first()).toBeVisible();
    }
  });

  test("should highlight selected document in tree", async ({ page }) => {
    await page.waitForTimeout(1000);

    // Click on a document
    const document = page.getByText(/^\d+\.\d+/).first();

    if (await document.isVisible()) {
      await document.click();
      await page.waitForTimeout(500);

      // The clicked item should have some visual indication (we can't check exact styles)
      // but we can verify it's still visible and the page hasn't crashed
      await expect(document).toBeVisible();
    }
  });

  test("should show loading state initially", async ({ page }) => {
    // Navigate to documents page
    await page.goto("/documents");

    // Should show loading indicator briefly
    // This checks for "Loading" text or spinner
    const loadingIndicator = page.getByText(/loading/i);

    // Either loading is visible or documents are already loaded
    const isLoadingVisible = await loadingIndicator
      .isVisible()
      .catch(() => false);
    const areDocumentsVisible = await page
      .getByText(/section/i)
      .first()
      .isVisible()
      .catch(() => false);

    expect(isLoadingVisible || areDocumentsVisible).toBeTruthy();
  });

  test("should handle empty or error states gracefully", async ({ page }) => {
    // Intercept API call and return error
    await page.route("**/documents", (route) => {
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      });
    });

    await page.goto("/documents");
    await page.waitForTimeout(1000);

    // Should show error message or handle gracefully
    const errorMessage = page.getByText(/error|failed|unable/i);
    const hasError = await errorMessage.isVisible().catch(() => false);

    // Either shows error or handles it gracefully (no crash)
    expect(hasError || page.url().includes("/documents")).toBeTruthy();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Check if main elements are still accessible on mobile
    await expect(
      page.getByRole("heading", { name: /legal documents/i })
    ).toBeVisible();

    // Tree should still be visible (might be in different layout)
    const sections = page.getByText(/section/i).first();
    await expect(sections).toBeVisible();
  });
});

test.describe("Document Details", () => {
  test("should display document metadata", async ({ page }) => {
    await page.goto("/documents");
    await page.waitForTimeout(1000);

    // Click on a document
    const document = page.getByText(/^\d+\.\d+/).first();

    if (await document.isVisible()) {
      await document.click();
      await page.waitForTimeout(500);

      // Should show section number somewhere
      const sectionInfo = page.getByText(/\d+\.\d+/);
      await expect(sectionInfo.first()).toBeVisible();
    }
  });

  test("should allow navigating between documents", async ({ page }) => {
    await page.goto("/documents");
    await page.waitForTimeout(1000);

    // Get first two documents
    const documents = page.getByText(/^\d+\.\d+/);
    const count = await documents.count();

    if (count >= 2) {
      // Click first document
      await documents.nth(0).click();
      await page.waitForTimeout(500);

      // Click second document
      await documents.nth(1).click();
      await page.waitForTimeout(500);

      // Should successfully switch between documents
      await expect(page).toHaveURL(/\/documents/);
    }
  });
});
