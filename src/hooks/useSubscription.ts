import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CreateSubscriptionData {
  customerId: Id<"customers">;
  planId: Id<"plans">;
  mpesaTransactionId: string;
  autoRenew: boolean;
}

export function useSubscription() {
  // Queries
  const hasActiveSubscription = (customerId: Id<"customers">) =>
    useQuery(api.subscriptions.queries.hasActiveSubscription, { customerId });

  const getCustomerSubscriptions = (customerId: Id<"customers">) =>
    useQuery(api.subscriptions.queries.getCustomerSubscriptions, {
      customerId,
    });

  const getActiveSubscriptions = useQuery(
    api.subscriptions.queries.getActiveSubscriptions,
  );

  const getExpiringSubscriptions = (daysThreshold: number) =>
    useQuery(api.subscriptions.queries.getExpiringSubscriptions, {
      daysThreshold,
    });

  // Mutations
  const createSubscription = useMutation(
    api.subscriptions.mutations.createSubscription,
  );
  const renewSubscription = useMutation(
    api.subscriptions.mutations.renewSubscription,
  );

  return {
    // Data
    hasActiveSubscription,
    getCustomerSubscriptions,
    getActiveSubscriptions,
    getExpiringSubscriptions,

    // Actions
    createSubscription,
    renewSubscription,
  };
}
