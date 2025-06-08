import "@/styles/globals.css";

import { Geist } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  description: "Share links, files, or notes, temporarily - just typit.in.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
