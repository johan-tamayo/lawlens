"use client";

/**
 * Documents Layout
 *
 * Provides the two-panel layout with sidebar and content area for all document pages.
 */

import { Box, Flex } from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";
import DocumentTree from "./_components/DocumentTree";

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Extract document ID from pathname (/documents/123 -> 123)
  const selectedDocumentId = pathname.match(/^\/documents\/([^\/]+)$/)?.[1];

  const handleSelectDocument = useCallback(
    (documentId: string) => {
      router.push(`/documents/${documentId}`);
    },
    [router]
  );

  return (
    <Flex flex={1} direction="row" overflow="hidden">
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
          selectedDocumentId={selectedDocumentId}
        />
      </Box>

      {/* Right Content Area - Document Display */}
      <Box flex={1} bg="white">
        {children}
      </Box>
    </Flex>
  );
}
