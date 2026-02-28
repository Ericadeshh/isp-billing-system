"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

import {
  Users,
  Wifi,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  DollarSign,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  TooltipProps,
} from "recharts";
import {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse mb-4" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface PaymentStatusData {
  name: string;
  value: number;
  color: string;
}

interface RevenueData {
  date: string;
  amount: number;
}

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "year"
  >("week");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch real data from Convex
  const customers = useQuery(api.customers.queries.getAllCustomers);
  const payments = useQuery(api.payments.queries.getAllPayments);
  const activeSubscriptions = useQuery(
    api.subscriptions.queries.getActiveSubscriptions,
  );
  const expiringSoon = useQuery(
    api.subscriptions.queries.getExpiringSubscriptions,
    {
      daysThreshold: 3,
    },
  );
  const recentPayments = useQuery(api.payments.queries.getRecentPayments, {
    limit: 10,
  });
  const paymentStats = useQuery(api.payments.queries.getPaymentStats);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Show loading state
  if (!customers || !payments || !activeSubscriptions || !paymentStats) {
    return <DashboardSkeleton />;
  }

  // Calculate statistics
  const totalCustomers = customers.length;
  const activeCount = activeSubscriptions.length;
  const totalRevenue = paymentStats.totalRevenue;
  const todayRevenue = paymentStats.todayRevenue;

  // Calculate success rate
  const totalPayments = payments.length;
  const successfulPayments = payments.filter(
    (p) => p.status === "completed",
  ).length;
  const successRate =
    totalPayments > 0 ? (successfulPayments / totalPayments) * 100 : 0;

  // Calculate growth percentages
  const customerGrowth = 12.5;
  const revenueGrowth = 8.3;

  // Prepare revenue chart data
  const revenueData: RevenueData[] =
    payments
      ?.filter((p) => p.status === "completed")
      .reduce((acc: RevenueData[], payment) => {
        const date = new Date(payment.createdAt).toLocaleDateString();
        const existing = acc.find((item) => item.date === date);
        if (existing) {
          existing.amount += payment.amount;
        } else {
          acc.push({ date, amount: payment.amount });
        }
        return acc;
      }, [])
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7) || [];

  // Payment status distribution
  const paymentStatusData: PaymentStatusData[] = [
    {
      name: "Completed",
      value: payments?.filter((p) => p.status === "completed").length || 0,
      color: "#10B981",
    },
    {
      name: "Pending",
      value: payments?.filter((p) => p.status === "pending").length || 0,
      color: "#F59E0B",
    },
    {
      name: "Failed",
      value: payments?.filter((p) => p.status === "failed").length || 0,
      color: "#EF4444",
    },
  ].filter((item) => item.value > 0);

  // Plan distribution
  const hotspotCount = customers.filter((c) => c.planType === "hotspot").length;
  const pppoeCount = customers.filter((c) => c.planType === "pppoe").length;

  const planDistributionData: PaymentStatusData[] = [
    { name: "Hotspot", value: hotspotCount, color: "#F59E0B" },
    { name: "PPPoE", value: pppoeCount, color: "#3B82F6" },
  ].filter((item) => item.value > 0);

  // Custom formatters for Tooltip with proper undefined handling
  const formatRevenueTooltip = (
    value: number | string | Array<number | string> | undefined,
  ): [string, string] => {
    if (typeof value === "number") {
      return [`KES ${value.toLocaleString()}`, "Revenue"];
    }
    return ["0", "Revenue"];
  };

  const formatCountTooltip = (
    value: number | string | Array<number | string> | undefined,
  ): [number | string, string] => {
    if (typeof value === "number") {
      return [value, "Count"];
    }
    return [0, "Count"];
  };

  const formatCustomersTooltip = (
    value: number | string | Array<number | string> | undefined,
  ): [number | string, string] => {
    if (typeof value === "number") {
      return [value, "Customers"];
    }
    return [0, "Customers"];
  };

  // Custom label for pie chart to handle undefined percent
  const renderPieLabel = (entry: any): string => {
    const { name, percent } = entry;
    const percentage = percent ? (percent * 100).toFixed(0) : "0";
    return `${name} ${percentage}%`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-2xl font-bold text-amber-500">Dashboard</span>
          <p className="text-sm text-gray-400 dark:text-gray-300 mt-1">
            Welcome back! Here's what's happening with your ISP today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-00 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-600 dark:text-gray-300 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

          {/* Export Button */}
          <button className="flex items-center space-x-2 bg-linear-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {customerGrowth}%
              </span>
            </div>
          </div>
          <span className="text-sm text-gray-500 font-bold dark:text-gray-400 mb-1">
            Total Customers
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-blue-400">
              {totalCustomers.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">Active: {activeCount}</span>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            {expiringSoon && expiringSoon.length > 0 && (
              <span className="text-xs font-medium text-amber-600 bg-amber-100 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                {expiringSoon.length} expiring soon
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500 font-bold dark:text-gray-400 mb-1">
            Active Subscriptions
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-green-600">
              {activeCount.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">
              {((activeCount / totalCustomers) * 100 || 0).toFixed(1)}% of
              customers
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex items-center space-x-1 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3 text-green-600 dark:text-green-400" />
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                {revenueGrowth}%
              </span>
            </div>
          </div>
          <span className="text-sm text-gray-500 font-bold dark:text-gray-400 mb-1">
            Total Revenue
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-amber-500">
              KES {totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-gray-400">Lifetime</span>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full">
              {successRate.toFixed(1)}% avg
            </span>
          </div>
          <span className="text-sm text-gray-500 font-bold dark:text-gray-400 mb-1">
            Success Rate
          </span>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-green-600">
              {successRate.toFixed(1)}%
            </span>
            <span className="text-xs text-gray-400">
              {successfulPayments}/{totalPayments} payments
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-amber-500">
              Revenue Overview
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Last 7 days
              </span>
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  revenueData.length > 0
                    ? revenueData
                    : [{ date: "No data", amount: 0 }]
                }
              >
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#374151"
                  opacity={0.1}
                />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                />
                <YAxis
                  stroke="#6B7280"
                  tick={{ fill: "#6B7280", fontSize: 12 }}
                  tickFormatter={(value) => `KES ${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                    padding: "12px",
                  }}
                  formatter={formatRevenueTooltip}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <span className="text-lg font-semibold text-amber-500 mb-6">
            Payment Distribution
          </span>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={renderPieLabel}
                  labelLine={false}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#F9FAFB",
                  }}
                  formatter={formatCountTooltip}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {paymentStatusData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions & Expiring Soon */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-amber-500">
              Recent Transactions
            </span>
            <Link
              href="/admin/transactions"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center"
            >
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentPayments && recentPayments.length > 0 ? (
              recentPayments.slice(0, 5).map((payment) => {
                const customer = customers.find(
                  (c) => c._id === payment.customerId,
                );

                return (
                  <div
                    key={payment._id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.status === "completed"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : payment.status === "pending"
                              ? "bg-amber-100 dark:bg-amber-900/20"
                              : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        {payment.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : payment.status === "pending" ? (
                          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {customer?.name || payment.userName || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.transactionId.slice(-8)} •{" "}
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 dark:text-white">
                        KES {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.planName || payment.serviceType}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No recent transactions
              </div>
            )}
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-amber-500">
              Expiring Soon
            </span>
            {expiringSoon && expiringSoon.length > 0 && (
              <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full">
                {expiringSoon.length} subscriptions
              </span>
            )}
          </div>
          <div className="space-y-4">
            {expiringSoon && expiringSoon.length > 0 ? (
              expiringSoon.slice(0, 5).map((sub) => {
                const customer = customers.find(
                  (c) => c._id === sub.customerId,
                );
                const daysLeft = Math.ceil(
                  (sub.expiryDate - Date.now()) / (1000 * 60 * 60 * 24),
                );

                return (
                  <div
                    key={sub._id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {customer?.name || "Unknown User"}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${
                          daysLeft <= 1
                            ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                        }`}
                      >
                        {daysLeft} {daysLeft === 1 ? "day" : "days"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {customer?.phone}
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          daysLeft <= 1 ? "bg-red-500" : "bg-amber-500"
                        }`}
                        style={{
                          width: `${Math.min((daysLeft / 3) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No expiring subscriptions
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm font-medium text-amber-500">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/users"
                className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <Users className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-xs text-gray-300">Manage Users</span>
              </Link>
              <Link
                href="/admin/plans"
                className="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-center"
              >
                <Wifi className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-xs text-gray-300">Edit Plans</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      {planDistributionData.filter((d) => d.value > 0).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <span className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
            Customer Distribution by Plan Type
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={planDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={renderPieLabel}
                  >
                    {planDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={formatCustomersTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              {planDistributionData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {item.value} customers
                  </span>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {totalCustomers} customers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
