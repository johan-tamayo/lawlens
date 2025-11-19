"use client";

/**
 * DocumentTree Component
 *
 * Tree view component for displaying sections and subsections.
 */

import { Box, Text, VStack, Spinner, Alert, AlertIcon } from "@chakra-ui/react";
import { useMemo } from "react";
import { useDocuments } from "@/lib/api";
import TreeSection, { type TreeNode } from "./TreeSection";

interface DocumentTreeProps {
  onSelectDocument: (documentId: string, sectionNumber: string) => void;
  selectedDocumentId?: string;
}

export default function DocumentTree({
  onSelectDocument,
  selectedDocumentId,
}: DocumentTreeProps) {
  const { data, isLoading, error } = useDocuments();

  // Build tree structure from flat document list with proper multi-level nesting
  const treeData = useMemo(() => {
    if (!data?.documents) return [];

    // Create a map to store all nodes by their section number
    const nodeMap = new Map<string, TreeNode>();

    // Sort documents by section number to ensure parents are created before children
    const sortedDocs = [...data.documents].sort((a, b) => {
      const aParts = a.subsection_number.split(".").map(Number);
      const bParts = b.subsection_number.split(".").map(Number);

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    });

    // Helper to truncate preview text
    const truncatePreview = (text: string, maxLength: number = 25): string => {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    };

    // Create placeholder main sections (1, 2, 3, etc.) from main_section field
    const mainSectionsMap = new Map<string, TreeNode>();

    sortedDocs.forEach((doc) => {
      const parts = doc.subsection_number.split(".");
      const mainSectionNum = parts[0];

      // Create main section placeholder if it doesn't exist
      if (!mainSectionsMap.has(mainSectionNum)) {
        const mainSectionNode: TreeNode = {
          id: "", // No ID - this is a placeholder, not a clickable document
          title: doc.main_section,
          sectionNumber: mainSectionNum,
          children: [],
        };
        mainSectionsMap.set(mainSectionNum, mainSectionNode);
        nodeMap.set(mainSectionNum, mainSectionNode);
      }
    });

    // Create all document nodes
    sortedDocs.forEach((doc) => {
      const node: TreeNode = {
        id: doc.id,
        title: truncatePreview(doc.preview),
        sectionNumber: doc.subsection_number,
        children: [],
      };

      nodeMap.set(doc.subsection_number, node);
    });

    // Build the tree by establishing parent-child relationships
    const tree: TreeNode[] = [];

    // Add main sections to root
    Array.from(mainSectionsMap.values())
      .sort((a, b) => Number(a.sectionNumber) - Number(b.sectionNumber))
      .forEach((mainSection) => {
        tree.push(mainSection);
      });

    // Link all documents to their parents
    sortedDocs.forEach((doc) => {
      const node = nodeMap.get(doc.subsection_number)!;
      const parts = doc.subsection_number.split(".");

      // Find parent (for 1.1 -> parent is 1, for 1.1.1 -> parent is 1.1)
      const parentNumber = parts.slice(0, -1).join(".");
      const parentNode = nodeMap.get(parentNumber);

      if (parentNode) {
        parentNode.children.push(node);
      }
    });

    return tree;
  }, [data]);

  if (isLoading) {
    return (
      <Box
        h="full"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        py={12}
      >
        <Spinner size="xl" color="purple.500" thickness="4px" mb={4} />
        <Text color="gray.600" fontSize="sm" fontWeight="medium">
          Loading sections...
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" variant="left-accent" borderRadius="md" m={4}>
        <AlertIcon />
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold">Failed to Load</Text>
          <Text fontSize="sm">Unable to retrieve documents</Text>
        </VStack>
      </Alert>
    );
  }

  return (
    <VStack align="stretch" spacing={0}>
      {treeData.map((mainSection) => (
        <TreeSection
          key={mainSection.sectionNumber}
          node={mainSection}
          onSelect={onSelectDocument}
          selectedId={selectedDocumentId}
          level={0}
        />
      ))}
    </VStack>
  );
}
