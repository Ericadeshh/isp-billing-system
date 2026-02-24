"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Link from "next/link";
import { Wifi, Home, Briefcase } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Aderoute | Internet Services</title>
        <meta
          name="description"
          content="Fast, reliable internet plans with M-Pesa payments"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ConvexClientProvider>
          {/* Header - Simplified for user-side */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm border-b border-amber-500/30 shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 sm:h-20">
                {/* Brand - Aderoute */}
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="bg-amber-500 p-2 rounded-lg group-hover:bg-amber-600 transition-colors shadow-md">
                    <Wifi className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-bold text-gray-800">
                      Aderoute
                    </span>
                    <span className="text-xs text-amber-400 hidden sm:block">
                      Fast & Reliable Internet
                    </span>
                  </div>
                </Link>

                {/* Desktop Navigation - Large screens */}
                <div className="hidden md:block">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                </div>

                {/* Mobile Navigation - Small screens */}
                <div className="md:hidden">
                  <Link
                    href="/dashboard"
                    className="p-2.5 text-gray-800 hover:text-amber-500 rounded-full hover:bg-white/10 transition-all duration-200"
                    aria-label="Dashboard"
                    title="Dashboard"
                  >
                    <Home className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </header>

          {/* Spacer to prevent content from hiding under fixed header */}
          <div className="h-16 sm:h-20" />

          {/* Main Content */}
          <div className="relative min-h-[calc(100vh-8rem)]">{children}</div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
