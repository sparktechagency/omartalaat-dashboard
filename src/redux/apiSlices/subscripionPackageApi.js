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
          url: "/admin/package/managements",
          method: "GET",
          params
        };
      },
      providesTags: ["SubscriptionPackage"],
    }),



    // POST: Create a new push notification
    createSubscriptionPackage: builder.mutation({
      query: (data) => ({
        url: "/admin/package/managements",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["SubscriptionPackage"],
    }),

    // PATCH: Update a push notification
    updateSubscriptionPackage: builder.mutation({
      query: ({ id, data }) => ({
        url: `/admin/package/managements/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["SubscriptionPackage"],
    }),

    // DELETE: Delete a push notification
    deleteSubscriptionPackage: builder.mutation({
      query: (id) => ({
        url: `/admin/package/managements/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SubscriptionPackage"],
    }),


  }),
});

export const {
  useGetAllSubscriptionPackageQuery,
  useCreateSubscriptionPackageMutation,
  useUpdateSubscriptionPackageMutation,
  useDeleteSubscriptionPackageMutation

} = subscriptionPackageApi;


