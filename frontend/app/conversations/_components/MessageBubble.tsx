"use client";

/**
 * MessageBubble Component
 *
 * Displays a single message (user or assistant) with citations.
 */

import {
  Box,
  Collapse,
  Flex,
  Icon,
  IconButton,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { HiChevronDown, HiChevronUp, HiUser } from "react-icons/hi2";
import { RiRobot2Fill } from "react-icons/ri";
import { Message } from "@/lib/api/conversation-types";
import { useDocuments } from "@/lib/api/hooks";
import { formatDistanceToNow } from "date-fns";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const router = useRouter();
  const { isOpen, onToggle } = useDisclosure();
  const { data: documentsData } = useDocuments();

  const isUser = message.role === "user";
  const hasCitations = message.citations && message.citations.length > 0;

  const findDocumentBySection = (sectionName: string): string | null => {
    if (!documentsData?.documents) return null;

    // The citation source might be like "Section 3.1" or just the section name
    // Try to find a document that matches
    const doc = documentsData.documents.find(
      (d) =>
        d.section === sectionName ||
        d.section.toLowerCase().includes(sectionName.toLowerCase()) ||
        sectionName.toLowerCase().includes(d.section.toLowerCase())
    );

    return doc?.id || null;
  };

  return (
    <Flex
      direction="column"
      alignSelf={isUser ? "flex-end" : "flex-start"}
      maxW="80%"
      gap={2}
    >
      {/* Message Header */}
      <Flex align="center" gap={2} px={2}>
        <Flex
          w={8}
          h={8}
          align="center"
          justify="center"
          borderRadius="full"
          bg={isUser ? "purple.100" : "gray.100"}
          color={isUser ? "purple.700" : "gray.700"}
        >
          <Icon as={isUser ? HiUser : RiRobot2Fill} boxSize={4} />
        </Flex>
        <Text fontSize="sm" fontWeight="semibold" color="gray.700">
          {isUser ? "You" : "Assistant"}
        </Text>
        <Text fontSize="xs" color="gray.400">
          {formatDistanceToNow(new Date(message.timestamp), {
            addSuffix: true,
          })}
        </Text>
      </Flex>

      {/* Message Content */}
      <Box
        bg={isUser ? "purple.500" : "gray.100"}
        color={isUser ? "white" : "gray.800"}
        px={4}
        py={3}
        borderRadius="lg"
        boxShadow="sm"
      >
        <Text fontSize="md" whiteSpace="pre-wrap">
          {message.content}
        </Text>
      </Box>

      {/* Citations */}
      {hasCitations && (
        <Box>
          <Flex
            align="center"
            gap={2}
            cursor="pointer"
            onClick={onToggle}
            px={2}
            py={1}
            _hover={{ bg: "gray.50" }}
            borderRadius="md"
          >
            <Text fontSize="sm" color="purple.600" fontWeight="semibold">
              {message.citations.length} Citation
              {message.citations.length !== 1 ? "s" : ""}
            </Text>
            <Icon
              as={isOpen ? HiChevronUp : HiChevronDown}
              color="purple.600"
            />
          </Flex>

          <Collapse in={isOpen}>
            <Flex direction="column" gap={2} mt={2}>
              {message.citations.map((citation, idx) => {
                const documentId = findDocumentBySection(citation.source);
                return (
                  <Box
                    key={idx}
                    p={3}
                    bg="purple.50"
                    borderRadius="md"
                    borderLeft="3px solid"
                    borderColor="purple.400"
                    cursor="pointer"
                    _hover={{ bg: "purple.100" }}
                    onClick={() => {
                      if (documentId) {
                        router.push(`/documents/${documentId}`);
                      } else {
                        // Fallback to documents list if can't find specific doc
                        router.push("/documents");
                      }
                    }}
                  >
                    <Text
                      fontSize="xs"
                      fontWeight="bold"
                      color="purple.700"
                      mb={1}
                    >
                      {citation.source}
                      {documentId && (
                        <Text as="span" ml={2} color="purple.500">
                          → View Document
                        </Text>
                      )}
                    </Text>
                    <Text fontSize="xs" color="gray.700" noOfLines={3}>
                      {citation.text}
                    </Text>
                  </Box>
                );
              })}
            </Flex>
          </Collapse>
        </Box>
      )}
    </Flex>
  );
}
