import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AspectRatioProvider } from "../context/aspect-ratio-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ClipChat",
  description: "AI-powered video editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AspectRatioProvider>
          {children}
        </AspectRatioProvider>
      </body>
    </html>
  );
}
