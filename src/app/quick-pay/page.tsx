"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePlans } from "@/hooks/usePlans";
import { Plan } from "@/types";
import {
  Wifi,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  Shield,
  Phone,
} from "lucide-react";
import Link from "next/link";

// Environment variables with proper fallbacks
const MPESA_APP_URL =
  process.env.NEXT_PUBLIC_MPESA_APP_URL ||
  "https://mpesa-payment-app-navy.vercel.app";
const ISP_APP_URL =
  process.env.NEXT_PUBLIC_ISP_APP_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://your-isp-app.vercel.app");

// Loading skeleton component
function QuickPaySkeleton() {
  return (
    <main className="min-h-screen bg-off-white py-12">
      <div className="container mx-auto px-4 max-w-md">
        {/* Back link skeleton */}
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Plan summary card skeleton */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-navy p-4">
            <div className="w-8 h-8 bg-pumpkin/50 rounded-full mx-auto mb-2 animate-pulse" />
            <div className="h-6 w-32 bg-white/20 rounded mx-auto animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex justify-between items-center pb-4 border-b border-gray-200"
              >
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Phone input card skeleton */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-navy to-bottle p-4">
            <div className="h-6 w-48 bg-white/20 rounded mx-auto animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-pumpkin/50 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}

// Main content component that uses useSearchParams
function QuickPayContent() {
  const searchParams = useSearchParams();
  const { plans, isLoading } = usePlans();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Get plan ID from URL and find the selected plan
  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId && plans) {
      const plan = plans.find((p) => p._id === planId);
      if (plan) {
        setSelectedPlan(plan);
      }
    }
  }, [searchParams, plans]);

  const handlePayment = () => {
    if (!phoneNumber) {
      alert("Please enter your M-Pesa phone number");
      return;
    }
    if (!selectedPlan) {
      alert("No plan selected");
      return;
    }

    setIsRedirecting(true);

    // Format phone number to international format
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0")
      ? "254" + cleanPhone.substring(1)
      : cleanPhone.startsWith("254")
        ? cleanPhone
        : "254" + cleanPhone;

    // Create return URL to come back to this app's success page
    const returnUrl = encodeURIComponent(
      `${ISP_APP_URL}/hotspot/success?phone=${formattedPhone}&plan=${selectedPlan._id}&amount=${selectedPlan.price}`,
    );

    // Redirect to M-Pesa app
    window.location.href = `${MPESA_APP_URL}/pay?amount=${selectedPlan.price}&phone=${formattedPhone}&returnUrl=${returnUrl}&service=Aderoute%20Hotspot&fixed=true`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-pumpkin animate-spin" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No plan selected</p>
          <Link href="/" className="text-pumpkin hover:text-pumpkin-light">
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-off-white py-12">
      <div className="container mx-auto px-4 max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-pumpkin mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Link>

        {/* Selected Plan Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-navy p-4 text-center">
            <Wifi className="w-8 h-8 text-pumpkin mx-auto mb-2" />
            <span className="text-xl font-bold text-pumpkin">
              {selectedPlan.name}
            </span>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Amount:</span>
              <span className="text-2xl font-bold text-pumpkin">
                KES {selectedPlan.price}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Speed:</span>
              <span className="font-medium text-white">
                {selectedPlan.speed}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-white">
                {selectedPlan.duration < 1
                  ? `${selectedPlan.duration * 24} hours`
                  : selectedPlan.duration === 1
                    ? "1 day"
                    : `${selectedPlan.duration} days`}
              </span>
            </div>
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-navy to-bottle p-4 text-center">
            <h2 className="text-lg font-semibold text-white">
              Enter Your M-Pesa Number
            </h2>
          </div>

          <div className="p-6">
            <div className="mb-4">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-navy-dark mb-2 items-center"
              >
                <Phone className="w-4 h-4 mr-2 text-pumpkin" />
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0712345678"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent text-gray-900"
                autoFocus
                aria-label="M-Pesa phone number"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Phone className="w-3 h-3 mr-1 text-pumpkin" />
                You'll receive an STK push on this number
              </p>
            </div>

            <button
              onClick={handlePayment}
              disabled={isRedirecting}
              className="w-full bg-pumpkin text-white py-4 rounded-xl hover:bg-pumpkin-light transition-all duration-200 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Continue to payment"
            >
              {isRedirecting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  Continue to M-Pesa
                  <ExternalLink className="w-5 h-5 ml-2" />
                </>
              )}
            </button>

            {/* Environment Indicator - Only shown in development */}
            {process.env.NODE_ENV === "development" && (
              <p className="text-xs text-blue-500 text-center mt-4 flex items-center justify-center">
                <Shield className="w-3 h-3 mr-1" />
                Development mode: Using{" "}
                {MPESA_APP_URL.includes("localhost") ? "local" : "live"} M-Pesa
                app
              </p>
            )}

            {/* Security Note */}
            <p className="text-xs text-gray-400 text-center mt-4 flex items-center justify-center">
              <Shield className="w-3 h-3 mr-1" />
              You'll be redirected to our secure payment page
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main export with Suspense
export default function QuickPayPage() {
  return (
    <Suspense fallback={<QuickPaySkeleton />}>
      <QuickPayContent />
    </Suspense>
  );
}
