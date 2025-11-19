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
  Flex,
  Badge,
} from "@chakra-ui/react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";
import { HiDocumentText } from "react-icons/hi2";
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
      <Flex
        h="full"
        direction="column"
        align="center"
        justify="center"
        px={8}
        py={12}
      >
        <Icon as={HiDocumentText} boxSize={16} color="purple.400" mb={4} />
        <Text color="gray.600" fontSize="lg" textAlign="center">
          Select a section from the left to view its content
        </Text>
      </Flex>
    );
  }

  if (isLoading) {
    return (
      <Flex
        h="full"
        direction="column"
        align="center"
        justify="center"
        px={8}
        py={12}
      >
        <Spinner size="xl" color="purple.500" thickness="4px" mb={4} />
        <Text color="gray.600" fontSize="md">
          Loading document...
        </Text>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex h="full" align="center" justify="center" px={8}>
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          py={8}
        >
          <AlertIcon boxSize={10} mr={0} mb={4} />
          <Heading size="md" mb={2}>
            Failed to Load Document
          </Heading>
          <Text>Unable to fetch document content. Please try again.</Text>
        </Alert>
      </Flex>
    );
  }

  if (!data) {
    return (
      <Flex h="full" align="center" justify="center" px={8}>
        <Alert
          status="warning"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          py={8}
        >
          <AlertIcon boxSize={10} mr={0} mb={4} />
          <Heading size="md" mb={2}>
            Document Not Found
          </Heading>
          <Text>The requested document could not be located.</Text>
        </Alert>
      </Flex>
    );
  }

  return (
    <Box h="full" display="flex" flexDirection="column">
      {/* Main Content Area - Scrollable */}
      <Box flex="1" overflowY="auto" p={8}>
        <VStack align="stretch" spacing={6} maxW="900px" mx="auto">
          {/* Document Header */}
          <Box>
            <HStack spacing={3} mb={3}>
              <Badge colorScheme="purple" fontSize="xs" px={2} py={1}>
                {data.metadata.main_section}
              </Badge>
              <Badge
                variant="outline"
                colorScheme="gray"
                fontSize="xs"
                px={2}
                py={1}
              >
                Section {data.metadata.subsection_number}
              </Badge>
            </HStack>
            <Heading size="xl" color="gray.800" mb={3}>
              {data.metadata.section}
            </Heading>
            <Box h="3px" w="80px" bg="purple.500" borderRadius="full" />
          </Box>

          {/* Document Content */}
          <Box
            p={6}
            bg="gray.50"
            borderRadius="lg"
            borderLeft="4px solid"
            borderColor="purple.400"
          >
            <Text
              fontSize="md"
              color="gray.800"
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
          <Box
            mt={4}
            pt={4}
            borderTop="2px solid"
            borderColor="gray.200"
            color="gray.500"
          >
            <Flex align="center" gap={2}>
              <Icon as={HiDocumentText} boxSize={4} />
              <Text fontSize="sm" fontWeight="medium">
                Legal Document Reference
              </Text>
            </Flex>
          </Box>
        </VStack>
      </Box>

      {/* Navigation Footer - Fixed at Bottom */}
      <Box
        borderTop="1px solid"
        borderColor="gray.200"
        p={4}
        bg="gray.50"
        boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      >
        <HStack justify="space-between" maxW="900px" mx="auto">
          <Button
            leftIcon={<Icon as={MdNavigateBefore} />}
            onClick={onNavigatePrev}
            isDisabled={!hasPrev}
            variant="outline"
            colorScheme="purple"
            size="md"
          >
            Previous
          </Button>
          <Button
            rightIcon={<Icon as={MdNavigateNext} />}
            onClick={onNavigateNext}
            isDisabled={!hasNext}
            variant="outline"
            colorScheme="purple"
            size="md"
          >
            Next
          </Button>
        </HStack>
      </Box>
    </Box>
  );
}
