"use client";

/**
 * Landing Page
 *
 * Main entry point for the Westeros Legal Documents application.
 */

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  SimpleGrid,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import {
  HiDocumentText,
  HiChatBubbleLeftRight,
  HiSparkles,
  HiArrowRight,
} from "react-icons/hi2";

export default function Page() {
  const router = useRouter();

  const features = [
    {
      icon: HiDocumentText,
      title: "Browse Legal Documents",
      description:
        "Explore organized sections of Westeros laws and regulations with an intuitive tree structure.",
      action: "View Documents",
      path: "/documents",
      color: "purple",
    },
    {
      icon: HiChatBubbleLeftRight,
      title: "Ask Questions",
      description:
        "Have a conversation with our AI assistant to query across all legal documents with citations.",
      action: "Start Conversation",
      path: "/conversations",
      color: "blue",
    },
  ];

  const highlights = [
    {
      icon: HiSparkles,
      title: "AI-Powered Search",
      description:
        "Get instant answers with relevant citations from legal texts",
    },
    {
      icon: HiDocumentText,
      title: "Organized Content",
      description: "Navigate through categorized sections and subsections",
    },
    {
      icon: HiChatBubbleLeftRight,
      title: "Multi-Turn Conversations",
      description: "Ask follow-up questions that maintain context",
    },
  ];

  return (
    <Box minH="full" bg="white">
      {/* Hero Section */}
      <Box
        bg={useColorModeValue("purple.50", "purple.900")}
        borderBottom="1px solid"
        borderColor="gray.200"
      >
        <Container maxW="6xl" py={20}>
          <VStack spacing={6} textAlign="center">
            <Icon as={HiDocumentText} boxSize={24} color="purple.600" />
            <Heading
              as="h1"
              size="2xl"
              color="gray.800"
              fontWeight="bold"
              letterSpacing="tight"
            >
              Westeros Legal Documents
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Your comprehensive resource for exploring and querying the laws
              and regulations of the Seven Kingdoms
            </Text>
            <HStack spacing={4} pt={4}>
              <Button
                size="lg"
                colorScheme="purple"
                leftIcon={<Icon as={HiDocumentText} />}
                onClick={() => router.push("/documents")}
                _hover={{ transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                Browse Documents
              </Button>
              <Button
                size="lg"
                variant="outline"
                colorScheme="purple"
                leftIcon={<Icon as={HiChatBubbleLeftRight} />}
                onClick={() => router.push("/conversations")}
                _hover={{ transform: "translateY(-2px)" }}
                transition="all 0.2s"
              >
                Start Asking
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="6xl" py={20}>
        <VStack spacing={16}>
          {/* Main Features */}
          <VStack spacing={6} textAlign="center">
            <Heading size="lg" color="gray.800">
              Two Powerful Ways to Explore
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Whether you prefer browsing or asking questions, we&apos;ve got
              you covered
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
            {features.map((feature, idx) => (
              <Box
                key={idx}
                p={8}
                bg="white"
                borderRadius="xl"
                border="2px solid"
                borderColor="gray.200"
                _hover={{
                  borderColor: `${feature.color}.400`,
                  transform: "translateY(-4px)",
                  shadow: "xl",
                }}
                transition="all 0.3s"
                cursor="pointer"
                onClick={() => router.push(feature.path)}
              >
                <VStack align="start" spacing={4}>
                  <Flex
                    w={16}
                    h={16}
                    align="center"
                    justify="center"
                    borderRadius="xl"
                    bg={`${feature.color}.100`}
                  >
                    <Icon
                      as={feature.icon}
                      boxSize={8}
                      color={`${feature.color}.600`}
                    />
                  </Flex>
                  <Heading size="md" color="gray.800">
                    {feature.title}
                  </Heading>
                  <Text color="gray.600" lineHeight="tall">
                    {feature.description}
                  </Text>
                  <Button
                    colorScheme={feature.color}
                    variant="ghost"
                    rightIcon={<Icon as={HiArrowRight} />}
                    _hover={{ bg: `${feature.color}.50` }}
                  >
                    {feature.action}
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Footer */}
      <Box borderTop="1px solid" borderColor="gray.200" py={8} bg="gray.50">
        <Container maxW="6xl">
          <Text textAlign="center" color="gray.600" fontSize="sm">
            Westeros Legal Documents System • Powered by Norm.AI
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
