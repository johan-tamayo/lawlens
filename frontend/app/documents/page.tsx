"use client";

/**
 * Documents Root Page
 *
 * Default view when accessing /documents without a specific document ID.
 * Shows an empty state prompting the user to select a document.
 */

import { Box, Flex, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { HiDocumentText } from "react-icons/hi2";

export default function DocumentsPage() {
  return (
    <Flex
      h="full"
      direction="column"
      align="center"
      justify="center"
      px={8}
      py={12}
    >
      <Icon as={HiDocumentText} boxSize={20} color="purple.500" mb={6} />

      <Heading size="lg" mb={2} color="gray.800" textAlign="center">
        Westeros Legal Documents
      </Heading>

      <Text
        color="gray.600"
        mb={8}
        textAlign="center"
        maxW="500px"
        fontSize="lg"
      >
        Select a section from the sidebar to explore the laws and regulations of
        the Seven Kingdoms
      </Text>
    </Flex>
  );
}
