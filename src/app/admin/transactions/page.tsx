"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Search,
  Filter,
  Download,
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
} from "lucide-react";
import Link from "next/link";

export default function AdminTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  const payments = useQuery(api.payments.queries.getAllPayments);
  const customers = useQuery(api.customers.queries.getAllCustomers);

  if (!payments || !customers) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Filter payments
  const filteredPayments = payments.filter((payment) => {
    const customer = customers.find((c) => c._id === payment.customerId);

    const matchesSearch =
      payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phoneNumber.includes(searchTerm) ||
      customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.planName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status === statusFilter;

    // Date filtering
    let matchesDate = true;
    if (dateFilter !== "all") {
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      if (dateFilter === "today") {
        matchesDate = payment.createdAt > now - day;
      } else if (dateFilter === "week") {
        matchesDate = payment.createdAt > now - 7 * day;
      } else if (dateFilter === "month") {
        matchesDate = payment.createdAt > now - 30 * day;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Calculate totals
  const totalAmount = filteredPayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  const successfulCount = filteredPayments.filter(
    (p) => p.status === "completed",
  ).length;
  const failedCount = filteredPayments.filter(
    (p) => p.status === "failed",
  ).length;
  const pendingCount = filteredPayments.filter(
    (p) => p.status === "pending",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View and manage all payment transactions
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-linear-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-200">
          <Download className="w-4 h-4" />
          <span className="text-sm font-medium">Export Report</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Amount
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            KES {totalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {filteredPayments.length} transactions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Successful
          </p>
          <p className="text-2xl font-bold text-green-600">{successfulCount}</p>
          <p className="text-xs text-gray-400 mt-1">
            {((successfulCount / filteredPayments.length) * 100 || 0).toFixed(
              1,
            )}
            % success rate
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Pending
          </p>
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Failed
          </p>
          <p className="text-2xl font-bold text-red-600">{failedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transaction ID, phone, name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>

          <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment) => {
                const customer = customers.find(
                  (c) => c._id === payment.customerId,
                );

                return (
                  <tr
                    key={payment._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900 dark:text-white">
                        {payment.transactionId.slice(0, 8)}...
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {payment.transactionId.slice(-8)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-linear-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {customer?.name?.charAt(0) || "?"}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer?.name || "Unknown"}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {payment.phoneNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.planName || "N/A"}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Wifi className="w-3 h-3 mr-1" />
                        {payment.serviceType}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        KES {payment.amount.toLocaleString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === "completed"
                            ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                            : payment.status === "pending"
                              ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
                              : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
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
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/transactions/${payment._id}`}
                        className="text-amber-600 hover:text-amber-900 dark:hover:text-amber-400"
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

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredPayments.length} of {payments.length}{" "}
              transactions
            </p>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Previous
              </button>
              <button className="px-3 py-1 bg-amber-500 text-white rounded-lg text-sm">
                1
              </button>
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                2
              </button>
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                3
              </button>
              <button className="px-3 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
