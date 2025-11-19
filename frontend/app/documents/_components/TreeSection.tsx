"use client";

/**
 * TreeSection Component
 *
 * Renders a single tree node (section or subsection) with expand/collapse functionality.
 */

import { Box, Text, Icon } from "@chakra-ui/react";
import { useState } from "react";
import { MdExpandMore, MdChevronRight } from "react-icons/md";

export interface TreeNode {
  id: string;
  title: string;
  sectionNumber: string;
  children: TreeNode[];
}

interface TreeSectionProps {
  node: TreeNode;
  onSelect: (id: string, sectionNumber: string) => void;
  selectedId?: string;
  level: number;
}

export default function TreeSection({
  node,
  onSelect,
  selectedId,
  level,
}: TreeSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Start collapsed
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <Box>
      {/* Main section or subsection */}
      <Box
        px={4}
        py={2}
        pl={`${level * 16 + 16}px`}
        cursor="pointer"
        bg={isSelected ? "#EEEBFF" : "transparent"}
        borderLeft={isSelected ? "3px solid #2800D7" : "3px solid transparent"}
        _hover={{ bg: isSelected ? "#EEEBFF" : "#F7F7F8" }}
        onClick={() => {
          if (hasChildren) {
            setIsExpanded(!isExpanded);
          }
          if (node.id) {
            onSelect(node.id, node.sectionNumber);
          }
        }}
      >
        <Box display="flex" alignItems="center">
          {hasChildren && (
            <Icon
              as={isExpanded ? MdExpandMore : MdChevronRight}
              boxSize="20px"
              mr={1}
              color="#5E6272"
            />
          )}
          <Box>
            <Text
              fontSize="sm"
              fontWeight={level === 0 ? "bold" : "medium"}
              color={isSelected ? "#2800D7" : "#32343C"}
            >
              {node.sectionNumber}. {node.title}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Children subsections */}
      {hasChildren && isExpanded && (
        <Box>
          {node.children.map((child) => (
            <TreeSection
              key={child.sectionNumber}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
              level={level + 1}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
