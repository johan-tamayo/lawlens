import { apiClient, apiConfig } from "../client";

describe("API Client", () => {
  it("exports apiClient instance", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.GET).toBeDefined();
    expect(apiClient.POST).toBeDefined();
  });

  it("uses correct base URL from environment", () => {
    expect(apiConfig.baseUrl).toBe("http://localhost:8000");
  });

  it("apiConfig is exported", () => {
    // apiConfig is defined as const which provides readonly properties
    expect(apiConfig).toBeDefined();
    expect(apiConfig.baseUrl).toBeDefined();
  });

  it("respects NEXT_PUBLIC_API_URL environment variable", () => {
    // This test verifies the configuration is based on env variable
    const expectedUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    expect(apiConfig.baseUrl).toBe(expectedUrl);
  });
});
