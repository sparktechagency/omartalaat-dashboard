
import { api } from "../api/baseApi";

const theVaultApi = api.injectEndpoints({


  endpoints: (builder) => ({
    getTheVault: builder.query({


      query: (args) => {
              const params = new URLSearchParams();
        if (args && args.length > 0) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: "/admin/vault",
          method: "GET",
          params
        };
      },
      providesTags: ["TotalEarning"],
    }),

    createTheVault: builder.mutation({
      query: (data) => ({
        url: `/admin/vault/add-otp`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TotalEarning"],
    }),

    deleteTheVault: builder.mutation({
      query: (id) => ({
        url: `/admin/vault/delete-password/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TotalEarning"],
    }),
  }),
});

export const {
    useGetTheVaultQuery,
    useCreateTheVaultMutation,
    useDeleteTheVaultMutation,

} = theVaultApi;



