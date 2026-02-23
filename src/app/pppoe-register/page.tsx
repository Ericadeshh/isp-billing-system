"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCustomer } from "@/hooks/useCustomer";
import { Plan } from "@/types";
import {
  Wifi,
  User,
  Phone,
  Mail,
  Home,
  ArrowLeft,
  CreditCard,
  Shield,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading: customerLoading } = useCustomer();

  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load selected plan from session storage
  useEffect(() => {
    const storedPlan = sessionStorage.getItem("selectedPlan");
    if (storedPlan) {
      setSelectedPlan(JSON.parse(storedPlan));
    } else {
      // No plan selected, redirect back to home
      router.push("/");
    }
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) return;

    setIsSubmitting(true);

    try {
      // Register customer in database
      const customerId = await register({
        name: formData.name,
        phone: formData.phone.replace(/\D/g, ""),
        email: formData.email || undefined,
        address: formData.address || undefined,
      });

      // Store customer ID for later use
      sessionStorage.setItem("customerId", customerId);

      // Get the base URL for your M-Pesa app (from environment or default)
      const mpesaAppUrl =
        process.env.NEXT_PUBLIC_MPESA_APP_URL ||
        "https://your-mpesa-app.vercel.app";

      // Create return URL to come back to this app after payment
      const returnUrl = encodeURIComponent(
        `${window.location.origin}/connection?phone=${formData.phone.replace(/\D/g, "")}`,
      );

      // Redirect to M-Pesa payment page
      window.location.href = `${mpesaAppUrl}/pay?amount=${selectedPlan.price}&phone=${formData.phone}&returnUrl=${returnUrl}&plan=${selectedPlan._id}&customer=${customerId}`;
    } catch (error) {
      console.error("Registration error:", error);
      alert("Failed to register. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-pumpkin animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading registration form...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-off-white py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-600 hover:text-pumpkin mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plans
        </Link>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-navy to-bottle px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pumpkin rounded-full mb-4">
              <Wifi className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Complete Your Registration
            </h1>
            <p className="text-white/80">
              You are almost there! Just a few details needed.
            </p>
          </div>

          {/* Selected plan summary */}
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
                  KES {selectedPlan.price.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Registration form */}
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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent bg-white text-navy-dark"
                  placeholder="John Doe"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent bg-white text-navy-dark"
                  placeholder="0712345678"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter in format 07XXXXXXXX
              </p>
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Email Address <span className="text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent bg-white text-navy-dark"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Address (Optional) */}
            <div>
              <label className="block text-sm font-medium text-navy-dark mb-2">
                Installation Address{" "}
                <span className="text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pumpkin focus:border-transparent bg-white text-navy-dark"
                  placeholder="Your physical address for installation"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || customerLoading}
              className="w-full bg-pumpkin text-white font-semibold py-4 rounded-xl hover:bg-pumpkin-light transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center"
            >
              {isSubmitting || customerLoading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </button>

            {/* Security notice */}
            <p className="text-xs text-gray-500 text-center flex items-center justify-center">
              <Shield className="w-3 h-3 mr-1 text-salad" />
              Your information is secure and encrypted
            </p>
          </form>
        </div>

        {/* Help text */}
        <p className="text-xs text-gray-400 text-center mt-6">
          By proceeding, you agree to our Terms of Service and Privacy Policy.
          You will be redirected to our secure payment page.
        </p>
      </div>
    </main>
  );
}
