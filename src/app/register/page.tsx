"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { usePlans } from "@/hooks/usePlans";
import { useCustomer } from "@/hooks/useCustomer";
import { Plan } from "@/types";
import {
  Wifi,
  User,
  Mail,
  Phone,
  Home,
  Lock,
  CreditCard,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  CheckCircle,
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
function RegisterSkeleton() {
  return (
    <main className="min-h-screen bg-off-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-navy p-8">
            <div className="w-16 h-16 bg-pumpkin/50 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-8 w-48 bg-white/20 rounded mx-auto animate-pulse" />
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
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

// Main registration content
function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { plans, isLoading: plansLoading } = usePlans();
  const { register, isLoading: customerLoading } = useCustomer();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear password error when typing
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const validateForm = (): boolean => {
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }

    // Password strength (at least 8 chars)
    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return false;
    }

    // Validate phone number
    const phoneDigits = formData.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      alert("Please enter a valid phone number");
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) return;
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Format phone number
      const cleanPhone = formData.phone.replace(/\D/g, "");
      const formattedPhone = cleanPhone.startsWith("0")
        ? "254" + cleanPhone.substring(1)
        : cleanPhone.startsWith("254")
          ? cleanPhone
          : "254" + cleanPhone;

      // Register customer in database
      const customerId = await register({
        name: formData.fullName,
        phone: formattedPhone,
        email: formData.email,
        address: formData.address,
      });

      // Store customer info in session for later use
      sessionStorage.setItem("pppoe_customer_id", customerId);
      sessionStorage.setItem("pppoe_customer_name", formData.fullName);
      sessionStorage.setItem("pppoe_customer_phone", formattedPhone);
      sessionStorage.setItem("pppoe_plan", JSON.stringify(selectedPlan));

      // Create return URL for after payment
      const returnUrl = encodeURIComponent(
        `${ISP_APP_URL}/pppoe/welcome?customer=${customerId}&plan=${selectedPlan._id}`,
      );

      // Redirect to M-Pesa app for payment
      window.location.href = `${MPESA_APP_URL}/pay?amount=${selectedPlan.price}&phone=${formattedPhone}&returnUrl=${returnUrl}&service=Aderoute%20PPPoE&fixed=true`;
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
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
      <div className="container mx-auto px-4 max-w-2xl">
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
              <Briefcase className="w-8 h-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-pumpkin mb-2">
              PPPoE Account Registration
            </span>
            <p className="text-white/80">Create your account to get started</p>
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

          <div className="bg-blue-50 p-4 mb-6 rounded-lg border border-blue-200">
            <p className="text-sm text-gray-700">
              Already have an account?{" "}
              <Link
                href={`/login?plan=${selectedPlan._id}`}
                className="text-pumpkin font-medium hover:text-pumpkin-light"
              >
                Login here
              </Link>{" "}
              to renew your subscription.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Full Name <span className="text-pumpkin">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pumpkin focus:ring-2 focus:ring-pumpkin/20"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Email Address <span className="text-pumpkin">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pumpkin focus:ring-2 focus:ring-pumpkin/20"
                  placeholder="john@example.com"
                />
              </div>
            </div>

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
              <p className="text-xs text-gray-500 mt-1">
                For M-Pesa payments and account recovery
              </p>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Installation Address
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-pumpkin focus:ring-2 focus:ring-pumpkin/20"
                  placeholder="Your physical address for installation"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                PPPoE Password <span className="text-pumpkin">*</span>
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Confirm Password <span className="text-pumpkin">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 ${
                    passwordError
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                      : "border-gray-200 focus:border-pumpkin focus:ring-pumpkin/20"
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {passwordError && (
                <p className="text-sm text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              loading={isSubmitting || customerLoading}
              className="w-full py-4 text-lg"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-gray-400 text-center">
              By creating an account, you agree to our{" "}
              <Link
                href="/terms"
                className="text-pumpkin hover:text-pumpkin-light"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-pumpkin hover:text-pumpkin-light"
              >
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

// Main export with Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterSkeleton />}>
      <RegisterContent />
    </Suspense>
  );
}
