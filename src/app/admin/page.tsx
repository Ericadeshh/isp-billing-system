"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard
    router.push("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          {/* Spinner */}
          <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-4" />

          {/* Background glow */}
          <div className="absolute inset-0 bg-amber-500/20 blur-3xl -z-10 rounded-full" />
        </div>

        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Loading Admin Dashboard
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Please wait while we redirect you...
        </p>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-6 mx-auto overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full animate-[progress_1s_ease-in-out_infinite]"
            style={{ width: "60%" }}
          />
        </div>

        {/* Debug info - only in development */}
        {process.env.NODE_ENV === "development" && (
          <p className="text-xs text-gray-400 mt-8 font-mono">
            Redirecting to /admin/dashboard
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
