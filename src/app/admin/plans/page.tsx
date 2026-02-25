"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  Zap,
  Clock,
  Wifi,
} from "lucide-react";
import Link from "next/link";

export default function AdminPlansPage() {
  const plans = useQuery(api.plans.queries.getAllPlans);
  const createPlan = useMutation(api.plans.mutations.createPlan);
  const updatePlan = useMutation(api.plans.mutations.updatePlan);
  const deletePlan = useMutation(api.plans.mutations.deletePlan);

  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    speed: "",
    duration: "",
    description: "",
    planType: "hotspot",
  });

  if (!plans) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manage Plans</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {plan.name}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    plan.planType === "hotspot"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {plan.planType}
                </span>
              </div>
              <div className="flex space-x-2">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Edit className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-amber-500">
                KES {plan.price}
              </p>
              <div className="flex items-center text-gray-600">
                <Zap className="w-4 h-4 mr-2 text-amber-500" />
                <span>{plan.speed}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-4 h-4 mr-2 text-amber-500" />
                <span>{plan.duration} days</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
