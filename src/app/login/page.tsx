"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { usePlans } from "@/hooks/usePlans";
import { useCustomer } from "@/hooks/useCustomer";
import { Plan } from "@/types";
import {
  Wifi,
  Phone,
  Lock,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  User,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

// Environment variables
const MPESA_APP_URL =
  process.env.NEXT_PUBLIC_MPESA_APP_URL ||
  "https://mpesa-payment-app-navy.vercel.app";
const ISP_APP_URL =
  process.env.NEXT_PUBLIC_ISP_APP_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://isp-billing-system.vercel.app");

// Loading skeleton
function LoginSkeleton() {
  return (
    <main className="min-h-screen bg-off-white py-12">
      <div className="container mx-auto px-4 max-w-md">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-navy p-8">
            <div className="w-16 h-16 bg-pumpkin/50 rounded-full mx-auto mb-4 animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 bg-gray-100 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

// Login content
function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { plans, isLoading: plansLoading } = usePlans();
  const { getCustomerByPhoneQuery } = useCustomer();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });

  // Get plan ID from URL
  useEffect(() => {
    const planId = searchParams.get("plan");
    if (planId && plans) {
      const plan = plans.find((p) => p._id === planId);
      if (plan) {
        setSelectedPlan(plan);
      }
    }
  }, [searchParams, plans]);

  // Format phone for query
  const formattedPhone = formData.phone
    ? (() => {
        const cleanPhone = formData.phone.replace(/\D/g, "");
        return cleanPhone.startsWith("0")
          ? "254" + cleanPhone.substring(1)
          : cleanPhone.startsWith("254")
            ? cleanPhone
            : "254" + cleanPhone;
      })()
    : "";

  // Query customer data - called at top level, not inside handler
  const customer = useQuery(
    getCustomerByPhoneQuery(formattedPhone),
    formattedPhone ? { phone: formattedPhone } : "skip",
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setLoginError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) return;
    if (!formData.phone || !formData.password) {
      setLoginError("Please enter both phone number and password");
      return;
    }

    setIsSubmitting(true);
    setLoginError("");

    try {
      // Check if customer exists
      if (!customer) {
        setLoginError("Account not found. Please register first.");
        setIsSubmitting(false);
        return;
      }

      // In a real app, you'd verify password here
      // For demo, we'll proceed

      // Store customer info in session
      sessionStorage.setItem("pppoe_customer_id", customer._id);
      sessionStorage.setItem("pppoe_customer_name", customer.name);
      sessionStorage.setItem("pppoe_customer_phone", formattedPhone);
      sessionStorage.setItem("pppoe_customer_email", customer.email || "");
      sessionStorage.setItem("pppoe_plan", JSON.stringify(selectedPlan));

      // Create return URL for after payment
      const returnUrl = encodeURIComponent(
        `${ISP_APP_URL}/pppoe/welcome?customer=${customer._id}&plan=${selectedPlan._id}`,
      );

      // Redirect to M-Pesa app for payment
      window.location.href = `${MPESA_APP_URL}/pay?amount=${selectedPlan.price}&phone=${formattedPhone}&returnUrl=${returnUrl}&service=Aderoute%20PPPoE%20Renewal&fixed=true`;
    } catch (error) {
      console.error("Login error:", error);
      setLoginError("Login failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (plansLoading || !selectedPlan) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-pumpkin animate-spin" />
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

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-navy p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pumpkin rounded-full mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Login to Your Account
            </h1>
            <p className="text-white/80">Renew your PPPoE subscription</p>
          </div>

          {/* Selected Plan Summary */}
          <div className="bg-pumpkin/10 px-6 py-4 border-b border-pumpkin/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-pumpkin font-medium">
                  Selected Plan
                </p>
                <p className="font-bold text-navy-dark">{selectedPlan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-pumpkin font-medium">Price</p>
                <p className="font-bold text-pumpkin">
                  KES {selectedPlan.price}/month
                </p>
              </div>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{loginError}</p>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Phone Number <span className="text-pumpkin">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pumpkin focus:ring-2 focus:ring-pumpkin/20"
                  placeholder="0712345678"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Password <span className="text-pumpkin">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pumpkin focus:ring-2 focus:ring-pumpkin/20"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Account Status Hint */}
            {formattedPhone && customer === undefined && (
              <p className="text-sm text-blue-500 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Checking account...
              </p>
            )}
            {formattedPhone && customer === null && (
              <p className="text-sm text-amber-600">
                ⚠️ No account found with this phone number. Please register
                first.
              </p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full py-4 text-lg"
              disabled={customer === null} // Disable if no account found
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>

            {/* Register Link */}
            <p className="text-sm text-gray-500 text-center">
              Don't have an account?{" "}
              <Link
                href={`/register?plan=${selectedPlan._id}`}
                className="text-pumpkin font-medium hover:text-pumpkin-light"
              >
                Register here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

// Main export with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginContent />
    </Suspense>
  );
}
