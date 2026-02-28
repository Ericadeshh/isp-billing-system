"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Users,
  Search,
  Plus,
  Edit,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Ban,
  UserX,
  Filter,
  Zap,
  Globe,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface CustomerFormData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  planType?: "hotspot" | "pppoe";
  status?: "active" | "inactive" | "suspended";
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    phone: "",
    email: "",
    address: "",
    planType: "hotspot",
    status: "active",
  });

  const customers = useQuery(api.customers.queries.getAllCustomers);
  const createCustomer = useMutation(api.customers.mutations.registerCustomer);
  const updateCustomer = useMutation(api.customers.mutations.updateCustomer);
  const updateStatus = useMutation(
    api.customers.mutations.updateCustomerStatus,
  );

  if (!customers) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  // Filter customers based on search and status
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Name and phone are required");
      return;
    }

    const loadingToast = toast.loading(
      editingUser ? "Updating user..." : "Creating user...",
    );

    try {
      if (editingUser) {
        await updateCustomer({
          customerId: editingUser._id,
          name: formData.name,
          email: formData.email,
          address: formData.address,
          planType: formData.planType,
          status: formData.status,
        });
        toast.success("User updated successfully", { id: loadingToast });
      } else {
        // created field is handled by the mutation internally
        await createCustomer({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          planType: formData.planType,
          status: formData.status,
        });
        toast.success("User created successfully", { id: loadingToast });
      }

      setShowModal(false);
      setEditingUser(null);
      resetForm();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(error instanceof Error ? error.message : "Operation failed", {
        id: loadingToast,
      });
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      phone: user.phone,
      email: user.email || "",
      address: user.address || "",
      planType: user.planType || "hotspot",
      status: user.status || "active",
    });
    setShowModal(true);
  };

  const handleStatusChange = async (
    userId: Id<"customers">,
    status: "active" | "inactive" | "suspended",
  ) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      await updateStatus({ customerId: userId, status });
      toast.success(`User marked as ${status}`, { id: loadingToast });
    } catch (error) {
      toast.error("Failed to update status", { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      planType: "hotspot",
      status: "active",
    });
  };

  const getStatusBadge = (status: string = "inactive") => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </span>
        );
      case "inactive":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            <UserX className="w-3 h-3 mr-1" /> Inactive
          </span>
        );
      case "suspended":
        return (
          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <Ban className="w-3 h-3 mr-1" /> Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            Unknown
          </span>
        );
    }
  };

  // Calculate stats
  const activeCount = customers.filter((c) => c.status === "active").length;
  const inactiveCount = customers.filter((c) => c.status === "inactive").length;
  const suspendedCount = customers.filter(
    (c) => c.status === "suspended",
  ).length;

  // Calculate hotspot and pppoe counts
  const hotspotCount = customers.filter((c) => c.planType === "hotspot").length;
  const pppoeCount = customers.filter((c) => c.planType === "pppoe").length;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-2xl font-bold text-amber-500 flex items-center gap-2">
            <Users className="w-6 h-6" />
            Users
          </span>
          <p className="text-sm text-gray-400 mt-1">
            Manage your customers and their accounts
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center justify-center space-x-2 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add User</span>
        </button>
      </div>

      {/* Stats Cards - Updated with translucent navy theme */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-bold text-amber-500">
            {customers.length}
          </p>
        </div>
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-400">{activeCount}</p>
        </div>
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">{inactiveCount}</p>
        </div>
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Suspended</p>
          <p className="text-2xl font-bold text-red-400">{suspendedCount}</p>
        </div>
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" /> Hotspot
          </p>
          <p className="text-2xl font-bold text-amber-500">{hotspotCount}</p>
        </div>
        <div className="bg-navy-light/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
          <p className="text-sm text-gray-400 flex items-center gap-1">
            <Globe className="w-3 h-3 text-blue-400" /> PPPoE
          </p>
          <p className="text-2xl font-bold text-blue-400">{pppoeCount}</p>
        </div>
      </div>

      {/* Search and Filters - Updated with navy theme */}
      <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table - Updated with navy theme */}
      <div className="bg-navy-light/30 backdrop-blur-sm rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-250">
            <thead className="bg-navy/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Plan Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-amber-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredCustomers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-navy/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-white">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {user._id.slice(-6)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm flex items-center text-gray-300">
                      <Phone className="w-3 h-3 mr-1 text-gray-500" />{" "}
                      {user.phone}
                    </p>
                    {user.email && (
                      <p className="text-xs flex items-center text-gray-500 mt-1">
                        <Mail className="w-3 h-3 mr-1" /> {user.email}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.planType ? (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1 ${
                          user.planType === "hotspot"
                            ? "bg-amber-500/20 text-amber-500"
                            : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {user.planType === "hotspot" ? (
                          <Zap className="w-3 h-3" />
                        ) : (
                          <Globe className="w-3 h-3" />
                        )}
                        {user.planType === "hotspot" ? "Hotspot" : "PPPoE"}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-500/20 text-gray-400">
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                      {new Date(user.created).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      <select
                        value={user.status || "inactive"}
                        onChange={(e) =>
                          handleStatusChange(user._id, e.target.value as any)
                        }
                        className="text-xs bg-navy/50 border border-gray-700 text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                        title="Edit user"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No users found</p>
          </div>
        )}
      </div>

      {/* Add/Edit User Modal - Keep as is */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-navy-light rounded-xl max-w-md w-full border border-gray-800">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-amber-500">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="254700000000"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Nairobi, Kenya"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Plan Type
                  </label>
                  <select
                    value={formData.planType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        planType: e.target.value as "hotspot" | "pppoe",
                      })
                    }
                    className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="hotspot">Hotspot</option>
                    <option value="pppoe">PPPoE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2 bg-navy/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 text-white py-2 rounded-lg hover:bg-amber-600 transition-colors font-medium"
                >
                  {editingUser ? "Update User" : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingUser(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
