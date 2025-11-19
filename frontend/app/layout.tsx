import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryProvider } from "@/lib/query/provider";

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
          <ChakraProvider>{children}</ChakraProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
