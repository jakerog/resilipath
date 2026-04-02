import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ResiliPath - Modular Resilience SaaS",
  description: "Next-generation Resilience Exercise Execution Engine",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2c3e50",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-[#f4f7f6]`}>
        {children}
      </body>
    </html>
  );
}
