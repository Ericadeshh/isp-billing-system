"use client";

import { usePlans } from "@/hooks/usePlans";
import { Plan } from "@/types";
import PlanCard from "./PlanCard";
import { RefreshCw } from "lucide-react";

interface PlanListProps {
  onSelectPlan: (plan: Plan) => void;
}

export default function PlanList({ onSelectPlan }: PlanListProps) {
  const { plans, isLoading } = usePlans();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-pumpkin animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading internet plans...</p>
        </div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No internet plans available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plans.map((plan) => (
        <PlanCard key={plan._id} plan={plan} onSelect={onSelectPlan} />
      ))}
    </div>
  );
}
