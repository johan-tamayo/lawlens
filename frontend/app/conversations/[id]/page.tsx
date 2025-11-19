"use client";

/**
 * Individual Conversation Page
 *
 * Displays a specific conversation based on the dynamic route parameter.
 */

import ChatInterface from "@/app/conversations/_components/ChatInterface";

interface ConversationPageProps {
  params: {
    id: string;
  };
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const conversationId = params.id;

  return <ChatInterface conversationId={conversationId} />;
}
