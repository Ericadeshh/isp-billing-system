import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

export interface CreateSubscriptionData {
  customerId: Id<"customers">;
  planId: Id<"plans">;
  mpesaTransactionId: string;
  autoRenew: boolean;
}

export interface SubscriptionWithDetails {
  _id: Id<"subscriptions">;
  customerId: Id<"customers">;
  planId: Id<"plans">;
  status: "active" | "expired" | "suspended";
  startDate: number;
  expiryDate: number;
  lastPayment: number;
  nextPayment: number;
  autoRenew: boolean;
  mpesaTransactionId?: string;
  customer?: {
    name: string;
    phone: string;
    email?: string;
  };
  plan?: {
    name: string;
    price: number;
    speed: string;
    duration: number;
  };
}

export function useSubscription() {
  // Queries - these are functions that return the query result
  const getActiveSubscriptions = useQuery(
    api.subscriptions.queries.getActiveSubscriptions,
  );

  const getAllSubscriptions = useQuery(
    api.subscriptions.queries.getAllSubscriptions,
  );

  // Queries that need parameters - these are query references, not direct results
  const hasActiveSubscription = (customerId: Id<"customers">) => {
    return useQuery(api.subscriptions.queries.hasActiveSubscription, {
      customerId,
    });
  };

  const getCustomerSubscriptions = (customerId: Id<"customers">) => {
    return useQuery(api.subscriptions.queries.getCustomerSubscriptions, {
      customerId,
    });
  };

  const getExpiringSubscriptions = (daysThreshold: number) => {
    return useQuery(api.subscriptions.queries.getExpiringSubscriptions, {
      daysThreshold,
    });
  };

  const getSubscriptionById = (subscriptionId: Id<"subscriptions">) => {
    return useQuery(api.subscriptions.queries.getSubscriptionById, {
      subscriptionId,
    });
  };

  // Mutations
  const createSubscription = useMutation(
    api.subscriptions.mutations.createSubscription,
  );

  const renewSubscription = useMutation(
    api.subscriptions.mutations.renewSubscription,
  );

  const expireSubscriptions = useMutation(
    api.subscriptions.mutations.expireSubscriptions,
  );

  const checkAndExpire = useMutation(
    api.subscriptions.mutations.checkAndExpire,
  );

  // Helper functions
  const createNewSubscription = async (data: CreateSubscriptionData) => {
    return await createSubscription(data);
  };

  const renewExistingSubscription = async (
    subscriptionId: Id<"subscriptions">,
    mpesaTransactionId: string,
  ) => {
    return await renewSubscription({
      subscriptionId,
      mpesaTransactionId,
    });
  };

  const checkExpiredSubscriptions = async () => {
    return await expireSubscriptions({});
  };

  const checkSingleSubscription = async (
    subscriptionId: Id<"subscriptions">,
  ) => {
    return await checkAndExpire({ subscriptionId });
  };

  // Utility functions
  const isActive = (subscription: { status: string; expiryDate: number }) => {
    return (
      subscription.status === "active" && subscription.expiryDate > Date.now()
    );
  };

  const daysUntilExpiry = (expiryDate: number) => {
    return Math.ceil((expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
  };

  const formatExpiryStatus = (expiryDate: number) => {
    const days = daysUntilExpiry(expiryDate);
    if (days < 0) return "Expired";
    if (days === 0) return "Expires today";
    if (days === 1) return "Expires tomorrow";
    if (days <= 7) return `Expires in ${days} days`;
    return `Valid for ${days} days`;
  };

  return {
    // Data
    activeSubscriptions: getActiveSubscriptions,
    allSubscriptions: getAllSubscriptions as
      | SubscriptionWithDetails[]
      | undefined,

    // Query hooks (to be used directly in components)
    hasActiveSubscription,
    getCustomerSubscriptions,
    getExpiringSubscriptions,
    getSubscriptionById,

    // Mutations
    createSubscription: createNewSubscription,
    renewSubscription: renewExistingSubscription,
    expireSubscriptions: checkExpiredSubscriptions,
    checkAndExpire: checkSingleSubscription,

    // Utilities
    isActive,
    daysUntilExpiry,
    formatExpiryStatus,

    // Loading states
    isLoading:
      getActiveSubscriptions === undefined || getAllSubscriptions === undefined,
  };
}

// Individual hook for checking if a customer has active subscription
export function useHasActiveSubscription(customerId: Id<"customers"> | null) {
  return useQuery(
    api.subscriptions.queries.hasActiveSubscription,
    customerId ? { customerId } : "skip",
  );
}

// Individual hook for getting customer subscriptions
export function useCustomerSubscriptions(customerId: Id<"customers"> | null) {
  return useQuery(
    api.subscriptions.queries.getCustomerSubscriptions,
    customerId ? { customerId } : "skip",
  );
}

// Individual hook for getting expiring subscriptions
export function useExpiringSubscriptions(daysThreshold: number = 3) {
  return useQuery(api.subscriptions.queries.getExpiringSubscriptions, {
    daysThreshold,
  });
}
