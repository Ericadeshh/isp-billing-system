"use client";

import { useRouter } from "next/navigation";
import { usePlans } from "@/hooks/usePlans";
import { Wifi, Zap, Clock, RefreshCw, User, Briefcase } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { plans, isLoading } = usePlans();

  const handlePlanSelection = (plan: any) => {
    if (plan.duration <= 1) {
      // Hotspot plan (hourly/daily)
      router.push(`/quick-pay?plan=${plan._id}`);
    } else {
      // PPPoE plan (monthly)
      router.push(`/register?plan=${plan._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <RefreshCw className="w-12 h-12 text-pumpkin animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-off-white">
      {/* Hero Section */}
      <div className="bg-gradient-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-pumpkin rounded-full mb-6">
            <Wifi className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Aderoute Internet Services
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mx-auto">
            Choose how you want to connect. Hotspot for instant access, or PPPoE
            for dedicated connection.
          </p>
        </div>
      </div>

      {/* Service Type Indicators */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="flex justify-center gap-4 mb-12">
          <div className="bg-white rounded-xl shadow-lg px-6 py-3 flex items-center">
            <Zap className="w-5 h-5 text-pumpkin mr-2" />
            <span className="text-navy-dark font-medium">
              Hotspot: Instant access
            </span>
          </div>
          <div className="bg-white rounded-xl shadow-lg px-6 py-3 flex items-center">
            <Briefcase className="w-5 h-5 text-bottle mr-2" />
            <span className="text-navy-dark font-medium">
              PPPoE: Dedicated connection
            </span>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-navy-dark text-center mb-12">
          Our Internet Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans?.map((plan) => (
            <div
              key={plan._id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition border border-light-gray"
            >
              {/* Plan Type Badge */}
              <div
                className={`p-3 text-center text-sm font-semibold ${
                  plan.duration <= 1
                    ? "bg-pumpkin/10 text-pumpkin border-b border-pumpkin/20"
                    : "bg-bottle/10 text-bottle border-b border-bottle/20"
                }`}
              >
                {plan.duration <= 1 ? "⚡ Hotspot Plan" : "🏢 PPPoE Plan"}
              </div>

              <div className="p-6">
                <h3 className="text-2xl font-bold text-navy-dark mb-2">
                  {plan.name}
                </h3>
                <div className="text-4xl font-bold text-pumpkin mb-4">
                  KES {plan.price}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Zap className="w-5 h-5 mr-3 text-pumpkin" />
                    <span>{plan.speed}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-3 text-salad" />
                    <span>
                      {plan.duration < 1
                        ? `${plan.duration * 24} hours`
                        : plan.duration === 1
                          ? "1 day"
                          : `${plan.duration} days`}
                    </span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-6">{plan.description}</p>

                <button
                  onClick={() => handlePlanSelection(plan)}
                  className={`w-full py-3 rounded-xl font-semibold transition ${
                    plan.duration <= 1
                      ? "bg-pumpkin text-white hover:bg-pumpkin-light"
                      : "bg-navy text-white hover:bg-navy-light"
                  }`}
                >
                  {plan.duration <= 1
                    ? "Buy Hotspot Access"
                    : "Subscribe as PPPoE"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white border-t border-light-gray mt-12 py-12">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h3 className="text-xl font-semibold text-navy-dark mb-4">
            How It Works
          </h3>
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="space-y-3">
              <h4 className="font-bold text-pumpkin flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Hotspot Access
              </h4>
              <p className="text-gray-600 text-sm">
                Perfect for visitors, events, or temporary use. Pay with M-Pesa
                and get instant access. No registration needed.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-bottle flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                PPPoE Connection
              </h4>
              <p className="text-gray-600 text-sm">
                For businesses and long-term users. Create an account, subscribe
                monthly, and manage your connection through the dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
