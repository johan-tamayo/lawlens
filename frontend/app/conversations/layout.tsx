"use client";

/**
 * Conversations Layout
 *
 * Provides the two-panel layout with sidebar and content area for conversation pages.
 */

import { Box, Flex } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import ConversationList from "./_components/ConversationList";

export default function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract conversation ID from pathname (/conversations/123 -> 123)
  const selectedConversationId = pathname.match(
    /^\/conversations\/([^\/]+)$/
  )?.[1];

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      router.push(`/conversations/${conversationId}`);
    },
    [router]
  );

  const handleCreateConversation = useCallback(() => {
    // This will be handled in the ConversationList component
    // which will create a conversation and navigate to it
  }, []);

  return (
    <Flex flex={1} direction="row" overflow="hidden">
      {/* Left Sidebar - Conversation List */}
      <Box
        w="350px"
        borderRight="1px solid"
        borderColor="#DBDCE1"
        bg="#FBFBFB"
        overflowY="auto"
      >
        <ConversationList
          onSelectConversation={handleSelectConversation}
          selectedConversationId={selectedConversationId}
        />
      </Box>

      {/* Right Content Area - Conversation Display */}
      <Box flex={1} bg="white">
        {children}
      </Box>
    </Flex>
  );
}
