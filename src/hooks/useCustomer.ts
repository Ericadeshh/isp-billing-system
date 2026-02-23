import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface RegisterCustomerData {
  phone: string;
  name: string;
  email?: string;
  address?: string;
  routerIp?: string;
  macAddress?: string;
}

export function useCustomer() {
  // Queries
  const getCustomerByPhone = (phone: string) =>
    useQuery(api.customers.queries.getCustomerByPhone, { phone });

  const getAllCustomers = useQuery(api.customers.queries.getAllCustomers);

  // Mutations
  const registerCustomer = useMutation(
    api.customers.mutations.registerCustomer,
  );
  const updateCustomer = useMutation(api.customers.mutations.updateCustomer);

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
    getCustomerByPhone,

    // Actions
    register,
    update,

    // Loading states
    isLoading: getAllCustomers === undefined,
  };
}
