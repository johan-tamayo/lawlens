"use client";

/**
 * Documents Page
 *
 * Displays a tree view of document sections on the left and content on the right.
 */

import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import HeaderNav from "@/app/_components/HeaderNav";
import DocumentTree from "@/app/documents/_components/DocumentTree";
import DocumentContent from "@/app/documents/_components/DocumentContent";

export default function DocumentsPage() {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );

  const handleSelectDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
  };

  const handleSignOut = () => {
    // TODO: Implement sign out functionality
    console.log("Sign out clicked");
  };

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <HeaderNav signOut={handleSignOut} />

      {/* Main Content Area */}
      <Flex flex={1} overflow="hidden">
        {/* Left Sidebar - Document Tree */}
        <Box
          w="350px"
          borderRight="1px solid"
          borderColor="#DBDCE1"
          bg="#FBFBFB"
          overflowY="auto"
        >
          <DocumentTree
            onSelectDocument={handleSelectDocument}
            selectedDocumentId={selectedDocumentId || undefined}
          />
        </Box>

        {/* Right Content Area - Document Display */}
        <Box flex={1} bg="white" overflowY="auto">
          <DocumentContent documentId={selectedDocumentId} />
        </Box>
      </Flex>
    </Box>
  );
}
