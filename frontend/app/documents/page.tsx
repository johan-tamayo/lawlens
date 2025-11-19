"use client";

/**
 * Documents Root Page
 *
 * Default view when accessing /documents without a specific document ID.
 * Shows an empty state prompting the user to select a document.
 */

import { Box, Text } from "@chakra-ui/react";

export default function DocumentsPage() {
  return (
    <Box
      h="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
    >
      <Text color="#5E6272" fontSize="lg" textAlign="center">
        Select a section from the left to view its content
      </Text>
    </Box>
  );
}
