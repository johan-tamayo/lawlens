import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Box, ChakraProvider } from "@chakra-ui/react";
import { QueryProvider } from "@/lib/query/provider";
import HeaderNavWrapper from "./_components/HeaderNavWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Norm Ai Takehome",
  description: "Full-Stack take home exercise for Norm Ai.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ChakraProvider>
            <Box h="100vh" display="flex" flexDirection="column">
              <HeaderNavWrapper />

              {children}
            </Box>
          </ChakraProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
