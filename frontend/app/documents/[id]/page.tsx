"use client";

/**
 * Individual Document Page
 *
 * Displays a specific document based on the dynamic route parameter.
 */

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import DocumentContent from "@/app/documents/_components/DocumentContent";
import { useDocuments } from "@/lib/api";

interface DocumentPageProps {
  params: {
    id: string;
  };
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const router = useRouter();
  const { data } = useDocuments();
  const documentId = params.id;

  // Create a flat list of all document IDs in order
  const documentIds = useMemo(() => {
    if (!data?.documents) return [];

    // Sort documents by section number
    const sorted = [...data.documents].sort((a, b) => {
      const aParts = a.subsection_number.split(".").map(Number);
      const bParts = b.subsection_number.split(".").map(Number);

      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aVal = aParts[i] || 0;
        const bVal = bParts[i] || 0;
        if (aVal !== bVal) return aVal - bVal;
      }
      return 0;
    });

    return sorted.map((doc) => doc.id);
  }, [data]);

  // Find current index and determine if prev/next exist
  const currentIndex = documentIds.indexOf(documentId);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < documentIds.length - 1;

  const handleNavigatePrev = () => {
    if (hasPrev) {
      router.push(`/documents/${documentIds[currentIndex - 1]}`);
    }
  };

  const handleNavigateNext = () => {
    if (hasNext) {
      router.push(`/documents/${documentIds[currentIndex + 1]}`);
    }
  };

  return (
    <DocumentContent
      documentId={documentId}
      onNavigatePrev={handleNavigatePrev}
      onNavigateNext={handleNavigateNext}
      hasPrev={hasPrev}
      hasNext={hasNext}
    />
  );
}
