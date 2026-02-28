"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Wifi,
  CreditCard,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
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
import { Space_Mono } from "next/font/google";

// Date range options
const dateRanges = [
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "12m", label: "Last 12 Months" },
];

// Colors for charts
const COLORS = {
  primary: "#f97316", // amber-500
  success: "#22c55e", // green-500
  danger: "#ef4444", // red-500
  warning: "#eab308", // yellow-500
  info: "#3b82f6", // blue-500
  purple: "#a855f7", // purple-500
  navy: "#1a2b4c",
  navyLight: "#2c3e6e",
};

// Simple formatter functions that return arrays
const formatRevenue = (value: any) => {
  const numValue = typeof value === "number" ? value : 0;
  return [`KES ${numValue.toLocaleString()}`, "Revenue"];
};

const formatCount = (value: any) => {
  const numValue = typeof value === "number" ? value : 0;
  return [numValue.toString(), "Count"];
};

// Custom label for pie charts to handle undefined percent
const renderPieLabel = (entry: any): string => {
  const { name, percent } = entry;
  const percentage =
    typeof percent === "number" ? (percent * 100).toFixed(0) : "0";
  return `${name} ${percentage}%`;
};

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch data
  const customers = useQuery(api.customers.queries.getAllCustomers);
  const payments = useQuery(api.payments.queries.getAllPayments);
  const subscriptions = useQuery(
    api.subscriptions.queries.getActiveSubscriptions,
  );
  const paymentStats = useQuery(api.payments.queries.getPaymentStats);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  if (!customers || !payments || !subscriptions || !paymentStats) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Calculate date range in milliseconds
  const now = Date.now();
  const dayMs = 86400000;
  let startDate = now;
  switch (dateRange) {
    case "7d":
      startDate = now - 7 * dayMs;
      break;
    case "30d":
      startDate = now - 30 * dayMs;
      break;
    case "90d":
      startDate = now - 90 * dayMs;
      break;
    case "12m":
      startDate = now - 365 * dayMs;
      break;
  }

  // Filter payments by date range
  const filteredPayments = payments.filter((p) => p.createdAt >= startDate);

  // Revenue over time
  const revenueOverTime = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((acc: any[], payment) => {
      const date = new Date(payment.createdAt).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.amount += payment.amount;
        existing.count += 1;
      } else {
        acc.push({ date, amount: payment.amount, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Payment status distribution
  const paymentStatusData = [
    {
      name: "Completed",
      value: filteredPayments.filter((p) => p.status === "completed").length,
      color: COLORS.success,
    },
    {
      name: "Pending",
      value: filteredPayments.filter((p) => p.status === "pending").length,
      color: COLORS.warning,
    },
    {
      name: "Failed",
      value: filteredPayments.filter((p) => p.status === "failed").length,
      color: COLORS.danger,
    },
  ].filter((item) => item.value > 0);

  // Plan type distribution
  const hotspotCount = customers.filter((c) => c.planType === "hotspot").length;
  const pppoeCount = customers.filter((c) => c.planType === "pppoe").length;
  const planTypeData = [
    { name: "Hotspot", value: hotspotCount, color: COLORS.primary },
    { name: "PPPoE", value: pppoeCount, color: COLORS.info },
  ].filter((item) => item.value > 0);

  // Daily average revenue
  const avgDailyRevenue =
    revenueOverTime.length > 0
      ? revenueOverTime.reduce((sum, day) => sum + day.amount, 0) /
        revenueOverTime.length
      : 0;

  // Customer growth
  const customersByDate = customers
    .filter((c) => c.created >= startDate)
    .reduce((acc: any[], customer) => {
      const date = new Date(customer.created).toLocaleDateString();
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ date, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate growth rates
  const previousPeriodStart = startDate - (now - startDate);
  const previousPayments = payments.filter(
    (p) => p.createdAt >= previousPeriodStart && p.createdAt < startDate,
  );
  const previousRevenue = previousPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);
  const currentRevenue = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const revenueGrowth =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

  const previousCustomers = customers.filter(
    (c) => c.created >= previousPeriodStart && c.created < startDate,
  ).length;
  const currentCustomers = customers.filter(
    (c) => c.created >= startDate,
  ).length;
  const customerGrowth =
    previousCustomers > 0
      ? ((currentCustomers - previousCustomers) / previousCustomers) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-2xl font-bold text-amber-500">Analytics</span>
          <p className="text-sm text-gray-300 mt-1">
            Track your business performance and growth
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-navy-light border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {dateRanges.map((range) => (
              <option
                key={range.value}
                value={range.value}
                className="bg-navy text-white"
              >
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            className="p-2 bg-navy-light border border-gray-700 rounded-lg hover:bg-navy transition-colors"
          >
            <RefreshCw
              className={`w-5 h-5 text-amber-500 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
          <button className="p-2 bg-navy-light border border-gray-700 rounded-lg hover:bg-navy transition-colors">
            <Download className="w-5 h-5 text-amber-500" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-amber-500" />
            </div>
            <div
              className={`flex items-center ${revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {revenueGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-white">
            KES {currentRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-2">vs previous period</p>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div
              className={`flex items-center ${customerGrowth >= 0 ? "text-green-500" : "text-red-500"}`}
            >
              {customerGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(customerGrowth).toFixed(1)}%
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-1">New Customers</p>
          <p className="text-2xl font-bold text-white">{currentCustomers}</p>
          <p className="text-xs text-gray-500 mt-2">
            {previousCustomers} previous period
          </p>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-500" />
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-1">Transactions</p>
          <p className="text-2xl font-bold text-white">
            {filteredPayments.length}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            {filteredPayments.filter((p) => p.status === "completed").length}{" "}
            successful
          </p>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-sm text-gray-400 mb-1">Avg. Daily Revenue</p>
          <p className="text-2xl font-bold text-white">
            KES {avgDailyRevenue.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Over {revenueOverTime.length} days
          </p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-amber-500">
              Revenue Trend
            </span>
            <BarChart3 className="w-5 h-5 text-amber-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueOverTime}>
                <defs>
                  <linearGradient
                    id="revenueGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={COLORS.primary}
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor={COLORS.primary}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  tickFormatter={(value) => `KES ${value}`}
                />
                <Tooltip
                  formatter={formatRevenue}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#f97316" }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Growth */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-amber-500">
              Customer Growth
            </span>
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customersByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                />
                <Tooltip
                  formatter={formatCount}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  labelStyle={{ color: "#f97316" }}
                />
                <Bar dataKey="count" fill={COLORS.info} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Status Distribution */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-4">
            Payment Status
          </span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={renderPieLabel}
                  labelLine={{ stroke: "#4b5563" }}
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={formatCount}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {paymentStatusData.map((item) => (
              <div key={item.name} className="text-center">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-xs text-gray-400">{item.name}</p>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-4">
            Plan Distribution
          </span>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={planTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={renderPieLabel}
                  labelLine={{ stroke: "#4b5563" }}
                >
                  {planTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={formatCount}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {planTypeData.map((item) => (
              <div key={item.name} className="text-center">
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1"
                  style={{ backgroundColor: item.color }}
                />
                <p className="text-xs text-gray-400">{item.name}</p>
                <p className="text-sm font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
          <span className="text-lg font-semibold text-amber-500 mb-4">
            Quick Stats
          </span>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-navy/50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                <span className="text-sm text-gray-300">Success Rate</span>
              </div>
              <span className="font-semibold text-white">
                {(
                  (filteredPayments.filter((p) => p.status === "completed")
                    .length /
                    filteredPayments.length) *
                    100 || 0
                ).toFixed(1)}
                %
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-navy/50 rounded-lg">
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-amber-500 mr-2" />
                <span className="text-sm text-gray-300">Active Users</span>
              </div>
              <span className="font-semibold text-white">
                {subscriptions.length}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-navy/50 rounded-lg">
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-sm text-gray-300">Avg. Transaction</span>
              </div>
              <span className="font-semibold text-white">
                KES{" "}
                {(
                  filteredPayments.reduce((sum, p) => sum + p.amount, 0) /
                    filteredPayments.length || 0
                ).toFixed(0)}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-navy/50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-purple-500 mr-2" />
                <span className="text-sm text-gray-300">Peak Day</span>
              </div>
              <span className="font-semibold text-white">
                {revenueOverTime.reduce(
                  (max, day) => (day.amount > max.amount ? day : max),
                  { amount: 0 },
                ).date || "N/A"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-navy/50 rounded-lg">
              <div className="flex items-center">
                <Users className="w-4 h-4 text-amber-500 mr-2" />
                <span className="text-sm text-gray-300">Total Customers</span>
              </div>
              <span className="font-semibold text-white">
                {customers.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-6 border border-gray-800">
        <span className="text-lg font-semibold text-amber-500 mb-4">
          Recent Activity
        </span>
        <div className="space-y-3">
          {payments.slice(0, 5).map((payment) => {
            const customer = customers.find(
              (c) => c._id === payment.customerId,
            );
            return (
              <div
                key={payment._id}
                className="flex items-center justify-between p-3 bg-navy/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      payment.status === "completed"
                        ? "bg-green-500"
                        : payment.status === "pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {customer?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {payment.planName || payment.serviceType} • KES{" "}
                      {payment.amount}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
