import type { Metadata } from "next";
import { Suspense } from "react";
import { Hanken_Grotesk, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import RouteNotice from "@/components/ui/RouteNotice";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "WorkHub | Trusted Hyperlocal Services Marketplace",
  description: "Find and book verified, top-rated local professionals for electrical, plumbing, carpentry, AC repair, and home services on WorkHub.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-[#0d1c2e]">
        <Suspense fallback={null}>
          <RouteNotice />
        </Suspense>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
