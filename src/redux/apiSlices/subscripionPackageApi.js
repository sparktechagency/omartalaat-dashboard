import { api } from "../api/baseApi";

const subscriptionPackageApi = api.injectEndpoints({


  endpoints: (builder) => ({
    getAllSubscriptionPackage: builder.query({
      query: (args) => {
              const params = new URLSearchParams();
        if (args && args.length > 0) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: "/admin/product-orders/get-order-revenue",
          method: "GET",
          params
        };
      },
      providesTags: ["SubscriptionPackage"],
    }),

    // GET: Get all push notifications with filtering and pagination
    getSingleSubscriptionPackage: builder.query({
      query: () => {
        return {
          url: `/admin/push-notifications`,
          method: "GET",
          params,
        }
      },

    }),
  }),
});

export const {
    useGetAllTotalEarningQuery,
    useGetSingleTotalEarningQuery,


} = subscriptionPackageApi;


