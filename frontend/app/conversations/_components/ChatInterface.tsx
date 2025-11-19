"use client";

/**
 * ChatInterface Component
 *
 * Main chat interface for sending messages and viewing conversation.
 */

import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HiPaperAirplane } from "react-icons/hi2";
import { useConversation, useSendMessage } from "@/lib/api/hooks";
import { Message } from "@/lib/api/conversation-types";
import MessageBubble from "./MessageBubble";
import EmptyConversationState from "./EmptyConversationState";

interface ChatInterfaceProps {
  conversationId: string;
}

export default function ChatInterface({ conversationId }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState("");
  const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const toast = useToast();

  const { data: conversation, isLoading } = useConversation(conversationId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  // Combine actual messages with optimistic messages
  const allMessages = [
    ...(conversation?.messages || []),
    ...optimisticMessages,
  ];

  const handleSuggestionClick = useCallback(
    (question: string) => {
      // Optimistically add user message immediately
      const userMessage: Message = {
        role: "user",
        content: question,
        citations: [],
        timestamp: new Date().toISOString(),
      };
      setOptimisticMessages([userMessage]);

      // Send the message to backend
      sendMessage(
        {
          conversationId,
          message: question,
        },
        {
          onSuccess: () => {
            // Clear optimistic messages - real messages will come from refetch
            setOptimisticMessages([]);
          },
          onError: () => {
            // Remove optimistic message on error
            setOptimisticMessages([]);
            toast({
              title: "Error",
              description: "Failed to send message",
              status: "error",
              duration: 3000,
            });
          },
        }
      );
    },
    [conversationId, sendMessage, toast]
  );

  // Check for initial message from sessionStorage and send it
  useEffect(() => {
    const storageKey = `initial_message_${conversationId}`;
    const initialMessage = sessionStorage.getItem(storageKey);

    if (initialMessage && conversation && conversation.messages.length === 0) {
      // Remove from storage immediately to prevent re-sending
      sessionStorage.removeItem(storageKey);

      // Send the initial message using the existing handler
      handleSuggestionClick(initialMessage);
    }
  }, [conversationId, conversation, handleSuggestionClick]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation?.messages, optimisticMessages]);

  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (!message || isSending) return;

    // Optimistically add user message immediately
    const userMessage: Message = {
      role: "user",
      content: message,
      citations: [],
      timestamp: new Date().toISOString(),
    };
    setOptimisticMessages([userMessage]);
    setInputMessage("");

    // Send to backend
    sendMessage(
      {
        conversationId,
        message,
      },
      {
        onSuccess: () => {
          // Clear optimistic messages - real messages will come from refetch
          setOptimisticMessages([]);
        },
        onError: () => {
          // Remove optimistic message on error
          setOptimisticMessages([]);
          toast({
            title: "Error",
            description: "Failed to send message",
            status: "error",
            duration: 3000,
          });
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <Flex h="full" align="center" justify="center">
        <Spinner size="xl" color="purple.500" />
      </Flex>
    );
  }

  if (!conversation) {
    return (
      <Flex h="full" align="center" justify="center" p={8}>
        <Text color="gray.500">Conversation not found</Text>
      </Flex>
    );
  }

  const hasMessages = allMessages.length > 0;

  return (
    <Flex direction="column" h="full">
      {/* Messages Area */}
      <Box flex={1} overflowY="auto" p={6}>
        {!hasMessages ? (
          <EmptyConversationState onSuggestionClick={handleSuggestionClick} />
        ) : (
          <Flex direction="column" gap={4} maxW="900px" mx="auto">
            {allMessages.map((message, idx) => (
              <MessageBubble key={idx} message={message} />
            ))}
            {isSending && (
              <Box alignSelf="flex-start">
                <Flex
                  bg="gray.100"
                  px={4}
                  py={3}
                  borderRadius="lg"
                  align="center"
                  gap={2}
                >
                  <Spinner size="sm" color="purple.500" />
                  <Text fontSize="sm" color="gray.600">
                    Thinking...
                  </Text>
                </Flex>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Flex>
        )}
      </Box>

      {/* Input Area */}
      <Box
        p={4}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="white"
        boxShadow="0 -2px 10px rgba(0,0,0,0.05)"
      >
        <Flex gap={2} maxW="900px" mx="auto">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Westeros laws..."
            disabled={isSending}
            size="lg"
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: "purple.400" }}
            _focus={{
              borderColor: "purple.500",
              boxShadow: "0 0 0 1px #2800D7",
            }}
          />
          <IconButton
            aria-label="Send message"
            icon={<Icon as={HiPaperAirplane} />}
            onClick={handleSendMessage}
            isLoading={isSending}
            isDisabled={!inputMessage.trim() || isSending}
            colorScheme="purple"
            size="lg"
          />
        </Flex>
      </Box>
    </Flex>
  );
}
