import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

export interface PlanFormData {
  name: string;
  price: number;
  speed: string;
  duration: number;
  dataCap?: number;
  description: string;
  planType: "hotspot" | "pppoe";
  isActive: boolean; // Added this required field
}

export function usePlans() {
  // Queries
  const allPlans = useQuery(api.plans.queries.getAllPlans);

  // Note: getPlan is a function that returns a query hook, not to be called directly
  // Use it like: const plan = usePlan(planId) - but that would be a separate hook
  const getPlan = (planId: Id<"plans">) => {
    return useQuery(api.plans.queries.getPlan, { planId });
  };

  // Mutations
  const createPlan = useMutation(api.plans.mutations.createPlan);
  const updatePlan = useMutation(api.plans.mutations.updatePlan);
  const deletePlan = useMutation(api.plans.mutations.deletePlan);
  const togglePlanStatus = useMutation(api.plans.mutations.togglePlanStatus);

  // Helper functions
  const addPlan = async (planData: PlanFormData) => {
    // Ensure all required fields are present
    return await createPlan({
      name: planData.name,
      price: planData.price,
      speed: planData.speed,
      duration: planData.duration,
      dataCap: planData.dataCap,
      description: planData.description,
      planType: planData.planType,
      isActive: planData.isActive ?? true, // Default to true if not provided
    });
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

  const toggleActive = async (planId: Id<"plans">, isActive: boolean) => {
    return await togglePlanStatus({ planId, isActive });
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
    if (days === 1) return "1 Day";
    return `${days} Days`;
  };

  return {
    // Data
    plans: allPlans,
    getPlan,

    // Actions
    addPlan,
    editPlan,
    removePlan,
    toggleActive,

    // Utilities
    formatPrice,
    formatDuration,

    // Loading state
    isLoading: allPlans === undefined,
  };
}

// Optional: Create a separate hook for getting a single plan
export function usePlan(planId: Id<"plans"> | null) {
  return useQuery(api.plans.queries.getPlan, planId ? { planId } : "skip");
}
