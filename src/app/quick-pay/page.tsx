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
  Zap,
  Clock,
} from "lucide-react";
import Link from "next/link";

// Environment variables with proper fallbacks
const MPESA_APP_URL =
  process.env.NEXT_PUBLIC_MPESA_APP_URL ||
  "https://mpesa-payment-app-navy.vercel.app";

// ISP_APP_URL - uses environment variable with correct production fallback
const ISP_APP_URL =
  process.env.NEXT_PUBLIC_ISP_APP_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://isp-billing-system-sand.vercel.app");

// Loading skeleton component
function QuickPaySkeleton() {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-md">
        {/* Back link skeleton */}
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Plan summary card skeleton */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-linear-to-r from-amber-500 to-amber-600 p-4">
            <div className="w-8 h-8 bg-white/20 rounded-full mx-auto mb-2 animate-pulse" />
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
          <div className="bg-linear-to-r from-amber-500 to-amber-600 p-4">
            <div className="h-6 w-48 bg-white/20 rounded mx-auto animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-12 bg-amber-500/50 rounded-xl animate-pulse" />
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

    // Determine success page based on plan type
    const successPath =
      selectedPlan.planType === "pppoe" ? "/pppoe/success" : "/hotspot/success";

    // Create return URL to come back to this app's success page
    const returnUrl = encodeURIComponent(
      `${ISP_APP_URL}${successPath}?phone=${formattedPhone}&plan=${selectedPlan._id}&amount=${selectedPlan.price}`,
    );

    // Redirect to M-Pesa app with fixed amount
    window.location.href = `${MPESA_APP_URL}/pay?amount=${selectedPlan.price}&phone=${formattedPhone}&returnUrl=${returnUrl}&service=${encodeURIComponent(selectedPlan.name)}&fixed=true`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-gray-600 mb-4">No plan selected</p>
          <Link
            href="/"
            className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Link>
        </div>
      </div>
    );
  }

  // Format duration for display
  const formatDuration = (days: number) => {
    if (days < 1) return `${days * 24} Hours`;
    if (days === 1) return "1 Day";
    return `${days} Days`;
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-amber-600 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Plans
        </Link>

        {/* Selected Plan Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 transform hover:scale-[1.02] transition-transform">
          <div className="bg-linear-to-r from-amber-500 to-amber-600 p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 skew-y-12 transform -translate-x-1/2" />
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                <Wifi className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                {selectedPlan.name}
              </h1>
              <p className="text-white/80 text-sm">
                {selectedPlan.description}
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-amber-500" />
                Amount:
              </span>
              <span className="text-3xl font-bold text-amber-600">
                KES {selectedPlan.price.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-amber-500" />
                Speed:
              </span>
              <span className="font-semibold text-gray-800 bg-amber-50 px-3 py-1 rounded-full">
                {selectedPlan.speed}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-amber-500" />
                Duration:
              </span>
              <span className="font-semibold text-gray-800 bg-amber-50 px-3 py-1 rounded-full">
                {formatDuration(selectedPlan.duration)}
              </span>
            </div>

            {selectedPlan.planType && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    selectedPlan.planType === "hotspot"
                      ? "bg-purple-100 text-purple-600"
                      : "bg-blue-100 text-blue-600"
                  }`}
                >
                  {selectedPlan.planType === "hotspot"
                    ? "🏨 Hotspot Access"
                    : "🏢 PPPoE Connection"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Phone Number Input */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-linear-to-r from-amber-500 to-amber-600 p-4 text-center">
            <h2 className="text-lg font-semibold text-white flex items-center justify-center">
              <Phone className="w-5 h-5 mr-2" />
              Enter Your M-Pesa Number
            </h2>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-500" />
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0712345678"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-gray-900"
                  autoFocus
                  aria-label="M-Pesa phone number"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Phone className="w-3 h-3 mr-1 text-amber-500" />
                You'll receive an STK push on this number. Enter without +254 or
                0.
              </p>
            </div>

            {/* Quick phone examples */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["0712345678", "0722345678", "0733345678"].map((example) => (
                <button
                  key={example}
                  onClick={() => setPhoneNumber(example)}
                  className="text-xs bg-gray-100 hover:bg-amber-100 text-gray-600 hover:text-amber-600 px-3 py-1 rounded-full transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>

            <button
              onClick={handlePayment}
              disabled={isRedirecting}
              className="w-full bg-linear-to-r from-amber-500 to-amber-600 text-white py-4 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 flex items-center justify-center text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-amber-200"
              aria-label="Continue to payment"
            >
              {isRedirecting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Redirecting to M-Pesa...
                </>
              ) : (
                <>
                  Continue to Payment
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
            <div className="mt-6 flex items-center justify-center text-xs text-gray-400">
              <Shield className="w-3 h-3 mr-1" />
              Secured by 256-bit SSL encryption
            </div>

            {/* Trust badges */}
            <div className="mt-4 flex justify-center space-x-4">
              <img
                src="/images/mpesa-logo.png"
                alt="M-Pesa"
                className="h-6 opacity-50"
              />
              <img
                src="/images/visa-logo.png"
                alt="Visa"
                className="h-6 opacity-50"
              />
              <img
                src="/images/mastercard-logo.png"
                alt="Mastercard"
                className="h-6 opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Terms and Conditions */}
        <p className="text-xs text-center text-gray-400 mt-6">
          By continuing, you agree to our{" "}
          <Link href="/terms" className="text-amber-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-amber-600 hover:underline">
            Privacy Policy
          </Link>
        </p>
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
