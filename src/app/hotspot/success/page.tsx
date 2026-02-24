"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Wifi,
  Clock,
  Zap,
  Activity,
  CheckCircle,
  Copy,
  RefreshCw,
  ArrowLeft,
  Gauge,
  Signal,
  Calendar,
  Printer,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface UsageStats {
  speed: string;
  dataUsed: string;
  timeRemaining: string;
  sessions: number;
  expiryTime: string;
}

// Loading skeleton for the hotspot success page
function HotspotSuccessSkeleton() {
  return (
    <main className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back to Home Link Skeleton */}
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Success Header Skeleton */}
        <div className="bg-gray-200 rounded-2xl p-8 mb-8 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-300 rounded" />
              <div className="h-4 w-48 bg-gray-300 rounded" />
            </div>
            <div className="h-16 w-24 bg-gray-300 rounded" />
          </div>
        </div>

        {/* Credentials Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gray-200 p-4">
            <div className="h-6 w-48 bg-gray-300 rounded" />
          </div>
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-4">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-8 w-40 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-16 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

// Main content component that uses useSearchParams
function HotspotSuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [usage, setUsage] = useState<UsageStats>({
    speed: "5 Mbps",
    dataUsed: "0 MB",
    timeRemaining: "59 min",
    sessions: 1,
    expiryTime: "",
  });

  const phone = searchParams.get("phone");
  const amount = searchParams.get("amount");
  const transactionId = searchParams.get("transactionId");
  const plan = searchParams.get("plan");

  useEffect(() => {
    // Simulate loading credentials and usage data
    const timer = setTimeout(() => {
      const hotspotPassword = `ISP${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Calculate expiry time (1 hour from now for demo)
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      setCredentials({
        username: phone || "254741091661",
        password: hotspotPassword,
      });

      setUsage({
        speed:
          amount === "10" ? "5 Mbps" : amount === "25" ? "5 Mbps" : "10 Mbps",
        dataUsed: "0 MB",
        timeRemaining: "60 min",
        sessions: 1,
        expiryTime: expiryDate.toLocaleTimeString(),
      });

      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [phone, amount]);

  if (loading) {
    return (
      <main className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-navy-dark mb-2">
            Activating Your Hotspot
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your connection...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-6 transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Link>

        {/* Success Header */}
        <div className="bg-linear-to-r from-amber-500 to-amber-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center mb-2">
                <CheckCircle className="w-6 h-6 mr-2" />
                <h1 className="text-2xl font-bold">Payment Successful!</h1>
              </div>
              <p className="text-white/90">
                Your hotspot is now active. KES {amount} paid via M-Pesa
              </p>
              <p className="text-xs text-white/70 mt-2">
                Transaction ID: {transactionId}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm text-white/80">Status</p>
              <p className="font-semibold flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse" />
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-navy p-4">
            <span className="text-lg font-semibold text-white flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-amber-500" />
              Your Hotspot Credentials
            </span>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-off-white rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Username</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-mono font-bold text-navy-dark">
                    {credentials.username}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(credentials.username);
                      alert("Username copied!");
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 group"
                    aria-label="Copy username"
                  >
                    <Copy className="w-4 h-4 text-gray-500 group-hover:text-amber-500 transition-colors duration-200" />
                  </button>
                </div>
              </div>

              <div className="bg-off-white rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Password</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-mono font-bold text-navy-dark">
                    {credentials.password}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(credentials.password);
                      alert("Password copied!");
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 group"
                    aria-label="Copy password"
                  >
                    <Copy className="w-4 h-4 text-gray-500 group-hover:text-amber-500 transition-colors duration-200" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Gauge className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {usage.speed}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Connection Speed</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {usage.dataUsed}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Data Used</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {usage.timeRemaining}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Time Remaining</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Signal className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {usage.sessions}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Active Sessions</p>
          </div>
        </div>

        {/* Connection Details & Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* WiFi Network Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-navy-dark mb-4">
                Network Details
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Network Name (SSID)</span>
                  <span className="font-mono font-semibold text-navy-dark">
                    Aderoute-Hotspot
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">Security Type</span>
                  <span className="font-mono font-semibold text-navy-dark">
                    WPA2-PSK
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-200">
                  <span className="text-gray-600">IP Assignment</span>
                  <span className="font-mono font-semibold text-navy-dark">
                    DHCP
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Expires At</span>
                  <span className="font-mono font-semibold text-navy-dark">
                    {usage.expiryTime}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-navy-dark mb-6">
                Quick Actions
              </h3>
              <div className="flex flex-col space-y-3">
                <Link href="/quick-pay" className="w-full">
                  <button className="w-full bg-amber-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-amber-600 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg">
                    Buy Another Plan
                  </button>
                </Link>

                <button
                  onClick={() => window.print()}
                  className="w-full border-2 border-navy text-navy py-3 px-4 rounded-xl font-medium hover:bg-navy hover:text-amber-500 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Credentials
                </button>

                <Link href="/support" className="w-full">
                  <button className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Need Help?
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Instructions */}
        <div className="mt-8 bg-amber-50 rounded-xl p-6 border border-amber-200">
          <h3 className="font-semibold text-navy-dark mb-4 text-lg">
            How to Connect
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0 mt-0.5">
                1
              </span>
              <div>
                <p className="font-medium text-navy-dark">Find Network</p>
                <p className="text-sm text-gray-600">
                  Search for "Aderoute-Hotspot" in WiFi settings
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0 mt-0.5">
                2
              </span>
              <div>
                <p className="font-medium text-navy-dark">Enter Credentials</p>
                <p className="text-sm text-gray-600">
                  Use the username and password above
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0 mt-0.5">
                3
              </span>
              <div>
                <p className="font-medium text-navy-dark">Start Browsing</p>
                <p className="text-sm text-gray-600">
                  You'll be automatically connected
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-6 p-4 bg-amber-50/50 rounded-xl border border-amber-200">
          <p className="text-sm text-gray-700 text-center flex items-center justify-center">
            <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
            <span className="font-semibold">Save these credentials.</span>&nbsp;
            You'll need them to reconnect. Your session expires at{" "}
            {usage.expiryTime}.
          </p>
        </div>
      </div>
    </main>
  );
}

// Main export with Suspense
export default function HotspotSuccessPage() {
  return (
    <Suspense fallback={<HotspotSuccessSkeleton />}>
      <HotspotSuccessContent />
    </Suspense>
  );
}
