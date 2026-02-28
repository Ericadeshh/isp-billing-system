"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Wifi,
  Zap,
  Clock,
  DollarSign,
  TrendingUp,
  Eye,
  EyeOff,
  Gauge,
  Database,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  Copy,
  Power,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

interface PlanFormData {
  name: string;
  price: number;
  speed: string;
  duration: number;
  description: string;
  planType: "hotspot" | "pppoe";
  isActive: boolean;
  dataCap?: number;
}

export default function AdminPlans() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Id<"plans"> | null>(null);
  const [formData, setFormData] = useState<PlanFormData>({
    name: "",
    price: 0,
    speed: "",
    duration: 0,
    description: "",
    planType: "hotspot",
    isActive: true,
  });

  const plans = useQuery(api.plans.queries.getAllPlans);
  const createPlan = useMutation(api.plans.mutations.createPlan);
  const updatePlan = useMutation(api.plans.mutations.updatePlan);
  const deletePlan = useMutation(api.plans.mutations.deletePlan);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.name ||
      !formData.price ||
      !formData.speed ||
      !formData.duration ||
      !formData.description
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const loadingToast = toast.loading(
      editingPlan ? "Updating plan..." : "Creating plan...",
    );

    try {
      if (editingPlan) {
        await updatePlan({
          planId: editingPlan._id,
          ...formData,
        });
        toast.success("Plan updated successfully!", { id: loadingToast });
      } else {
        await createPlan(formData);
        toast.success("Plan created successfully!", { id: loadingToast });
      }

      setShowAddModal(false);
      setEditingPlan(null);
      setFormData({
        name: "",
        price: 0,
        speed: "",
        duration: 0,
        description: "",
        planType: "hotspot",
        isActive: true,
      });
    } catch (error) {
      console.error("Error saving plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save plan",
        { id: loadingToast },
      );
    }
  };

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price,
      speed: plan.speed,
      duration: plan.duration,
      description: plan.description,
      planType: plan.planType,
      isActive: plan.isActive,
      dataCap: plan.dataCap,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (planId: Id<"plans">) => {
    const loadingToast = toast.loading("Deleting plan...");
    try {
      await deletePlan({ planId });
      toast.success("Plan deleted successfully!", { id: loadingToast });
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete plan",
        { id: loadingToast },
      );
    }
  };

  const handleToggleActive = async (plan: any) => {
    const loadingToast = toast.loading(
      plan.isActive ? "Deactivating plan..." : "Activating plan...",
    );
    try {
      await updatePlan({
        planId: plan._id,
        isActive: !plan.isActive,
      });
      toast.success(plan.isActive ? "Plan deactivated" : "Plan activated", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast.error("Failed to update plan status", { id: loadingToast });
    }
  };

  const handleDuplicate = (plan: any) => {
    setEditingPlan(null);
    setFormData({
      name: `${plan.name} (Copy)`,
      price: plan.price,
      speed: plan.speed,
      duration: plan.duration,
      description: plan.description,
      planType: plan.planType,
      isActive: true,
      dataCap: plan.dataCap,
    });
    setShowAddModal(true);
  };

  if (!plans) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading plans...</p>
        </div>
      </div>
    );
  }

  const hotspotPlans = plans.filter((p) => p.planType === "hotspot");
  const pppoePlans = plans.filter((p) => p.planType === "pppoe");

  const PlanCard = ({
    plan,
    type,
  }: {
    plan: any;
    type: "hotspot" | "pppoe";
  }) => {
    const isHotspot = type === "hotspot";
    const colors = isHotspot
      ? {
          bg: "from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900",
          border: plan.isActive
            ? "border-amber-500"
            : "border-gray-300 dark:border-gray-700",
          accent: "amber",
          icon: <Zap className="w-5 h-5 text-amber-500" />,
          price: "text-amber-600",
          button: "amber",
        }
      : {
          bg: "from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900",
          border: plan.isActive
            ? "border-blue-500"
            : "border-gray-300 dark:border-gray-700",
          accent: "blue",
          icon: <Wifi className="w-5 h-5 text-blue-500" />,
          price: "text-blue-600",
          button: "blue",
        };

    return (
      <div
        className={`relative group bg-gradient-to-br ${colors.bg} rounded-xl p-6 border-2 ${colors.border} transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
          !plan.isActive ? "opacity-75" : ""
        }`}
      >
        {/* Status Badge */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {!plan.isActive && (
            <span className="flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
              <EyeOff className="w-3 h-3 mr-1" />
              Inactive
            </span>
          )}
          {plan.isActive && (
            <span className="flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full">
              <CheckCircle className="w-3 h-3 mr-1" />
              Active
            </span>
          )}
        </div>

        {/* Plan Icon */}
        <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4 shadow-md">
          {colors.icon}
        </div>

        {/* Plan Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
            {plan.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {plan.description}
          </p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className={`text-3xl font-bold ${colors.price}`}>
            KES {plan.price.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
            /{" "}
            {plan.duration < 1
              ? `${plan.duration * 24}hr`
              : `${plan.duration}d`}
          </span>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Gauge className={`w-4 h-4 mr-2 text-${colors.accent}-500`} />
            <span className="font-medium mr-2">Speed:</span>
            <span className="text-gray-900 dark:text-white">{plan.speed}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Clock className={`w-4 h-4 mr-2 text-${colors.accent}-500`} />
            <span className="font-medium mr-2">Duration:</span>
            <span className="text-gray-900 dark:text-white">
              {plan.duration < 1
                ? `${plan.duration * 24} hours`
                : plan.duration === 1
                  ? "1 day"
                  : `${plan.duration} days`}
            </span>
          </div>

          {plan.dataCap && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Database className={`w-4 h-4 mr-2 text-${colors.accent}-500`} />
              <span className="font-medium mr-2">Data Cap:</span>
              <span className="text-gray-900 dark:text-white">
                {plan.dataCap} GB
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={() => handleToggleActive(plan)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                plan.isActive
                  ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/40"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
              title={plan.isActive ? "Deactivate Plan" : "Activate Plan"}
            >
              <Power className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleDuplicate(plan)}
              className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-all duration-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              title="Duplicate Plan"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(plan)}
              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-all duration-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
              title="Edit Plan"
            >
              <Edit className="w-4 h-4" />
            </button>

            {deleteConfirm === plan._id ? (
              <div className="flex space-x-1">
                <button
                  onClick={() => handleDelete(plan._id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
                  title="Confirm Delete"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(plan._id)}
                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-all duration-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                title="Delete Plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Internet Plans
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Manage your internet plans. Changes reflect immediately for
            customers.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPlan(null);
            setFormData({
              name: "",
              price: 0,
              speed: "",
              duration: 0,
              description: "",
              planType: "hotspot",
              isActive: true,
            });
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 shadow-lg shadow-amber-200 dark:shadow-amber-900/30"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Create New Plan</span>
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Plans
          </p>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">
            {plans.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Active Plans
          </p>
          <p className="text-2xl font-bold text-green-600">
            {plans.filter((p) => p.isActive).length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hotspot Plans
          </p>
          <p className="text-2xl font-bold text-amber-600">
            {hotspotPlans.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            PPPoE Plans
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {pppoePlans.length}
          </p>
        </div>
      </div>

      {/* Hotspot Plans Section */}
      {hotspotPlans.length > 0 && (
        <section>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
              <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                Hotspot Plans
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hourly and daily passes for temporary access
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotspotPlans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} type="hotspot" />
            ))}
          </div>
        </section>
      )}

      {/* PPPoE Plans Section */}
      {pppoePlans.length > 0 && (
        <section>
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <Wifi className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                PPPoE Plans
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monthly subscriptions for business and home users
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pppoePlans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} type="pppoe" />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {plans.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wifi className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No Plans Yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Get started by creating your first internet plan
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Plan</span>
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingPlan ? "Edit Plan" : "Create New Plan"}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPlan(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                      placeholder="e.g., 1 Hour Pass"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Plan Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.planType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          planType: e.target.value as "hotspot" | "pppoe",
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    >
                      <option value="hotspot">Hotspot (Hourly/Daily)</option>
                      <option value="pppoe">PPPoE (Monthly)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price (KES) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="100"
                        required
                        min="0"
                        step="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Speed <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.speed}
                        onChange={(e) =>
                          setFormData({ ...formData, speed: e.target.value })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="e.g., 10 Mbps"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Duration (days) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseFloat(e.target.value) || 0,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="0.0417 for 1 hour"
                        step="0.001"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Equivalent to: {formData.duration * 24} hours
                      {formData.duration >= 1 && ` (${formData.duration} days)`}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Data Cap (GB)
                    </label>
                    <div className="relative">
                      <Database className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.dataCap || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dataCap: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        placeholder="Optional"
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Active (visible to customers immediately)
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                  placeholder="Describe the plan features and benefits..."
                  required
                />
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-white py-3 rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>{editingPlan ? "Update Plan" : "Create Plan"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingPlan(null);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white py-3 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 font-medium"
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
