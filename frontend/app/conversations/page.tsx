"use client";

/**
 * Conversations Index Page
 *
 * Shows an empty state when no conversation is selected.
 */

import { Box, Button, Flex, Heading, Icon, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import { useCreateConversation, useSendMessage } from "@/lib/api/hooks";

export default function ConversationsPage() {
  const router = useRouter();
  const { mutate: createConversation, isPending } = useCreateConversation();
  const { mutate: sendMessage } = useSendMessage();

  const handleNewConversation = () => {
    createConversation(
      { title: "New Conversation" },
      {
        onSuccess: (conversation) => {
          router.push(`/conversations/${conversation.id}`);
        },
      }
    );
  };

  const handleStartWithQuestion = (question: string) => {
    createConversation(
      { title: question.slice(0, 50) },
      {
        onSuccess: (conversation) => {
          // Store the initial message to send after navigation
          sessionStorage.setItem(
            `initial_message_${conversation.id}`,
            question
          );
          // Navigate immediately to show the conversation page
          router.push(`/conversations/${conversation.id}`);
        },
      }
    );
  };

  const sampleQuestions = [
    "What is the punishment for theft in Westeros?",
    "What are the rules about succession?",
    "Can a lord disinherit their heir?",
    "What happens if I break a guest right?",
  ];

  return (
    <Flex
      h="full"
      direction="column"
      align="center"
      justify="center"
      px={8}
      py={12}
    >
      <Icon as={HiChatBubbleLeftRight} boxSize={20} color="purple.500" mb={6} />

      <Heading size="lg" mb={2} color="gray.800">
        Start a New Conversation
      </Heading>

      <Text color="gray.600" mb={8} textAlign="center" maxW="500px">
        Ask questions about the laws of Westeros. I&apos;ll search through the
        legal documents and provide answers with citations.
      </Text>

      <Button
        colorScheme="purple"
        size="lg"
        mb={12}
        onClick={handleNewConversation}
        isLoading={isPending}
        leftIcon={<Icon as={HiChatBubbleLeftRight} />}
      >
        New Conversation
      </Button>

      <Box w="full" maxW="600px">
        <Text
          fontSize="sm"
          fontWeight="semibold"
          color="gray.700"
          mb={3}
          textTransform="uppercase"
          letterSpacing="wide"
        >
          Sample Questions
        </Text>
        <Flex direction="column" gap={2}>
          {sampleQuestions.map((question, idx) => (
            <Box
              key={idx}
              px={4}
              py={3}
              bg="gray.50"
              borderRadius="md"
              borderLeft="3px solid"
              borderColor="purple.400"
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => handleStartWithQuestion(question)}
            >
              <Text fontSize="sm" color="gray.700">
                {question}
              </Text>
            </Box>
          ))}
        </Flex>
      </Box>
    </Flex>
  );
}
