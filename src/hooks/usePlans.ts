import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

export interface PlanFormData {
  name: string;
  price: number;
  speed: string;
  duration: number;
  dataCap?: number;
  description: string;
  planType: "hotspot" | "pppoe"; // Add this required field
}

export function usePlans() {
  // Queries
  const allPlans = useQuery(api.plans.queries.getAllPlans);
  const getPlan = (planId: Id<"plans">) =>
    useQuery(api.plans.queries.getPlan, { planId });

  // Mutations
  const createPlan = useMutation(api.plans.mutations.createPlan);
  const updatePlan = useMutation(api.plans.mutations.updatePlan);
  const deletePlan = useMutation(api.plans.mutations.deletePlan);

  // Helper functions
  const addPlan = async (planData: PlanFormData) => {
    return await createPlan(planData);
  };

  const editPlan = async (
    planId: Id<"plans">,
    planData: Partial<PlanFormData>,
  ) => {
    return await updatePlan({ planId, ...planData });
  };

  const removePlan = async (planId: Id<"plans">) => {
    return await deletePlan({ planId });
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return `KES ${price.toLocaleString()}`;
  };

  // Format duration for display
  const formatDuration = (days: number) => {
    if (days === 30) return "Monthly";
    if (days === 90) return "Quarterly";
    if (days === 365) return "Yearly";
    if (days < 1) return `${days * 24} Hours`;
    return `${days} days`;
  };

  return {
    // Data
    plans: allPlans,
    getPlan,

    // Actions
    addPlan,
    editPlan,
    removePlan,

    // Utilities
    formatPrice,
    formatDuration,

    // Loading state
    isLoading: allPlans === undefined,
  };
}
