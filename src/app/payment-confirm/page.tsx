"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/useSubscription";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  ArrowRight,
  Mail,
  Wifi,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function PaymentConfirmPage() {
  const searchParams = useSearchParams();
  const { createSubscription } = useSubscription();

  const [status, setStatus] = useState<"processing" | "success" | "failed">(
    "processing",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const transactionId = searchParams.get("transactionId");
      const phone = searchParams.get("phone");
      const amount = searchParams.get("amount");
      const planId = searchParams.get("plan");
      const customerId = searchParams.get("customer");

      if (!transactionId || !phone || !amount || !planId || !customerId) {
        setStatus("failed");
        setMessage("Invalid payment confirmation");
        return;
      }

      try {
        await createSubscription({
          customerId: customerId as any,
          planId: planId as any,
          mpesaTransactionId: transactionId,
          autoRenew: true,
        });

        setStatus("success");
        setMessage(
          "Payment successful! Your internet will be activated shortly.",
        );

        sessionStorage.removeItem("selectedPlan");
        sessionStorage.removeItem("customerId");
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        setMessage(
          "Failed to activate your subscription. Please contact support.",
        );
      }
    };

    verifyPayment();
  }, [searchParams, createSubscription]);

  if (status === "processing") {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-pumpkin animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-navy-dark mb-2">
            Verifying Payment
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your transaction...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-off-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {status === "success" ? (
          <>
            <div className="bg-salad p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Payment Successful
              </h1>
              <p className="text-white/90">{message}</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-salad/10 rounded-xl p-4 border border-salad/20">
                <p className="text-sm font-medium text-navy-dark mb-2">
                  What happens next?
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center">
                    <Wifi className="w-4 h-4 text-salad mr-2" />
                    Your internet will be activated within 5-10 minutes
                  </li>
                  <li className="flex items-center">
                    <Mail className="w-4 h-4 text-salad mr-2" />
                    Check your email for login credentials
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-salad mr-2" />
                    You can now connect to our network
                  </li>
                </ul>
              </div>
              <Link href="/dashboard">
                <button className="w-full bg-pumpkin text-white font-semibold py-3 rounded-xl hover:bg-pumpkin-light transition-all duration-200 flex items-center justify-center">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="bg-red-500 p-8 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Payment Failed
              </h1>
              <p className="text-white/90">
                {message || "Something went wrong"}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-navy-dark mb-1">
                      Suggested actions:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Check your M-Pesa transaction history</li>
                      <li>• Try the payment again</li>
                      <li>• Contact support if the issue persists</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Link href="/" className="flex-1">
                  <button className="w-full border-2 border-navy text-navy font-semibold py-3 rounded-xl hover:bg-navy hover:text-white transition-all duration-200">
                    Try Again
                  </button>
                </Link>
                <Link href="/contact" className="flex-1">
                  <button className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all duration-200">
                    Contact Support
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
