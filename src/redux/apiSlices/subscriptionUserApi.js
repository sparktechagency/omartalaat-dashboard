import { api } from "../api/baseApi";

const subscriptionApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all subscriptions with pagination and filters
    getAllSubscriptions: builder.query({
      query: (args) => {
        const params = new URLSearchParams();

        // Default pagination
        params.append("page", "1");
        params.append("limit", "10");

        if (args && args.length > 0) {
          args.forEach((arg) => {
            if (
              arg.value !== undefined &&
              arg.value !== null &&
              arg.value !== ""
            ) {
              params.append(arg.name, arg.value);
            }
          });
        }

        return {
          url: "/admin/subscription", 
          method: "GET",
          params,
        };
      },
      transformResponse: (response) => {
        const parsed = response;
        return {
          subscriptions: parsed.data?.data || [],
          meta: parsed.data?.meta || {
            page: 1,
            limit: 10,
            total: 0,
            totalPage: 1,
          },
        };
      },
      providesTags: ["Subscription"],
    }),

    // Get subscription details by ID
    getSubscriptionDetails: builder.query({
      query: (subscriptionId) => {
        return {
          url: `/admin/subscriptions/${subscriptionId}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        const parsed =
          typeof response === "string" ? JSON.parse(response) : response;
        return parsed.data;
      },
      providesTags: (result, error, id) => [{ type: "Subscription", id }],
    }),

    // Update subscription status
    updateSubscriptionStatus: builder.mutation({
      query: ({ subscriptionId, status }) => ({
        url: `/admin/subscriptions/${subscriptionId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Subscription"],
    }),

    // Cancel subscription
    cancelSubscription: builder.mutation({
      query: (subscriptionId) => ({
        url: `/admin/subscriptions/${subscriptionId}/cancel`,
        method: "PATCH",
      }),
      invalidatesTags: ["Subscription"],
    }),
  }),
});

export const {
  useGetAllSubscriptionsQuery,
  useGetSubscriptionDetailsQuery,
  useUpdateSubscriptionStatusMutation,
  useCancelSubscriptionMutation,
} = subscriptionApi;
