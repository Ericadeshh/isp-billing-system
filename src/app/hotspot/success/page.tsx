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
  Smartphone,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
  Shield,
  User,
  Key,
  Globe,
} from "lucide-react";
import Link from "next/link";

// Loading skeleton
function SuccessPageSkeleton() {
  return (
    <main className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-linear-to-r from-green-600 to-emerald-600 p-8 text-center">
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
function HotspotSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [verificationStatus, setVerificationStatus] = useState<
    "verifying" | "success" | "failed"
  >("verifying");

  // Get params from URL
  const transactionId = searchParams.get("transactionId");
  const status = searchParams.get("status");
  const amount = searchParams.get("amount");
  const phone = searchParams.get("phone");
  // ✅ FIX: Accept both "planId" (from ISP) and "plan" (from M-Pesa app)
  const planId = (searchParams.get("planId") || searchParams.get("plan")) as Id<"plans"> | null;

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

  // Generate hotspot credentials (in production, these would come from the network service)
  const hotspotUsername =
    customer.hotspotUsername ||
    `HSPT${phone?.slice(-4)}${Math.floor(Math.random() * 1000)}`;
  const hotspotPassword =
    customer.hotspotPassword ||
    Math.random().toString(36).substring(2, 10).toUpperCase();
  const hotspotIp =
    customer.hotspotIp || "192.168.1." + Math.floor(Math.random() * 200 + 50);

  // Calculate expiry time
  const expiryTime = payment.createdAt + plan.duration * 24 * 60 * 60 * 1000;
  const expiryDate = new Date(expiryTime).toLocaleString();

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-green-50 to-emerald-50 py-12">
      <div className="container mx-auto px-4 max-w-md">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-linear-to-r from-green-600 to-emerald-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 skew-y-12 transform -translate-x-1/2" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Payment Successful!
              </h1>
              <p className="text-white/80 mt-2">Your hotspot access is ready</p>
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

          {/* Hotspot Credentials */}
          <div className="p-6 bg-linear-to-br from-amber-50 to-orange-50">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Wifi className="w-5 h-5 text-amber-500 mr-2" />
              Your Hotspot Credentials
            </h2>

            <div className="space-y-4">
              {/* SSID */}
              <div className="bg-white rounded-xl p-4 border border-amber-100">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Network Name (SSID)
                    </p>
                    <p className="font-mono text-lg font-bold text-gray-800">
                      Aderoute_Hotspot
                    </p>
                  </div>
                  <Globe className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              {/* Username */}
              <div className="bg-white rounded-xl p-4 border border-amber-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Username
                    </p>
                    <p className="font-mono text-sm text-gray-800 break-all">
                      {hotspotUsername}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hotspotUsername, "username")}
                    className="ml-2 p-2 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Copy
                      className={`w-4 h-4 ${copied === "username" ? "text-green-500" : "text-gray-400"}`}
                    />
                  </button>
                </div>
              </div>

              {/* Password */}
              <div className="bg-white rounded-xl p-4 border border-amber-100">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1 flex items-center">
                      <Key className="w-3 h-3 mr-1" />
                      Password
                    </p>
                    <p className="font-mono text-sm text-gray-800 break-all">
                      {hotspotPassword}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hotspotPassword, "password")}
                    className="ml-2 p-2 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Copy
                      className={`w-4 h-4 ${copied === "password" ? "text-green-500" : "text-gray-400"}`}
                    />
                  </button>
                </div>
              </div>

              {/* IP Address (if assigned) */}
              <div className="bg-white rounded-xl p-4 border border-amber-100">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Assigned IP</p>
                    <p className="font-mono text-sm text-gray-800">
                      {hotspotIp}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(hotspotIp, "ip")}
                    className="p-2 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Copy
                      className={`w-4 h-4 ${copied === "ip" ? "text-green-500" : "text-gray-400"}`}
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

            {/* Connection Instructions */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center">
                <Smartphone className="w-4 h-4 mr-2" />
                How to Connect:
              </h3>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li>Open WiFi settings on your device</li>
                <li>Select "Aderoute_Hotspot" from available networks</li>
                <li>Enter the username and password above when prompted</li>
                <li>Accept the terms and conditions</li>
                <li>You're connected! Enjoy fast internet</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const text = `Hotspot Credentials\nUsername: ${hotspotUsername}\nPassword: ${hotspotPassword}\nIP: ${hotspotIp}\nExpires: ${expiryDate}`;
                  copyToClipboard(text, "all");
                }}
                className="bg-white border-2 border-amber-500 text-amber-600 py-3 rounded-xl font-medium hover:bg-amber-50 transition-all duration-200 flex items-center justify-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy All
              </button>
              <Link
                href="/dashboard"
                className="bg-linear-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all duration-200 flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                My Dashboard
              </Link>
            </div>

            {/* Security Note */}
            <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
              <Shield className="w-3 h-3 mr-1" />
              Keep these credentials secure. Do not share.
            </div>
          </div>
        </div>

        {/* Support Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-amber-600 hover:text-amber-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}

// Main export with Suspense
export default function HotspotSuccessPage() {
  return (
    <Suspense fallback={<SuccessPageSkeleton />}>
      <HotspotSuccessContent />
    </Suspense>
  );
}