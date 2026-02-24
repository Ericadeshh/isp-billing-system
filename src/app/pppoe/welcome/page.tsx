"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCustomer } from "@/hooks/useCustomer";
import { usePlans } from "@/hooks/usePlans";
import {
  CheckCircle,
  Wifi,
  User,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  ArrowRight,
  RefreshCw,
  Briefcase,
  Clock,
  Zap,
  Download,
  Copy,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

// Loading skeleton
function WelcomeSkeleton() {
  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-navy-dark mb-2">
          Loading Your Account
        </h2>
        <p className="text-gray-600">
          Please wait while we set up your dashboard...
        </p>
      </div>
    </main>
  );
}

// Welcome content
function WelcomeContent() {
  const searchParams = useSearchParams();
  const { getCustomerByPhoneQuery } = useCustomer();
  const { getPlan } = usePlans();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(true);

  const customerId = searchParams.get("customer");
  const planId = searchParams.get("plan");
  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if this is a new or returning user
        const hasExistingSession = sessionStorage.getItem("pppoe_customer_id");
        setIsNewUser(!hasExistingSession);

        if (customerId && planId) {
          // Get from session storage
          const storedCustomer = sessionStorage.getItem("pppoe_customer_name");
          const storedPhone = sessionStorage.getItem("pppoe_customer_phone");
          const storedPlan = sessionStorage.getItem("pppoe_plan");

          if (storedCustomer && storedPhone && storedPlan) {
            setCustomer({
              name: storedCustomer,
              phone: storedPhone,
              email:
                sessionStorage.getItem("pppoe_customer_email") ||
                "customer@aderoute.com",
            });
            setPlan(JSON.parse(storedPlan));
          }
        }

        // Clear session storage after loading
        // Keep only essential info for dashboard
        const customerName = sessionStorage.getItem("pppoe_customer_name");
        const customerPhone = sessionStorage.getItem("pppoe_customer_phone");

        sessionStorage.clear();

        // Restore essential info for dashboard
        if (customerName && customerPhone) {
          sessionStorage.setItem("dashboard_user_name", customerName);
          sessionStorage.setItem("dashboard_user_phone", customerPhone);
        }
      } catch (error) {
        console.error("Error loading welcome data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [customerId, planId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!customer || !plan) {
    return (
      <main className="min-h-screen bg-off-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
            <h2 className="text-2xl font-bold text-navy-dark mb-4">
              Welcome Page Not Available
            </h2>
            <p className="text-gray-600 mb-6">
              We couldn't load your account information. Please contact support
              if this persists.
            </p>
            <Link href="/">
              <button className="w-full bg-amber-500 text-white py-3 px-6 rounded-xl font-medium hover:bg-amber-600 transition-all duration-200">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Calculate next billing date (30 days from now)
  const nextBillingDate = new Date();
  nextBillingDate.setDate(nextBillingDate.getDate() + 30);

  // Calculate expiry date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + plan.duration);

  return (
    <main className="min-h-screen bg-off-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className={`bg-linear-to-r ${isNewUser ? "from-navy to-bottle" : "from-amber-500 to-amber-600"} p-8 text-center`}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isNewUser ? "Welcome to Aderoute!" : "Subscription Renewed!"}
            </h1>
            <p className="text-white/90 text-lg">
              {isNewUser
                ? "Your PPPoE account is now active"
                : "Your PPPoE subscription has been renewed successfully"}
            </p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Success Badge */}
            <div className="flex justify-center">
              <span className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm">
                <CheckCircle className="w-4 h-4 mr-2" />
                Payment Confirmed • Transaction ID:{" "}
                {transactionId?.substring(0, 8)}...
              </span>
            </div>

            {/* Account Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Account Details */}
              <div className="bg-off-white rounded-xl p-6">
                <h2 className="text-xl font-semibold text-navy-dark mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-amber-500" />
                  Account Details
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Full Name</span>
                    <span className="font-semibold text-navy-dark">
                      {customer.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Email</span>
                    <span className="font-semibold text-navy-dark">
                      {customer.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Phone</span>
                    <span className="font-semibold text-navy-dark">
                      {customer.phone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">Account Status</span>
                    <span className="inline-flex items-center text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Plan Details */}
              <div className="bg-off-white rounded-xl p-6">
                <h2 className="text-xl font-semibold text-navy-dark mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-amber-500" />
                  Subscription Details
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Plan</span>
                    <span className="font-semibold text-navy-dark">
                      {plan.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Speed</span>
                    <span className="font-semibold text-navy-dark">
                      {plan.speed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600">Monthly Price</span>
                    <span className="text-xl font-bold text-amber-500">
                      KES {plan.price}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600">Next Billing</span>
                    <span className="font-semibold text-navy-dark">
                      {nextBillingDate.toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PPPoE Credentials */}
            <div className="bg-amber-50/30 rounded-xl p-6 border border-amber-200">
              <h3 className="font-semibold text-navy-dark mb-3 flex items-center text-lg">
                <Wifi className="w-5 h-5 mr-2 text-amber-500" />
                PPPoE Login Credentials
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Use these credentials to configure your router or connect
                directly.
                {isNewUser
                  ? " Please save them securely."
                  : " Your credentials remain the same."}
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Username</p>
                  <p className="font-mono font-semibold text-navy-dark text-lg">
                    {customer.phone}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(customer.phone);
                      alert("Username copied!");
                    }}
                    className="text-xs text-amber-500 hover:text-amber-600 mt-2 inline-flex items-center group"
                  >
                    <Copy className="w-3 h-3 mr-1 group-hover:scale-110 transition-transform" />
                    Copy Username
                  </button>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Password</p>
                  <p className="font-mono font-semibold text-navy-dark text-lg">
                    ••••••••
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    (The password you created during registration)
                  </p>
                </div>
              </div>
            </div>

            {/* Usage Stats Preview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-navy-dark">
                    0 hrs
                  </span>
                </div>
                <p className="text-xs text-gray-500">Time Used</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-navy-dark">
                    {plan.speed}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Speed</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-navy-dark">
                    {plan.duration}d
                  </span>
                </div>
                <p className="text-xs text-gray-500">Validity</p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center justify-between mb-2">
                  <CreditCard className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-navy-dark">
                    KES {plan.price}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Paid</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link href="/dashboard" className="flex-1">
                <button className="w-full bg-amber-500 text-white py-4 px-6 rounded-xl font-semibold hover:bg-amber-600 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg flex items-center justify-center">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </Link>
              <Link href="/" className="flex-1">
                <button className="w-full border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md flex items-center justify-center">
                  Back to Home
                </button>
              </Link>
            </div>

            {/* Next Steps */}
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h4 className="font-medium text-navy-dark mb-3 text-lg flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-amber-500" />
                Next Steps
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium text-navy-dark">
                      Configure Your Router
                    </p>
                    <p className="text-sm text-gray-600">
                      Use the PPPoE credentials above
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium text-navy-dark">
                      Check Your Email
                    </p>
                    <p className="text-sm text-gray-600">
                      Setup instructions sent to {customer.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium text-navy-dark">Monitor Usage</p>
                    <p className="text-sm text-gray-600">
                      Visit dashboard to track your connection
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold mr-3 shrink-0">
                    4
                  </span>
                  <div>
                    <p className="font-medium text-navy-dark">
                      Set Up Auto-Pay
                    </p>
                    <p className="text-sm text-gray-600">
                      Never miss a payment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div className="text-center text-sm text-gray-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4 mr-2 text-amber-500" />
              Need help? Contact support at{" "}
              <a
                href="mailto:support@aderoute.com"
                className="text-amber-500 hover:text-amber-600 mx-1"
              >
                support@aderoute.com
              </a>{" "}
              or call{" "}
              <a
                href="tel:+254741091661"
                className="text-amber-500 hover:text-amber-600 ml-1"
              >
                0741 091 661
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Main export with Suspense
export default function WelcomePage() {
  return (
    <Suspense fallback={<WelcomeSkeleton />}>
      <WelcomeContent />
    </Suspense>
  );
}
