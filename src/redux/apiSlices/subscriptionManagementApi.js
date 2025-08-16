import { api } from "../api/baseApi";

const subscriptionApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // Subscription Rules Endpoints
    getSubscriptionRules: builder.query({
      query: () => {
        return {
          url: "/admin/subscription/rules",
          method: "GET",
        };
      },
      transformResponse: ({ data }) => {
        return data;
      },
      providesTags: ["SubscriptionRules"],
    }),

    createSubscriptionRule: builder.mutation({
      query: (ruleData) => {
        return {
          url: "/admin/subscription/rules/create",
          method: "POST",
          body: ruleData,
        };
      },
      invalidatesTags: ["SubscriptionRules"],
    }),

    updateSubscriptionRule: builder.mutation({
      query: ({ id, ...ruleData }) => {
        return {
          url: `/admin/subscription/rules/update/${id}`,
          method: "PATCH",
          body: ruleData,
        };
      },
      invalidatesTags: ["SubscriptionRules"],
    }),

    deleteSubscriptionRule: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/subscription/rules/delete/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["SubscriptionRules"],
    }),

    // Subscription Packages Endpoints
    getSubscriptionPackages: builder.query({
      query: () => {
        return {
          url: "/admin/package/managment",
          method: "GET",
        };
      },
      transformResponse: ({ data }) => {
        return data;
      },
      providesTags: ["SubscriptionPackages"],
    }),

    createSubscriptionPackage: builder.mutation({
      query: (packageData) => {
        return {
          url: "/admin/package/managment",
          method: "POST",
          body: packageData,
        };
      },
      invalidatesTags: ["SubscriptionPackages"],
    }),

    updateSubscriptionPackage: builder.mutation({
      query: ({ id, ...packageData }) => {
        return {
          url: `/admin/package/managment/${id}`,
          method: "PATCH",
          body: packageData,
        };
      },
      invalidatesTags: ["SubscriptionPackages"],
    }),

    deleteSubscriptionPackage: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/package/managment/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["SubscriptionPackages"],
    }),
  }),
});

export const {
  useGetSubscriptionRulesQuery,
  useCreateSubscriptionRuleMutation,
  useUpdateSubscriptionRuleMutation,
  useDeleteSubscriptionRuleMutation,
  useGetSubscriptionPackagesQuery,
  useCreateSubscriptionPackageMutation,
  useUpdateSubscriptionPackageMutation,
  useDeleteSubscriptionPackageMutation,
} = subscriptionApiSlice;
