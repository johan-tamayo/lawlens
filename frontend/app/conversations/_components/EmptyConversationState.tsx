"use client";

/**
 * EmptyConversationState Component
 *
 * Displays helpful prompts when a conversation has no messages yet.
 */

import { Box, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { HiSparkles } from "react-icons/hi2";

interface EmptyConversationStateProps {
  onSuggestionClick?: (question: string) => void;
}

export default function EmptyConversationState({
  onSuggestionClick,
}: EmptyConversationStateProps) {
  const suggestions = [
    {
      title: "Ask about punishments",
      example: "What is the punishment for theft in Westeros?",
    },
    {
      title: "Learn about succession",
      example: "What are the rules about succession and inheritance?",
    },
    {
      title: "Understand rights",
      example: "What rights do guests have under Westerosi law?",
    },
    {
      title: "Explore marriage laws",
      example: "What are the marriage laws in Westeros?",
    },
  ];

  return (
    <Flex
      h="full"
      direction="column"
      align="center"
      justify="center"
      maxW="800px"
      mx="auto"
      px={8}
    >
      <Icon as={HiSparkles} boxSize={16} color="purple.400" mb={6} />

      <Heading size="lg" mb={2} color="gray.800" textAlign="center">
        Start Your Conversation
      </Heading>

      <Text color="gray.600" mb={8} textAlign="center" fontSize="lg">
        Ask me anything about the laws of Westeros, and I&apos;ll provide
        detailed answers with citations from the legal documents.
      </Text>

      <Box w="full" maxW="600px">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color="gray.700"
          mb={4}
          textTransform="uppercase"
          letterSpacing="wide"
        >
          Try asking about
        </Text>
        <Flex direction="row" flexWrap="wrap" gap={3} justify="center">
          {suggestions.map((suggestion, idx) => (
            <Box
              key={idx}
              flex="1 1 45%"
              minW="200px"
              p={4}
              bg="purple.50"
              borderRadius="lg"
              borderLeft="3px solid"
              borderColor="purple.400"
              cursor={onSuggestionClick ? "pointer" : "default"}
              _hover={
                onSuggestionClick
                  ? { bg: "purple.100", transform: "translateY(-2px)" }
                  : {}
              }
              transition="all 0.2s"
              onClick={() => onSuggestionClick?.(suggestion.example)}
            >
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color="purple.700"
                mb={1}
              >
                {suggestion.title}
              </Text>
              <Text fontSize="xs" color="gray.600">
                &quot;{suggestion.example}&quot;
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>

      <Text fontSize="xs" color="gray.500" mt={8} textAlign="center">
        💡 Tip: I can handle follow-up questions and maintain context throughout
        the conversation.
      </Text>
    </Flex>
  );
}
