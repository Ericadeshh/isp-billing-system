"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Wifi,
  CheckCircle,
  Copy,
  Clock,
  Zap,
  Laptop,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Shield,
  User,
  Key,
  Settings,
  Download,
} from "lucide-react";
import Link from "next/link";

// Loading skeleton
function PppoeSuccessSkeleton() {
  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-8 w-48 bg-white/20 rounded-lg mx-auto animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// Main content component
function PppoeSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "failed"
  >("verifying");
  const [showPppoeConfig, setShowPppoeConfig] = useState(false);

  // Get params from URL
  const transactionId = searchParams.get("transactionId");
  const status = searchParams.get("status");
  const amount = searchParams.get("amount");
  const phone = searchParams.get("phone");
  const planId = searchParams.get("plan") as Id<"plans"> | null;

  // Fetch payment details from Convex
  const payment = useQuery(
    api.payments.queries.getPaymentByTransactionId,
    transactionId ? { transactionId } : "skip",
  );

  // Fetch customer details
  const customer = useQuery(
    api.customers.queries.getCustomerByPhone,
    phone ? { phone } : "skip",
  );

  // Fetch plan details
  const plan = useQuery(
    api.plans.queries.getPlan,
    planId ? { planId } : "skip",
  );

  // Auto-redirect countdown for failed payments
  useEffect(() => {
    if (status === "failed" || verificationStatus === "failed") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status, verificationStatus, router]);

  // Verify payment status
  useEffect(() => {
    if (payment) {
      if (payment.status === "completed") {
        setVerificationStatus("success");
      } else if (payment.status === "failed") {
        setVerificationStatus("failed");
      }
    } else if (status === "failed") {
      setVerificationStatus("failed");
    } else if (transactionId) {
      // Still verifying
      setVerificationStatus("verifying");
    }
  }, [payment, status, transactionId]);

  // Handle failed payment
  if (verificationStatus === "failed") {
    return (
      <main className="min-h-screen bg-linear-to-br from-red-50 to-orange-50 py-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-linear-to-r from-red-600 to-orange-600 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
              <p className="text-white/80 mt-2">
                Transaction was not completed
              </p>
            </div>

            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-700 text-sm">
                  Your payment could not be processed. This could be due to:
                </p>
                <ul className="text-sm text-red-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Insufficient M-Pesa balance</li>
                  <li>Transaction cancelled on your phone</li>
                  <li>Network error during processing</li>
                </ul>
              </div>

              <div className="space-y-4">
                <Link
                  href="/"
                  className="w-full bg-linear-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-200 flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Try Again
                </Link>

                <p className="text-center text-sm text-gray-500">
                  Redirecting in {countdown} seconds...
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Show loading while verifying
  if (verificationStatus === "verifying" || !payment || !customer || !plan) {
    return (
      <main className="min-h-screen bg-linear-to-br from-amber-50 to-orange-50 py-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8 text-center">
            <RefreshCw className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Verifying Your Payment
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your transaction...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Generate PPPoE credentials
  const pppoeUsername =
    customer.hotspotUsername ||
    `PPPOE${phone?.slice(-4)}${Math.floor(Math.random() * 1000)}`;
  const pppoePassword =
    customer.hotspotPassword ||
    Math.random().toString(36).substring(2, 10).toUpperCase();
  const routerIp = customer.routerIp || "192.168.1.1";

  // Calculate expiry time
  const expiryTime = payment.createdAt + plan.duration * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(expiryTime).toLocaleString();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  // Generate router configuration for different devices
  const routerConfigs = {
    windows: `PPPoe Connection Setup:
1. Go to Control Panel → Network and Sharing Center
2. Click "Set up a new connection or network"
3. Select "Connect to the Internet" → Next
4. Choose "Broadband (PPPoE)"
5. Enter:
   Username: ${pppoeUsername}
   Password: ${pppoePassword}
6. Click "Connect"`,

    macos: `PPPoE Setup on macOS:
1. Open System Preferences → Network
2. Click the "+" button to add a new service
3. Interface: PPPoE
4. Service Name: Aderoute PPPoE
5. Enter:
   Account Name: ${pppoeUsername}
   Password: ${pppoePassword}
6. Click "Create" → "Apply"`,

    linux: `PPPoE Setup on Linux (NetworkManager):
1. Open Settings → Network
2. Click the "+" button to add a new connection
3. Choose "DSL/PPPoE"
4. Enter:
   Username: ${pppoeUsername}
   Password: ${pppoePassword}
5. Save and connect`,

    router: `Router Configuration:
1. Log into your router (${routerIp})
2. Go to WAN/Internet Settings
3. Connection Type: PPPoE
4. Enter:
   Username: ${pppoeUsername}
   Password: ${pppoePassword}
5. Save settings and reboot`,
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 skew-y-12 transform -translate-x-1/2" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Payment Successful!
              </h1>
              <p className="text-white/80 mt-2">
                Your PPPoE connection is ready
              </p>
            </div>
          </div>

          {/* Payment Details */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Transaction ID:</span>
              <span className="font-mono text-sm text-gray-800">
                {transactionId}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="text-xl font-bold text-green-600">
                KES {amount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Plan:</span>
              <span className="font-semibold text-gray-800">{plan.name}</span>
            </div>
          </div>

          {/* PPPoE Credentials */}
          <div className="p-6 bg-linear-to-br from-blue-50 to-indigo-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Wifi className="w-5 h-5 text-blue-500 mr-2" />
              Your PPPoE Credentials
            </h2>

            <div className="space-y-4">
              {/* Username */}
              <div className="bg-white rounded-xl p-4 border border-blue-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Username
                    </p>
                    <p className="font-mono text-sm text-gray-800 break-all">
                      {pppoeUsername}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(pppoeUsername, "username")}
                    className="ml-2 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Copy
                      className={`w-4 h-4 ${copied === "username" ? "text-green-500" : "text-gray-400"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="bg-white rounded-xl p-4 border border-blue-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <Key className="w-3 h-3 mr-1" />
                      Password
                    </p>
                    <p className="font-mono text-sm text-gray-800 break-all">
                      {pppoePassword}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(pppoePassword, "password")}
                    className="ml-2 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Copy
                      className={`w-4 h-4 ${copied === "password" ? "text-green-500" : "text-gray-400"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Router IP */}
              <div className="bg-white rounded-xl p-4 border border-blue-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Router IP/Gateway
                    </p>
                    <p className="font-mono text-sm text-gray-800">
                      {routerIp}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(routerIp, "router")}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Copy
                      className={`w-4 h-4 ${copied === "router" ? "text-green-500" : "text-gray-400"}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Expiry Info */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span className="text-sm">Valid until:</span>
              </div>
              <span className="font-semibold text-gray-800">{expiryDate}</span>
            </div>

            {/* Setup Instructions Toggle */}
            <button
              onClick={() => setShowPppoeConfig(!showPppoeConfig)}
              className="w-full bg-blue-50 text-blue-700 py-3 rounded-xl font-medium hover:bg-blue-100 transition-all duration-200 flex items-center justify-center mb-4"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showPppoeConfig
                ? "Hide Setup Instructions"
                : "Show Setup Instructions"}
            </button>

            {/* Setup Instructions */}
            {showPppoeConfig && (
              <div className="space-y-4 mb-4">
                {/* Windows */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Laptop className="w-4 h-4 mr-2 text-blue-500" />
                    Windows Setup
                  </h3>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-lg">
                    {routerConfigs.windows}
                  </pre>
                </div>

                {/* macOS */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Laptop className="w-4 h-4 mr-2 text-blue-500" />
                    macOS Setup
                  </h3>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-lg">
                    {routerConfigs.macos}
                  </pre>
                </div>

                {/* Linux */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Laptop className="w-4 h-4 mr-2 text-blue-500" />
                    Linux Setup
                  </h3>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-lg">
                    {routerConfigs.linux}
                  </pre>
                </div>

                {/* Router */}
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Settings className="w-4 h-4 mr-2 text-blue-500" />
                    Router Setup
                  </h3>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50 p-3 rounded-lg">
                    {routerConfigs.router}
                  </pre>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const text = `PPPoE Credentials\nUsername: ${pppoeUsername}\nPassword: ${pppoePassword}\nRouter IP: ${routerIp}\nExpires: ${expiryDate}`;
                  copyToClipboard(text, "all");
                }}
                className="bg-white border-2 border-blue-500 text-blue-600 py-3 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </button>
              <Link
                href="/dashboard"
                className="bg-linear-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                My Dashboard
              </Link>
            </div>

            {/* Download Config */}
            <button
              onClick={() => {
                const config = `[Aderoute PPPoE Configuration]\n\nCredentials:\nUsername: ${pppoeUsername}\nPassword: ${pppoePassword}\nRouter IP: ${routerIp}\n\nSetup Instructions:\n${routerConfigs.windows}\n\n${routerConfigs.macos}\n\n${routerConfigs.linux}\n\n${routerConfigs.router}`;
                const blob = new Blob([config], { type: "text/plain" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "aderoute-pppoe-config.txt";
                a.click();
              }}
              className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Configuration
            </button>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <Shield className="w-3 h-3 mr-1" />
              Keep these credentials secure. Do not share.
            </div>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

// Main export with Suspense
export default function PppoeSuccessPage() {
  return (
    <Suspense fallback={<PppoeSuccessSkeleton />}>
      <PppoeSuccessContent />
    </Suspense>
  );
}
