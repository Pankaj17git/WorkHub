import type { Metadata } from "next";
import { Hanken_Grotesk, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";

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

const fontLinks: {
  rel: string;
  href: string;
  crossOrigin?: "anonymous" | "use-credentials";
}[] = [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  { rel: "preconnect", href: "https://api.fontshare.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap",
  },
];

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
      <head>
        {fontLinks.map((link) => (
          <link key={link.href} {...link} />
        ))}
      </head>
      <body className="min-h-full flex flex-col bg-[#f8f9ff] text-[#0d1c2e]">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
