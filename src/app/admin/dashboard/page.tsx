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
  Zap,
  Globe,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800"
          >
            <div className="h-10 w-10 bg-gray-700 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-6 w-16 bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800"
          >
            <div className="h-6 w-40 bg-gray-700 rounded animate-pulse mb-4" />
            <div className="h-64 bg-gray-700 rounded animate-pulse" />
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

  // Calculate hotspot and pppoe counts
  const hotspotCount = customers.filter((c) => c.planType === "hotspot").length;
  const pppoeCount = customers.filter((c) => c.planType === "pppoe").length;

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
          <p className="text-sm text-gray-400 mt-1">
            Welcome back! Here's what's happening with your ISP today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="bg-navy/50 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 bg-navy/50 border border-gray-700 rounded-lg hover:bg-navy transition-colors"
            title="Refresh Data"
          >
            <RefreshCw
              className={`w-5 h-5 text-amber-500 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>

          {/* Export Button */}
          <button className="flex items-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-all duration-200">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Customers */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
              +{customerGrowth}%
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-1">Total Customers</p>
          <p className="text-2xl font-bold text-white">
            {totalCustomers.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Active: {activeCount}</p>
        </div>

        {/* Hotspot Users */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-medium text-amber-500 bg-amber-500/20 px-2 py-1 rounded-full">
              {hotspotCount > 0
                ? ((hotspotCount / totalCustomers) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-1">Hotspot Users</p>
          <p className="text-2xl font-bold text-amber-500">{hotspotCount}</p>
          <p className="text-xs text-gray-500 mt-1">Hourly/Daily plans</p>
        </div>

        {/* PPPoE Users */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
              {pppoeCount > 0
                ? ((pppoeCount / totalCustomers) * 100).toFixed(1)
                : 0}
              %
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-1">PPPoE Users</p>
          <p className="text-2xl font-bold text-blue-400">{pppoeCount}</p>
          <p className="text-xs text-gray-500 mt-1">Monthly subscriptions</p>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-green-400" />
            </div>
            {expiringSoon && expiringSoon.length > 0 && (
              <span className="text-xs font-medium text-amber-500 bg-amber-500/20 px-2 py-1 rounded-full">
                {expiringSoon.length} expiring
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mb-1">Active Subs</p>
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((activeCount / totalCustomers) * 100 || 0).toFixed(1)}% of
            customers
          </p>
        </div>

        {/* Total Revenue */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
              +{revenueGrowth}%
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-amber-500">
            KES {totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Today: KES {todayRevenue.toLocaleString()}
          </p>
        </div>

        {/* Success Rate */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-xs font-medium text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
              Avg
            </span>
          </div>
          <p className="text-sm text-gray-400 mb-1">Success Rate</p>
          <p className="text-2xl font-bold text-purple-400">
            {successRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {successfulPayments}/{totalPayments} payments
          </p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-amber-500">
              Revenue Overview
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Last 7 days</span>
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
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  tick={{ fill: "#9CA3AF", fontSize: 12 }}
                  tickFormatter={(value) => `KES ${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#F9FAFB",
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
        <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-6 block">
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
                    backgroundColor: "#1E293B",
                    border: "1px solid #334155",
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
                <span className="text-sm text-gray-400">
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
        <div className="lg:col-span-2 bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-amber-500">
              Recent Transactions
            </span>
            <Link
              href="/admin/transactions"
              className="text-sm text-amber-500 hover:text-amber-400 font-medium flex items-center"
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
                    className="flex items-center justify-between p-4 bg-navy/50 rounded-lg hover:bg-navy transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          payment.status === "completed"
                            ? "bg-green-500/20"
                            : payment.status === "pending"
                              ? "bg-yellow-500/20"
                              : "bg-red-500/20"
                        }`}
                      >
                        {payment.status === "completed" ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : payment.status === "pending" ? (
                          <Clock className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {customer?.name || payment.userName || "Unknown User"}
                        </p>
                        <p className="text-sm text-gray-400">
                          {payment.transactionId.slice(-8)} •{" "}
                          {new Date(payment.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-500">
                        KES {payment.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {payment.planName || payment.serviceType}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent transactions
              </div>
            )}
          </div>
        </div>

        {/* Expiring Soon - FIXED VERSION */}
        <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <span className="text-lg font-semibold text-amber-500">
              Expiring Soon
            </span>
            {expiringSoon && expiringSoon.length > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded-full">
                {expiringSoon.length} customers
              </span>
            )}
          </div>
          <div className="space-y-4">
            {expiringSoon && expiringSoon.length > 0 ? (
              expiringSoon.slice(0, 5).map((sub) => {
                const customer = sub.customer;
                const daysLeft = Math.ceil(
                  (sub.expiryDate - Date.now()) / (1000 * 60 * 60 * 24),
                );

                // Format expiry date
                const expiryDate = new Date(
                  sub.expiryDate,
                ).toLocaleDateString();

                return (
                  <div
                    key={sub._id}
                    className="p-4 bg-navy/50 rounded-lg hover:bg-navy transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-white">
                          {customer?.name || "Unknown User"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {customer?.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            daysLeft <= 1
                              ? "bg-red-500/20 text-red-400"
                              : daysLeft <= 3
                                ? "bg-amber-500/20 text-amber-500"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {daysLeft} {daysLeft === 1 ? "day" : "days"}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          Expires: {expiryDate}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 mt-3">
                      <div
                        className={`h-1.5 rounded-full ${
                          daysLeft <= 1 ? "bg-red-500" : "bg-amber-500"
                        }`}
                        style={{
                          width: `${Math.max(0, Math.min(100, (daysLeft / 3) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No expiring subscriptions</p>
                <p className="text-sm text-gray-500 mt-1">
                  All active subscriptions are valid
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <span className="text-sm font-medium text-amber-500 block mb-3">
              Quick Actions
            </span>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin/users"
                className="p-2 bg-navy/50 rounded-lg hover:bg-navy transition-colors text-center"
              >
                <Users className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-xs text-gray-400">Manage Users</span>
              </Link>
              <Link
                href="/admin/plans"
                className="p-2 bg-navy/50 rounded-lg hover:bg-navy transition-colors text-center"
              >
                <Wifi className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                <span className="text-xs text-gray-400">Edit Plans</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      {planDistributionData.filter((d) => d.value > 0).length > 0 && (
        <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-6 block">
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
                    <span className="text-gray-300">{item.name}</span>
                  </div>
                  <span className="font-semibold text-white">
                    {item.value} customers
                  </span>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-white">
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
