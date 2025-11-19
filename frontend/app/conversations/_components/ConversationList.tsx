"use client";

/**
 * ConversationList Component
 *
 * Displays a list of all conversations with create button.
 */

import {
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { HiPlus, HiTrash } from "react-icons/hi2";
import {
  useConversations,
  useCreateConversation,
  useDeleteConversation,
} from "@/lib/api/hooks";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void;
  selectedConversationId?: string;
}

export default function ConversationList({
  onSelectConversation,
  selectedConversationId,
}: ConversationListProps) {
  const router = useRouter();
  const toast = useToast();
  const { data, isLoading } = useConversations();
  const { mutate: createConversation, isPending: isCreating } =
    useCreateConversation();
  const { mutate: deleteConversation } = useDeleteConversation();

  const handleNewConversation = () => {
    createConversation(
      { title: "New Conversation" },
      {
        onSuccess: (conversation) => {
          router.push(`/conversations/${conversation.id}`);
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create conversation",
            status: "error",
            duration: 3000,
          });
        },
      }
    );
  };

  const handleDeleteConversation = (
    e: React.MouseEvent,
    conversationId: string
  ) => {
    e.stopPropagation(); // Prevent triggering onSelectConversation

    deleteConversation(conversationId, {
      onSuccess: () => {
        if (selectedConversationId === conversationId) {
          router.push("/conversations");
        }
        toast({
          title: "Conversation deleted",
          status: "success",
          duration: 2000,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete conversation",
          status: "error",
          duration: 3000,
        });
      },
    });
  };

  return (
    <Flex direction="column" h="full">
      {/* Header with New Conversation Button */}
      <Box p={4} borderBottom="1px solid" borderColor="#DBDCE1">
        <Button
          w="full"
          colorScheme="purple"
          leftIcon={<Icon as={HiPlus} />}
          onClick={handleNewConversation}
          isLoading={isCreating}
        >
          New Conversation
        </Button>
      </Box>

      {/* Conversations List */}
      <Box flex={1} overflowY="auto">
        {isLoading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner color="purple.500" />
          </Flex>
        ) : !data || data.conversations.length === 0 ? (
          <Box p={4} textAlign="center">
            <Text color="gray.500" fontSize="sm">
              No conversations yet.
              <br />
              Start a new one!
            </Text>
          </Box>
        ) : (
          data.conversations.map((conversation) => (
            <Flex
              key={conversation.id}
              px={4}
              py={3}
              cursor="pointer"
              bg={
                selectedConversationId === conversation.id
                  ? "#EEEBFF"
                  : "transparent"
              }
              borderLeft="3px solid"
              borderColor={
                selectedConversationId === conversation.id
                  ? "#2800D7"
                  : "transparent"
              }
              _hover={{
                bg:
                  selectedConversationId === conversation.id
                    ? "#EEEBFF"
                    : "gray.50",
              }}
              onClick={() => onSelectConversation(conversation.id)}
              align="center"
              gap={2}
            >
              <Box flex={1} minW={0}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.800"
                  noOfLines={1}
                  mb={1}
                >
                  {conversation.title}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {conversation.messages.length} message
                  {conversation.messages.length !== 1 ? "s" : ""} •{" "}
                  {formatDistanceToNow(new Date(conversation.updated_at), {
                    addSuffix: true,
                  })}
                </Text>
              </Box>
              <IconButton
                aria-label="Delete conversation"
                icon={<HiTrash />}
                size="sm"
                variant="ghost"
                colorScheme="red"
                onClick={(e) => handleDeleteConversation(e, conversation.id)}
              />
            </Flex>
          ))
        )}
      </Box>
    </Flex>
  );
}
