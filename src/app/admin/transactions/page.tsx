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
          <span className="badge-success flex items-center">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </span>
        );
      case "pending":
        return (
          <span className="badge-pending flex items-center">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case "failed":
        return (
          <span className="badge-failed flex items-center">
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

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div>
        <span className="text-2xl font-bold text-amber-500">
          <DollarSign />
          Transactions
        </span>
        <p className="text-sm text-gray-300 mt-1">
          View and manage all payments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-100 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Total Amount</p>
          <p className="text-2xl font-bold text-amber-500">
            KES {totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-blue-100 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Transactions</p>
          <p className="text-2xl font-bold text-blue-600">
            {filteredPayments.length}
          </p>
        </div>
        <div className="bg-green-100 rounded-lg p-4 shadow-sm">
          <p className="text-sm text-gray-600">Success Rate</p>
          <p className="text-2xl font-bold text-green-600">
            {(
              (filteredPayments.filter((p) => p.status === "completed").length /
                filteredPayments.length) *
                100 || 0
            ).toFixed(1)}
            %
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-amber-50 rounded-lg shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by transaction ID, phone, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field sm:w-40"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="table-header">Transaction ID</th>
                <th className="table-header">Customer</th>
                <th className="table-header">Plan</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Date</th>
                <th className="table-header text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPayments.slice(0, 20).map((payment) => {
                const customer = customers.find(
                  (c) => c._id === payment.customerId,
                );

                return (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <span className="font-mono text-sm">
                        {payment.transactionId.slice(0, 8)}...
                      </span>
                    </td>

                    <td className="table-cell">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 text-xs">
                          {customer?.name?.charAt(0) || "?"}
                        </div>
                        <div className="ml-2">
                          <p className="text-sm font-medium">
                            {customer?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.phoneNumber}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="table-cell">
                      <p className="text-sm">{payment.planName || "N/A"}</p>
                      <p className="text-xs text-gray-500">
                        {payment.serviceType}
                      </p>
                    </td>

                    <td className="table-cell font-medium">
                      KES {payment.amount.toLocaleString()}
                    </td>

                    <td className="table-cell">
                      {getStatusBadge(payment.status)}
                    </td>

                    <td className="table-cell">
                      <p className="text-sm">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(payment.createdAt).toLocaleTimeString()}
                      </p>
                    </td>

                    <td className="table-cell text-right">
                      <Link
                        href={`/admin/transactions/${payment._id}`}
                        className="inline-block p-1 text-amber-600 hover:bg-amber-50 rounded"
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
      </div>
    </div>
  );
}
