"use client";

/**
 * DocumentContent Component
 *
 * Displays the content of a selected document.
 */

import {
  Box,
  Text,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Button,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { useDocument } from "@/lib/api";

interface DocumentContentProps {
  documentId: string | null;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export default function DocumentContent({
  documentId,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = false,
  hasNext = false,
}: DocumentContentProps) {
  const { data, isLoading, error } = useDocument(documentId || "", {
    enabled: !!documentId,
  });

  // This shouldn't happen with dynamic routing, but handle gracefully
  if (!documentId) {
    return (
      <Box
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={8}
      >
        <Text color="#5E6272" fontSize="lg">
          Select a section from the left to view its content
        </Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box
        h="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
        p={8}
      >
        <Spinner size="lg" color="#2800D7" />
        <Text ml={4} color="#5E6272">
          Loading content...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Alert status="error">
          <AlertIcon />
          Failed to load document content
        </Alert>
      </Box>
    );
  }

  if (!data) {
    return (
      <Box p={8}>
        <Alert status="warning">
          <AlertIcon />
          Document not found
        </Alert>
      </Box>
    );
  }

  return (
    <Box h="100%" display="flex" flexDirection="column">
      {/* Main Content Area - Scrollable */}
      <Box flex="1" overflowY="auto" p={8}>
        <VStack align="stretch" spacing={6}>
          {/* Document Header */}
          <Box>
            <Text fontSize="sm" color="#5E6272" fontWeight="medium" mb={2}>
              {data.metadata.main_section}
            </Text>
            <Heading size="lg" color="#32343C" mb={2}>
              {data.metadata.section}
            </Heading>
            <Box h="2px" w="60px" bg="#2800D7" />
          </Box>

          {/* Document Content */}
          <Box>
            <Text
              fontSize="md"
              color="#32343C"
              lineHeight="1.8"
              whiteSpace="pre-wrap"
              sx={{
                "& p": {
                  marginBottom: "1em",
                },
              }}
            >
              {data.text}
            </Text>
          </Box>

          {/* Metadata Footer */}
          <Box mt={8} pt={4} borderTop="1px solid" borderColor="#DBDCE1">
            <Text fontSize="xs" color="#5E6272">
              Section: {data.metadata.subsection_number}
            </Text>
          </Box>
        </VStack>
      </Box>

      {/* Navigation Footer - Fixed at Bottom */}
      <Box borderTop="1px solid" borderColor="#DBDCE1" p={4} bg="#FBFBFB">
        <HStack justify="space-between">
          <Button
            leftIcon={<Icon as={MdNavigateBefore} boxSize="20px" />}
            onClick={onNavigatePrev}
            isDisabled={!hasPrev}
            variant="outline"
            colorScheme="purple"
            size="md"
            _hover={{ bg: hasPrev ? "#EEEBFF" : undefined }}
          >
            Previous Section
          </Button>
          <Button
            rightIcon={<Icon as={MdNavigateNext} boxSize="20px" />}
            onClick={onNavigateNext}
            isDisabled={!hasNext}
            variant="outline"
            colorScheme="purple"
            size="md"
            _hover={{ bg: hasNext ? "#EEEBFF" : undefined }}
          >
            Next Section
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
