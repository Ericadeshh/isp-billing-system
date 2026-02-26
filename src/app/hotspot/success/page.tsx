"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
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
  Printer,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Format remaining time
function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Expired";

  const minutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

// Loading skeleton
function HotspotSuccessSkeleton() {
  return (
    <main className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="bg-gray-200 rounded-2xl p-8 mb-8 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-gray-300 rounded" />
              <div className="h-4 w-48 bg-gray-300 rounded" />
            </div>
            <div className="h-16 w-24 bg-gray-300 rounded" />
          </div>
        </div>
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
      </div>
    </main>
  );
}

// Expired session view
function ExpiredSessionView({ phone }: { phone: string | null }) {
  return (
    <main className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-gray-500 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-8 h-8 mr-3" />
            <h1 className="text-2xl font-bold">Session Expired</h1>
          </div>
          <p className="text-white/90 mb-6">
            Your hotspot session has ended. {phone && `Phone: ${phone}`}
          </p>
          <div className="flex space-x-4">
            <Link href="/">
              <button className="bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-100 transition font-medium">
                Return Home
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main content component
function HotspotSuccessContent() {
  const searchParams = useSearchParams();
  const [timeRemaining, setTimeRemaining] = useState<string>("Calculating...");
  const [isChecking, setIsChecking] = useState(false);

  const phone = searchParams.get("phone");
  const amount = searchParams.get("amount");
  const transactionId = searchParams.get("transactionId");

  // Get customer and subscription data
  const customer = useQuery(
    api.customers.queries.getCustomerByPhone,
    phone ? { phone } : "skip",
  );

  const subscriptions = useQuery(
    api.subscriptions.queries.getCustomerSubscriptions,
    customer?._id ? { customerId: customer._id } : "skip",
  );

  const activeSubscription = subscriptions?.find((s) => s.status === "active");

  // Check expiry on every load and update if needed
  useEffect(() => {
    const checkExpiry = async () => {
      if (!activeSubscription || isChecking) return;

      const now = Date.now();
      if (
        now > activeSubscription.expiryDate &&
        activeSubscription.status === "active"
      ) {
        setIsChecking(true);
        try {
          // Call API to expire the subscription
          await fetch("/api/check-expiry", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId: activeSubscription._id }),
          });
          // Refresh the page to show expired status
          window.location.reload();
        } catch (error) {
          console.error("Failed to check expiry:", error);
        } finally {
          setIsChecking(false);
        }
      }
    };

    checkExpiry();
  }, [activeSubscription, isChecking]);

  // Update time remaining every minute
  useEffect(() => {
    if (!activeSubscription) return;

    const updateTime = () => {
      const now = Date.now();
      const remaining = activeSubscription.expiryDate - now;
      setTimeRemaining(formatTimeRemaining(remaining));
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [activeSubscription]);

  // Show expired view if no active subscription but we have a phone
  if ((!customer || !activeSubscription) && phone) {
    // Check if any subscription exists for this customer
    if (customer && subscriptions && subscriptions.length > 0) {
      // They have subscriptions but none active - must be expired
      return <ExpiredSessionView phone={phone} />;
    }
    // No customer found - maybe payment didn't complete
    return <ExpiredSessionView phone={phone} />;
  }

  if (!customer || !activeSubscription) {
    return <HotspotSuccessSkeleton />;
  }

  const expiryDate = new Date(activeSubscription.expiryDate);
  const isExpired = Date.now() > activeSubscription.expiryDate;

  // If expired, show expired view
  if (isExpired) {
    return <ExpiredSessionView phone={phone} />;
  }

  return (
    <main className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Link>

        {/* Success Header */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-8 mb-8 text-white">
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
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse" />
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Credentials Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-navy p-4">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-amber-500" />
              Your Hotspot Credentials
            </h2>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-off-white rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">
                  Username (Phone Number)
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-mono font-bold text-navy-dark">
                    {customer.phone}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customer.phone);
                      alert("Username copied!");
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition group"
                  >
                    <Copy className="w-4 h-4 text-gray-500 group-hover:text-amber-500" />
                  </button>
                </div>
              </div>

              <div className="bg-off-white rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-2">Password</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-mono font-bold text-navy-dark">
                    {customer.hotspotPassword ||
                      "ISP" +
                        Math.random()
                          .toString(36)
                          .substring(2, 8)
                          .toUpperCase()}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        customer.hotspotPassword || "",
                      );
                      alert("Password copied!");
                    }}
                    className="p-2 hover:bg-gray-200 rounded-lg transition group"
                  >
                    <Copy className="w-4 h-4 text-gray-500 group-hover:text-amber-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Gauge className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {activeSubscription?.planId ? "5 Mbps" : "0"}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Connection Speed</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {timeRemaining}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Time Remaining</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">0 MB</span>
            </div>
            <p className="text-gray-500 text-sm">Data Used</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Signal className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {expiryDate.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Expires At</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex justify-center space-x-4">
          <Link href="/quick-pay">
            <button className="bg-amber-500 text-white px-6 py-3 rounded-xl hover:bg-amber-600 transition">
              Buy Another Plan
            </button>
          </Link>
          <button
            onClick={() => window.print()}
            className="border-2 border-navy text-navy px-6 py-3 rounded-xl hover:bg-navy hover:text-white transition"
          >
            <Printer className="w-5 h-5 inline mr-2" />
            Print
          </button>
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
