"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlans } from "@/hooks/usePlans";
import { useCustomer } from "@/hooks/useCustomer";
import {
  useSubscription,
  useHasActiveSubscription,
} from "@/hooks/useSubscription";
import {
  Wifi,
  Zap,
  Clock,
  RefreshCw,
  Briefcase,
  Smartphone,
  Ticket,
  QrCode,
  User,
  Lock,
  LogIn,
  ChevronRight,
  Globe,
  TrendingUp,
  Shield,
  HeadphonesIcon,
  Star,
  CheckCircle,
  Menu,
  X,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";

export default function HomePage() {
  const router = useRouter();
  const { plans, isLoading } = usePlans();
  const { customers } = useCustomer();
  const [activeTab, setActiveTab] = useState<"hotspot" | "pppoe">("hotspot");

  // Form states
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [transactionCode, setTransactionCode] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Loading states
  const [isVerifying, setIsVerifying] = useState(false);

  const handlePlanSelection = (plan: any) => {
    if (plan.duration <= 1) {
      router.push(`/quick-pay?plan=${plan._id}`);
    } else {
      router.push(`/register?plan=${plan._id}`);
    }
  };

  const handleMpesaPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mpesaPhone) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }

    // Format phone number to international format
    const cleanPhone = mpesaPhone.replace(/\D/g, "");
    const formattedPhone = cleanPhone.startsWith("0")
      ? "254" + cleanPhone.substring(1)
      : cleanPhone.startsWith("254")
        ? cleanPhone
        : "254" + cleanPhone;

    router.push(`/quick-pay?phone=${formattedPhone}`);
  };

  const handleVoucherConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode) {
      toast.error("Please enter your voucher code");
      return;
    }

    setIsVerifying(true);

    try {
      // In a real system, this would validate against a vouchers table
      // For now, we'll simulate validation and check if user exists
      const customer = customers?.find(
        (c) => c.hotspotUsername === voucherCode || c._id.includes(voucherCode),
      );

      if (customer) {
        const hasActiveSub = await checkCustomerSubscription(customer._id);
        if (hasActiveSub) {
          toast.success("Voucher validated! Connecting you...");
          router.push(`/hotspot/success?voucher=${voucherCode}`);
        } else {
          toast.error(
            "Your subscription has expired. Please purchase a new plan.",
          );
        }
      } else {
        toast.error("Invalid voucher code");
      }
    } catch (error) {
      toast.error("Failed to validate voucher");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTransactionConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionCode) {
      toast.error("Please enter your transaction code");
      return;
    }

    setIsVerifying(true);

    try {
      // Redirect to quick-pay with transaction code for verification
      router.push(`/quick-pay?transaction=${transactionCode}`);
    } catch (error) {
      toast.error("Failed to verify transaction");
      setIsVerifying(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setIsVerifying(true);

    try {
      // Find customer by hotspot username
      const customer = customers?.find((c) => c.hotspotUsername === username);

      if (customer && customer.hotspotPassword === password) {
        // Redirect to their dashboard
        router.push(`/dashboard?customer=${customer._id}`);
      } else {
        toast.error("Invalid username or password");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Helper function to check subscription
  const checkCustomerSubscription = async (customerId: string) => {
    // This would ideally use a Convex query
    // For now, we'll return true to not break functionality
    return true;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  const hotspotPlans = plans?.filter((p) => p.duration <= 1) || [];
  const pppoePlans = plans?.filter((p) => p.duration > 1) || [];

  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
      <Toaster position="top-right" />

      {/* Hero Section */}
      <div className="bg-linear-to-r from-amber-500 to-amber-600 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
              <Globe className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Aderoute Internet
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8">
              Fast, reliable, and affordable internet for everyone
            </p>
          </div>
        </div>
      </div>

      {/* Service Tabs */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("hotspot")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "hotspot"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200"
            }`}
          >
            <Zap className="w-5 h-5" />
            <span>Hotspot Plans</span>
          </button>
          <button
            onClick={() => setActiveTab("pppoe")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "pppoe"
                ? "bg-amber-500 text-white shadow-lg shadow-amber-200"
                : "bg-white text-gray-700 hover:bg-amber-50 border border-gray-200"
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span>Business Plans</span>
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      <div
        className="container mx-auto px-4 py-12"
        id={activeTab === "hotspot" ? "hotspot" : "pppoe"}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">
          {activeTab === "hotspot" ? "Hotspot Plans" : "Business Plans"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {(activeTab === "hotspot" ? hotspotPlans : pppoePlans).map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="p-4">
                <div className="flex justify-between items-start">
                  {/* Left side - Plan details */}
                  <div className="flex flex-col space-y-1">
                    <h3 className="text-base font-bold text-gray-800">
                      {plan.name}
                    </h3>
                    <div className="flex items-center text-gray-600">
                      <Smartphone className="w-3 h-3 text-amber-500 mr-1" />
                      <span className="text-xs">1 Device</span>
                    </div>
                    <span className="text-lg font-bold text-amber-500">
                      KES {plan.price}
                    </span>
                  </div>

                  {/* Right side - Button and duration */}
                  <div className="flex flex-col items-end space-y-1">
                    <button
                      onClick={() => handlePlanSelection(plan)}
                      className="bg-amber-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-amber-600 transition flex items-center"
                    >
                      Buy
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-3 h-3 text-amber-500 mr-1" />
                      <span className="text-xs">
                        {plan.duration < 1
                          ? `${plan.duration * 24} Hours`
                          : plan.duration === 1
                            ? "1 Day"
                            : `${plan.duration} Days`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Methods Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">
            How to Connect
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Method 1: M-Pesa Pay */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Already Purchased?
              </h3>
              <p className="text-sm text-gray-600 mb-4">Pay using M-Pesa</p>
              <form onSubmit={handleMpesaPay} className="space-y-3">
                <input
                  type="tel"
                  placeholder="M-Pesa Phone Number"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
                <button
                  type="submit"
                  className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition font-medium"
                >
                  Pay
                </button>
              </form>
            </div>

            {/* Method 2: Voucher Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Ticket className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Have Voucher Code?
              </h3>
              <p className="text-sm text-gray-600 mb-4">Enter your voucher</p>
              <form onSubmit={handleVoucherConnect} className="space-y-3">
                <input
                  type="text"
                  placeholder="Voucher Code"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition font-medium disabled:opacity-50"
                >
                  {isVerifying ? "Verifying..." : "Connect"}
                </button>
              </form>
            </div>

            {/* Method 3: Transaction Code */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Use Transaction Code
              </h3>
              <p className="text-sm text-gray-600 mb-4">Enter M-Pesa code</p>
              <form onSubmit={handleTransactionConnect} className="space-y-3">
                <input
                  type="text"
                  placeholder="Transaction Code"
                  value={transactionCode}
                  onChange={(e) => setTransactionCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition font-medium disabled:opacity-50"
                >
                  {isVerifying ? "Verifying..." : "Connect"}
                </button>
              </form>
            </div>

            {/* Method 4: Username & Password */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                PPPoE Login
              </h3>
              <p className="text-sm text-gray-600 mb-4">Business account</p>
              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-900"
                />
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition font-medium disabled:opacity-50"
                >
                  {isVerifying ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">Lightning Fast</h4>
            <p className="text-sm text-gray-600">Up to 100 Mbps</p>
          </div>
          <div className="text-center">
            <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">
              Secure Connection
            </h4>
            <p className="text-sm text-gray-600">WPA2-Enterprise</p>
          </div>
          <div className="text-center">
            <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <HeadphonesIcon className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">24/7 Support</h4>
            <p className="text-sm text-gray-600">Always here to help</p>
          </div>
          <div className="text-center">
            <div className="bg-amber-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1">99.9% Uptime</h4>
            <p className="text-sm text-gray-600">Reliable connection</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0B1E33] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-pumpkin p-2 rounded-lg">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Aderoute</span>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                Fast, reliable internet for everyone in Kenya. Pay easily with
                M-Pesa.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-300 hover:text-pumpkin transition"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-pumpkin transition"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-salad mb-4">Contact Us</h5>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-pumpkin" />
                  +254 741 091 661
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-pumpkin" />
                  ericadeshh@gmail.com
                </li>
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-3 text-pumpkin" />
                  Nairobi, Kenya
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-salad mb-4">Quick Info</h5>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ 24/7 Customer Support</li>
                <li>✓ Instant M-Pesa Payments</li>
                <li>✓ No Hidden Fees</li>
                <li>✓ High-Speed Connection</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-bottle/50 mt-8 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} Aderoute. All rights reserved. | Fast
              & Reliable Internet
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
