"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar,
  DollarSign,
  Phone,
  User,
  Wifi,
  TrendingUp,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";

export default function AdminTransactions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const payments = useQuery(api.payments.queries.getAllPayments);
  const customers = useQuery(api.customers.queries.getAllCustomers);

  if (!payments || !customers) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const filteredPayments = payments.filter((payment) => {
    const customer = customers.find((c) => c._id === payment.customerId);

    const matchesSearch =
      payment.transactionId.toLowerCase().includes(search.toLowerCase()) ||
      payment.phoneNumber.includes(search) ||
      customer?.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;

    let matchesDate = true;
    if (dateFilter !== "all") {
      const now = Date.now();
      const day = 86400000;
      if (dateFilter === "today") matchesDate = payment.createdAt > now - day;
      if (dateFilter === "week")
        matchesDate = payment.createdAt > now - 7 * day;
      if (dateFilter === "month")
        matchesDate = payment.createdAt > now - 30 * day;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
            <XCircle className="w-3 h-3 mr-1" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  const totalAmount = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulCount = filteredPayments.filter(
    (p) => p.status === "completed",
  ).length;
  const pendingCount = filteredPayments.filter(
    (p) => p.status === "pending",
  ).length;
  const failedCount = filteredPayments.filter(
    (p) => p.status === "failed",
  ).length;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <span className="text-2xl font-bold text-amber-500 flex items-center gap-2">
          <DollarSign className="w-6 h-6" />
          Transactions
        </span>
        <p className="text-sm text-gray-400 mt-1">
          View and manage all payments
        </p>
      </div>

      {/* Stats Cards - Updated with navy theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Total Amount</p>
          <p className="text-2xl font-bold text-amber-500">
            KES {totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">All time</p>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Transactions</p>
          <p className="text-2xl font-bold text-blue-400">
            {filteredPayments.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total count</p>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Successful</p>
          <p className="text-2xl font-bold text-green-400">{successfulCount}</p>
          <p className="text-xs text-gray-500 mt-1">
            {((successfulCount / filteredPayments.length) * 100 || 0).toFixed(
              1,
            )}
            % of total
          </p>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Pending</p>
          <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
        </div>

        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Failed</p>
          <p className="text-2xl font-bold text-red-400">{failedCount}</p>
          <p className="text-xs text-gray-500 mt-1">Need attention</p>
        </div>
      </div>

      {/* Filters - Updated with navy theme */}
      <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by transaction ID, phone, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500 sm:w-40"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Transactions Table - Updated with navy theme */}
      <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250">
            <thead className="bg-navy/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPayments.slice(0, 20).map((payment) => {
                const customer = customers.find(
                  (c) => c._id === payment.customerId,
                );

                return (
                  <tr
                    key={payment._id}
                    className="hover:bg-navy/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-300">
                        {payment.transactionId.slice(0, 8)}...
                      </span>
                      <span className="font-mono text-xs text-gray-500 block">
                        {payment.transactionId.slice(-8)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 text-sm font-semibold">
                          {customer?.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-white">
                            {customer?.name || "Unknown"}
                          </p>
                          <p className="text-xs flex items-center text-gray-400 mt-1">
                            <Phone className="w-3 h-3 mr-1 text-gray-500" />
                            {payment.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-white">
                        {payment.planName || (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </p>
                      <p className="text-xs flex items-center text-gray-400 mt-1">
                        <Wifi className="w-3 h-3 mr-1 text-gray-500" />
                        {payment.serviceType === "hotspot"
                          ? "Hotspot"
                          : "PPPoE"}
                      </p>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-amber-500">
                        KES {payment.amount.toLocaleString()}
                      </p>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-white">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs flex items-center text-gray-400 mt-1">
                        <Clock className="w-3 h-3 mr-1 text-gray-500" />
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </p>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={`/admin/transactions/${payment._id}`}
                        className="inline-flex items-center p-2 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No transactions found</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
