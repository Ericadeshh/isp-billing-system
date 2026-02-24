"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useCustomer } from "@/hooks/useCustomer";
import { useSubscription } from "@/hooks/useSubscription";
import { usePlans } from "@/hooks/usePlans";
import { api } from "../../../convex/_generated/api";
import {
  Wifi,
  Calendar,
  Clock,
  Zap,
  RefreshCw,
  CreditCard,
  ArrowRight,
  Download,
  Activity,
  Copy,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);

  // Get hooks
  const { getPlan } = usePlans();
  const { getCustomerSubscriptions } = useSubscription();

  // Get customer phone from session
  useEffect(() => {
    const storedCustomerPhone = sessionStorage.getItem("dashboard_user_phone");
    if (storedCustomerPhone) {
      setCustomerPhone(storedCustomerPhone);
    } else {
      router.push("/");
    }
  }, [router]);

  // Fetch customer data
  const customer = useQuery(
    api.customers.queries.getCustomerByPhone,
    customerPhone ? { phone: customerPhone } : "skip",
  );

  // Fetch subscriptions
  const subscriptions = useQuery(
    api.subscriptions.queries.getCustomerSubscriptions,
    customer?._id ? { customerId: customer._id as any } : "skip",
  );

  // Get active subscription
  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === "active",
  );

  // Get current plan - use the helper function directly (no useQuery needed)
  const currentPlan = activeSubscription
    ? getPlan(activeSubscription.planId)
    : null;

  // Check if has active subscription
  const hasActive =
    subscriptions?.some((sub) => sub.status === "active") ?? false;

  // Mock usage data
  const usageData = {
    dataUsed: 45.2,
    dataLimit: currentPlan?.dataCap || 100,
    daysRemaining: activeSubscription
      ? Math.ceil(
          (activeSubscription.expiryDate - Date.now()) / (1000 * 60 * 60 * 24),
        )
      : 0,
    totalSessions: 128,
  };

  const dataPercentage = (usageData.dataUsed / usageData.dataLimit) * 100;

  if (!customer || !subscriptions) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <div className="bg-linear-to-r from-amber-500 to-amber-600 rounded-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {customer.name}!
              </h1>
              <p className="text-white/80">
                Manage your internet subscription and view usage
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-sm text-white/80">Account Status</p>
              <p className="font-semibold flex items-center">
                <span
                  className={`w-2 h-2 rounded-full ${hasActive ? "bg-green-400" : "bg-amber-400"} mr-2 animate-pulse`}
                />
                {hasActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Wifi className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {currentPlan?.name || "No Plan"}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Current Plan</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {usageData.dataUsed}{" "}
                <span className="text-sm font-normal text-gray-500">GB</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Data Used / {usageData.dataLimit} GB
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {usageData.daysRemaining}{" "}
                <span className="text-sm font-normal text-gray-500">days</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">Days Remaining</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {usageData.totalSessions}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Total Sessions</p>
          </div>
        </div>

        {/* WiFi Credentials Card */}
        {customer?.hotspotUsername && customer?.hotspotPassword && (
          <div className="bg-white rounded-xl p-6 shadow-md mb-8 border-l-4 border-amber-500">
            <h2 className="text-lg font-semibold text-navy-dark mb-4 flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-amber-500" />
              Your WiFi Credentials
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-gray-600 mb-1">Username</p>
                <p className="text-xl font-mono font-bold text-navy-dark">
                  {customer.hotspotUsername}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-sm text-gray-600 mb-1">Password</p>
                <p className="text-xl font-mono font-bold text-navy-dark">
                  {customer.hotspotPassword}
                </p>
              </div>
            </div>
            {customer.hotspotIp && (
              <p className="text-sm text-gray-600 mt-4">
                Assigned IP: {customer.hotspotIp}
              </p>
            )}
            <div className="mt-4 flex space-x-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Username: ${customer.hotspotUsername}\nPassword: ${customer.hotspotPassword}`,
                  );
                  alert("Credentials copied to clipboard!");
                }}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-all flex items-center"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Credentials
              </button>
              <Link href={`/connection?phone=${customer.phone}`}>
                <button className="border-2 border-amber-500 text-amber-600 px-4 py-2 rounded-lg hover:bg-amber-50 transition-all">
                  Connection Guide
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Usage Chart */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-lg font-semibold text-navy-dark mb-4">
                Data Usage
              </h2>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <span className="text-xs font-semibold text-amber-600">
                    {dataPercentage.toFixed(1)}% Used
                  </span>
                  <span className="text-xs font-semibold text-navy-dark">
                    {usageData.dataUsed} GB / {usageData.dataLimit} GB
                  </span>
                </div>
                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-200">
                  <div
                    style={{ width: `${dataPercentage}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      dataPercentage > 80 ? "bg-amber-500" : "bg-green-500"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Subscription Details */}
            {activeSubscription && currentPlan && (
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h2 className="text-lg font-semibold text-navy-dark mb-4">
                  Subscription Details
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-semibold text-navy-dark">
                      {currentPlan.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Speed</p>
                    <p className="font-semibold text-navy-dark">
                      {currentPlan.speed}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-semibold text-navy-dark">
                      {new Date(
                        activeSubscription.startDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Expiry Date</p>
                    <p className="font-semibold text-navy-dark">
                      {new Date(
                        activeSubscription.expiryDate,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-lg font-semibold text-navy-dark mb-4">
                Quick Actions
              </h2>
              <div className="flex flex-col space-y-3">
                <Link href="/plans">
                  <button className="w-full bg-amber-500 text-white py-3 px-4 rounded-xl font-medium hover:bg-amber-600 transition-all flex items-center justify-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </button>
                </Link>
                <button className="w-full border-2 border-navy text-navy py-3 px-4 rounded-xl font-medium hover:bg-navy hover:text-white transition-all flex items-center justify-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make Payment
                </button>
                <button className="w-full border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-100 transition-all flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </button>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-navy text-white rounded-xl p-6 shadow-md">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2 text-amber-400" />
                Need Help?
              </h2>
              <p className="text-white/80 text-sm mb-4">
                Our support team is available 24/7.
              </p>
              <div className="space-y-2">
                <p className="text-sm">Call: +254 741 091 661</p>
                <p className="text-sm">Email: support@aderoute.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
