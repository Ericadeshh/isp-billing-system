"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Wifi,
  History,
  Home,
  Activity,
  Zap,
  Settings,
  Menu,
  X,
  Briefcase,
} from "lucide-react";
import { useState } from "react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          {/* Header - Navy dominant with bright, visible links */}
          <header className="fixed top-0 left-0 right-0 z-50 bg-navy/95 backdrop-blur-sm border-b border-bottle shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16 sm:h-20">
                {/* Brand - Aderoute */}
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="bg-pumpkin p-2 rounded-lg group-hover:bg-pumpkin-light transition-colors shadow-md">
                    <Wifi className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl sm:text-2xl font-bold text-white">
                      Aderoute
                    </span>
                    <span className="text-xs text-salad hidden sm:block">
                      Fast & Reliable Internet
                    </span>
                  </div>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-2">
                  {/* Home */}
                  <Link
                    href="/"
                    className="p-2.5 text-white hover:text-salad rounded-full hover:bg-white/10 transition-all duration-200"
                    aria-label="Home"
                    title="Home"
                  >
                    <Home className="w-5 h-5" />
                  </Link>

                  {/* Hotspot Quick Pay - Pumpkin button */}
                  <Link
                    href="/quick-pay"
                    className="flex items-center space-x-2 px-4 py-2 bg-pumpkin text-white rounded-full hover:bg-pumpkin-light transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="font-medium">Hotspot</span>
                  </Link>

                  {/* PPPoE Dashboard - Bottle green themed */}
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 bg-bottle text-white rounded-full hover:bg-bottle-light transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span className="font-medium">Dashboard</span>
                  </Link>

                  {/* History - Salad green on hover */}
                  <Link
                    href="/history"
                    className="p-2.5 text-white hover:text-salad rounded-full hover:bg-white/10 transition-all duration-200"
                    aria-label="Payment History"
                    title="Payment History"
                  >
                    <History className="w-5 h-5" />
                  </Link>

                  {/* MikroTik Admin - Settings (only for admins) */}
                  <Link
                    href="/admin/mikrotik"
                    className="p-2.5 text-white/60 hover:text-salad rounded-full hover:bg-white/10 transition-all duration-200"
                    aria-label="MikroTik Setup"
                    title="MikroTik Admin"
                  >
                    <Settings className="w-5 h-5" />
                  </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2.5 text-salad hover:text-pumpkin rounded-full hover:bg-white/10 transition-all duration-200"
                  aria-label="Menu"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-navy border-t border-bottle/50 py-4 shadow-xl">
                <div className="container mx-auto px-4 flex flex-col space-y-2">
                  <Link
                    href="/"
                    className="flex items-center space-x-3 px-4 py-3 text-white hover:text-salad hover:bg-white/5 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Home className="w-5 h-5 text-salad" />
                    <span className="font-medium">Home</span>
                  </Link>

                  <Link
                    href="/quick-pay"
                    className="flex items-center space-x-3 px-4 py-3 bg-pumpkin/20 text-pumpkin hover:bg-pumpkin/30 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Zap className="w-5 h-5 text-pumpkin" />
                    <span className="font-medium">Hotspot (Quick Pay)</span>
                  </Link>

                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-3 px-4 py-3 bg-bottle/20 text-bottle hover:bg-bottle/30 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Briefcase className="w-5 h-5 text-bottle" />
                    <span className="font-medium">PPPoE Dashboard</span>
                  </Link>

                  <Link
                    href="/history"
                    className="flex items-center space-x-3 px-4 py-3 text-white hover:text-salad hover:bg-white/5 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <History className="w-5 h-5 text-salad" />
                    <span className="font-medium">Payment History</span>
                  </Link>

                  <Link
                    href="/admin/mikrotik"
                    className="flex items-center space-x-3 px-4 py-3 text-white/60 hover:text-salad hover:bg-white/5 rounded-lg transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">MikroTik Admin</span>
                  </Link>
                </div>
              </div>
            )}
          </header>

          {/* Spacer to prevent content from hiding under fixed header */}
          <div className="h-16 sm:h-20" />

          {/* Main Content */}
          <div className="relative min-h-[calc(100vh-8rem)]">{children}</div>

          {/* Footer */}
          <Footer />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
