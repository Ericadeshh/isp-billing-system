"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Wifi,
  Users,
  CreditCard,
  Activity,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Search,
  BarChart3,
  DollarSign,
  Globe,
  Server,
  UserCog,
  Menu,
  X,
  Briefcase,
  TrendingUp,
  Zap,
  Shield,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types
interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalRevenue: number;
  todayRevenue: number;
  totalTransactions: number;
  pendingTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  activeHotspots: number;
  activePPPoE: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data from Convex
  const customers = useQuery(api.customers.queries.getAllCustomers);
  const plans = useQuery(api.plans.queries.getAllPlans);
  const subscriptions = useQuery(
    api.subscriptions.queries.getActiveSubscriptions,
  );
  const payments = useQuery(api.payments.queries.getAllPayments);
  const paymentStats = useQuery(api.payments.queries.getPaymentStats);

  // Calculate stats
  const stats: Stats = {
    totalUsers: customers?.length || 0,
    activeUsers: customers?.filter((c) => c.status === "active")?.length || 0,
    totalRevenue: paymentStats?.totalRevenue || 0,
    todayRevenue: paymentStats?.todayRevenue || 0,
    totalTransactions: payments?.length || 0,
    pendingTransactions:
      payments?.filter((p) => p.status === "pending")?.length || 0,
    completedTransactions:
      payments?.filter((p) => p.status === "completed")?.length || 0,
    failedTransactions:
      payments?.filter((p) => p.status === "failed")?.length || 0,
    activeHotspots:
      subscriptions?.filter((s) => {
        const plan = plans?.find((p) => p._id === s.planId);
        return plan?.planType === "hotspot" && s.status === "active";
      })?.length || 0,
    activePPPoE:
      subscriptions?.filter((s) => {
        const plan = plans?.find((p) => p._id === s.planId);
        return plan?.planType === "pppoe" && s.status === "active";
      })?.length || 0,
  };

  // Mock router data
  const routerStatus = {
    online: true,
    cpu: 23,
    memory: 45,
    uptime: "15d 7h",
    connections: 128,
    bandwidth: "45/100 Mbps",
  };

  // Card color themes
  const cardThemes = [
    {
      bg: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-blue-100",
    },
    {
      bg: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-emerald-100",
    },
    {
      bg: "bg-gradient-to-br from-amber-500 to-amber-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-amber-100",
    },
    {
      bg: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconBg: "bg-white/20",
      textColor: "text-white",
      valueColor: "text-white",
      labelColor: "text-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-navy text-white transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <div className="bg-amber-500 p-2 rounded-lg">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Aderoute Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          <Link
            href="/admin/dashboard"
            className="flex items-center space-x-3 px-4 py-3 bg-amber-500/20 text-amber-500 rounded-lg"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 rounded-lg transition"
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </Link>
          <Link
            href="/admin/plans"
            className="flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 rounded-lg transition"
          >
            <Briefcase className="w-5 h-5" />
            <span>Plans</span>
          </Link>
          <Link
            href="/admin/transactions"
            className="flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 rounded-lg transition"
          >
            <CreditCard className="w-5 h-5" />
            <span>Transactions</span>
          </Link>
          <Link
            href="/admin/mikrotik"
            className="flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 rounded-lg transition"
          >
            <Server className="w-5 h-5" />
            <span>MikroTik</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center space-x-3 px-4 py-3 text-white/70 hover:bg-white/10 rounded-lg transition"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={() => router.push("/")}
            className="flex items-center space-x-3 px-4 py-3 w-full text-white/70 hover:bg-white/10 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen">
        {/* Top Bar */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 flex justify-end items-center space-x-4">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 w-64"
                />
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <UserCog className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden sm:block">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
              Welcome back, Admin
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Here's what's happening with your network today.
            </p>
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {[
              {
                icon: <Users className="w-6 h-6 text-white" />,
                label: "Total Users",
                value: stats.totalUsers,
                subtext: `${stats.activeUsers} active`,
                theme: cardThemes[0],
              },
              {
                icon: <DollarSign className="w-6 h-6 text-white" />,
                label: "Total Revenue",
                value: `KES ${stats.totalRevenue.toLocaleString()}`,
                subtext: `+KES ${stats.todayRevenue.toLocaleString()} today`,
                theme: cardThemes[1],
              },
              {
                icon: <CreditCard className="w-6 h-6 text-white" />,
                label: "Transactions",
                value: stats.totalTransactions,
                subtext: `${stats.completedTransactions} completed · ${stats.pendingTransactions} pending`,
                theme: cardThemes[2],
              },
              {
                icon: <Globe className="w-6 h-6 text-white" />,
                label: "Active Connections",
                value: stats.activeHotspots + stats.activePPPoE,
                subtext: `${stats.activeHotspots} hotspot · ${stats.activePPPoE} PPPoE`,
                theme: cardThemes[3],
              },
            ].map((card, index) => (
              <div
                key={index}
                className={`${card.theme.bg} rounded-xl shadow-lg p-4 sm:p-6 transition-transform hover:scale-105 duration-300`}
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className={`${card.theme.iconBg} p-2 sm:p-3 rounded-lg`}>
                    {card.icon}
                  </div>
                  <span
                    className={`${card.theme.valueColor} text-xl sm:text-2xl font-bold`}
                  >
                    {card.value}
                  </span>
                </div>
                <p
                  className={`${card.theme.labelColor} text-xs sm:text-sm font-medium mb-1`}
                >
                  {card.label}
                </p>
                <p className={`${card.theme.textColor} text-xs opacity-90`}>
                  {card.subtext}
                </p>
              </div>
            ))}
          </div>

          {/* Router Status & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Router Status */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Server className="w-5 h-5 mr-2 text-amber-500" />
                Router Status
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="flex items-center text-green-600 text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Online
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">CPU</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {routerStatus.cpu}%
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Memory</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {routerStatus.memory}%
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Uptime</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {routerStatus.uptime}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Connections</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {routerStatus.connections}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Bandwidth</p>
                  <p className="font-medium text-gray-800 text-sm">
                    {routerStatus.bandwidth}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-amber-500 hover:text-amber-600 text-sm flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2 sm:space-y-3">
                <Link
                  href="/admin/users/new"
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
                >
                  <span className="text-sm sm:text-base text-amber-700">
                    Add New User
                  </span>
                  <Users className="w-4 h-4 text-amber-500" />
                </Link>
                <Link
                  href="/admin/plans/new"
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
                >
                  <span className="text-sm sm:text-base text-amber-700">
                    Create Plan
                  </span>
                  <Briefcase className="w-4 h-4 text-amber-500" />
                </Link>
                <Link
                  href="/admin/mikrotik/sync"
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
                >
                  <span className="text-sm sm:text-base text-amber-700">
                    Sync Router
                  </span>
                  <RefreshCw className="w-4 h-4 text-amber-500" />
                </Link>
                <Link
                  href="/admin/reports"
                  className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
                >
                  <span className="text-sm sm:text-base text-amber-700">
                    Generate Report
                  </span>
                  <Download className="w-4 h-4 text-amber-500" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                Recent Transactions
              </h2>
              <Link
                href="/admin/transactions"
                className="text-amber-500 hover:text-amber-600 text-xs sm:text-sm"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        User
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Plan
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-3 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments?.slice(0, 5).map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                          {payment.userName || payment.phoneNumber}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">
                          {payment.planName || "N/A"}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium text-gray-900">
                          KES {payment.amount?.toLocaleString()}
                        </td>
                        <td className="px-3 sm:px-4 py-2 sm:py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              payment.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.status === "completed" && (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {payment.status === "pending" && (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {payment.status === "failed" && (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            <span className="hidden sm:inline">
                              {payment.status}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// LogOut Icon Component
const LogOut = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);
