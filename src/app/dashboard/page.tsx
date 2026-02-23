"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/hooks/useCustomer";
import { useSubscription } from "@/hooks/useSubscription";
import { usePlans } from "@/hooks/usePlans";
import {
  Wifi,
  User,
  Calendar,
  Clock,
  Zap,
  RefreshCw,
  CreditCard,
  ArrowRight,
  Download,
  Activity,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Get customer data
  const { getCustomerByPhone } = useCustomer();
  const { getPlan } = usePlans();

  // This would come from your auth system - for now using session
  useEffect(() => {
    const storedCustomerId = sessionStorage.getItem("customerId");
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
    } else {
      // Redirect to login if no customer
      router.push("/");
    }
  }, [router]);

  // Fetch customer data
  const customer = customerId ? getCustomerByPhone(customerId) : null;

  // Fetch subscriptions
  const { getCustomerSubscriptions, hasActiveSubscription } = useSubscription();
  const subscriptions = customerId
    ? getCustomerSubscriptions(customerId as any)
    : [];
  const hasActive = customerId
    ? hasActiveSubscription(customerId as any)
    : false;

  // Get current active subscription
  const activeSubscription = subscriptions?.find(
    (sub) => sub.status === "active",
  );

  // Get plan details for active subscription
  const currentPlan = activeSubscription
    ? getPlan(activeSubscription.planId)
    : null;

  // Mock usage data (would come from your RADIUS server)
  const usageData = {
    dataUsed: 45.2, // GB
    dataLimit: currentPlan?.dataCap || 100,
    daysRemaining: activeSubscription
      ? Math.ceil(
          (activeSubscription.expiryDate - Date.now()) / (1000 * 60 * 60 * 24),
        )
      : 0,
    totalSessions: 128,
    lastSession: "2 hours ago",
  };

  const dataPercentage = (usageData.dataUsed / usageData.dataLimit) * 100;

  if (!customer || !subscriptions) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-pumpkin animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-off-white py-8">
      <div className="container mx-auto px-4">
        {/* Welcome Header */}
        <div className="bg-gradient-primary rounded-2xl p-8 mb-8 text-white">
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
                  className={`w-2 h-2 rounded-full ${hasActive ? "bg-salad" : "bg-pumpkin"} mr-2`}
                />
                {hasActive ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-pumpkin/10 p-3 rounded-lg">
                <Wifi className="w-6 h-6 text-pumpkin" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {currentPlan?.name || "No Plan"}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Current Plan</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-salad/10 p-3 rounded-lg">
                <Activity className="w-6 h-6 text-salad" />
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

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-bottle/10 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-bottle" />
              </div>
              <span className="text-2xl font-bold text-navy-dark">
                {usageData.daysRemaining}{" "}
                <span className="text-sm font-normal text-gray-500">days</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">Days Remaining</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-navy/10 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-navy" />
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
          <div className="card p-6 mb-8 bg-gradient-to-r from-navy to-bottle text-white">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Wifi className="w-5 h-5 mr-2 text-pumpkin" />
              Your WiFi Credentials
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-1">Username</p>
                <p className="text-xl font-mono font-bold">
                  {customer.hotspotUsername}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-white/70 mb-1">Password</p>
                <p className="text-xl font-mono font-bold">
                  {customer.hotspotPassword}
                </p>
              </div>
            </div>
            {customer.hotspotIp && (
              <p className="text-sm text-white/70 mt-4">
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
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition text-sm"
              >
                Copy Credentials
              </button>
              <Link href={`/connection?phone=${customer.phone}`}>
                <button className="bg-pumpkin hover:bg-pumpkin-light text-white px-4 py-2 rounded-lg transition text-sm">
                  Connection Guide
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Usage & Plan Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Data Usage Chart */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-navy-dark mb-4">
                Data Usage
              </h2>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-pumpkin">
                      {dataPercentage.toFixed(1)}% Used
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-navy">
                      {usageData.dataUsed} GB / {usageData.dataLimit} GB
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-4 text-xs flex rounded-full bg-light-gray">
                  <div
                    style={{ width: `${dataPercentage}%` }}
                    className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      dataPercentage > 80 ? "bg-pumpkin" : "bg-salad"
                    }`}
                  />
                </div>
              </div>

              {/* Usage History */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-navy-dark mb-3">
                  Recent Sessions
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b border-light-gray last:border-0"
                    >
                      <div className="flex items-center">
                        <Activity className="w-4 h-4 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-navy-dark">
                            Session #{i}
                          </p>
                          <p className="text-xs text-gray-500">
                            {i} hour{i !== 1 ? "s" : ""} ago
                          </p>
                        </div>
                      </div>
                      <span className="text-sm text-navy-dark font-medium">
                        1.2 GB
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Subscription Details */}
            {activeSubscription && currentPlan && (
              <div className="card p-6">
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
                  <div>
                    <p className="text-sm text-gray-500">Auto Renew</p>
                    <p className="font-semibold text-navy-dark">
                      {activeSubscription.autoRenew ? "Enabled" : "Disabled"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Payment</p>
                    <p className="font-semibold text-navy-dark">
                      KES {currentPlan.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions & Quick Links */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-navy-dark mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link href="/plans">
                  <button className="w-full bg-pumpkin text-white py-3 rounded-xl hover:bg-pumpkin-light transition-all duration-200 flex items-center justify-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Upgrade Plan
                  </button>
                </Link>

                <button className="w-full border-2 border-navy text-navy py-3 rounded-xl hover:bg-navy hover:text-white transition-all duration-200 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Make Payment
                </button>

                <button className="w-full border-2 border-light-gray text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </button>
              </div>
            </div>

            {/* Support Info */}
            <div className="card p-6 bg-navy text-white">
              <h2 className="text-lg font-semibold mb-4">Need Help?</h2>
              <p className="text-white/80 text-sm mb-4">
                Our support team is available 24/7 to assist you with any
                issues.
              </p>
              <div className="space-y-2">
                <p className="text-sm flex items-center">
                  <span className="bg-pumpkin w-2 h-2 rounded-full mr-2" />
                  Call: +254 700 000 000
                </p>
                <p className="text-sm flex items-center">
                  <span className="bg-pumpkin w-2 h-2 rounded-full mr-2" />
                  Email: support@aderoute.com
                </p>
                <p className="text-sm flex items-center">
                  <span className="bg-pumpkin w-2 h-2 rounded-full mr-2" />
                  Live Chat: Available 24/7
                </p>
              </div>
            </div>

            {/* Billing History */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-navy-dark mb-4">
                Billing History
              </h2>
              <div className="space-y-3">
                {subscriptions.slice(0, 3).map((sub, index) => (
                  <div
                    key={sub._id}
                    className="flex items-center justify-between py-2 border-b border-light-gray last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-navy-dark">
                        Payment #{index + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(sub.lastPayment).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-pumpkin">
                      KES {currentPlan?.price.toLocaleString() || "0"}
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href="/billing-history"
                className="mt-4 text-sm text-pumpkin hover:text-pumpkin-light flex items-center justify-center"
              >
                View All Transactions
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
