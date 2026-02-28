import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

interface RegisterCustomerData {
  phone: string;
  name: string;
  email?: string;
  address?: string;
  routerIp?: string;
  macAddress?: string;
}

export function useCustomer() {
  // Queries - always call hooks at the top level
  const getAllCustomers = useQuery(api.customers.queries.getAllCustomers);

  // Mutations
  const registerCustomer = useMutation(
    api.customers.mutations.registerCustomer,
  );
  const updateCustomer = useMutation(api.customers.mutations.updateCustomer);

  // Helper function to get customer by phone - this returns a query but doesn't execute it
  // You'll need to use this in components with useQuery directly
  const getCustomerByPhoneQuery = (phone: string) => {
    // This returns the query function, not the result
    return api.customers.queries.getCustomerByPhone;
  };

  // Helper functions
  const register = async (customerData: RegisterCustomerData) => {
    return await registerCustomer(customerData);
  };

  const update = async (
    customerId: Id<"customers">,
    updates: Partial<RegisterCustomerData>,
  ) => {
    return await updateCustomer({ customerId, ...updates });
  };

  return {
    // Data
    customers: getAllCustomers,

    // Query references (to be used with useQuery in components)
    getCustomerByPhoneQuery,

    // Actions
    register,
    update,

    // Loading states
    isLoading: getAllCustomers === undefined,
  };
}
