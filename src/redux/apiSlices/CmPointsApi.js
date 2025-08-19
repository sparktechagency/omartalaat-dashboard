import { api } from "../api/baseApi";


const cmPointsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCmPoints: builder.query({
      query: (args) => {
              const params = new URLSearchParams();
        if (args && args.length > 0) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: "/admin/cm-point/get-monthly-reward",
          method: "GET",
          params
        };
      },
      providesTags: ["TotalEarning"],
    }),

    createCmPoints: builder.mutation({
      query: (data) => ({
        url: `/admin/cm-point/create-monthly-reward`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TotalEarning"],
    }),
    updateCmPoints: builder.mutation({
      query: (data) => ({
        url: `/admin/cm-point/update-monthly-reward`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TotalEarning"],
    }),


    deleteCmPoints: builder.mutation({
      query: (id) => ({
        url: `/admin/cm-point/delete-monthly-reward/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TotalEarning"],
    }),
    updateCmPointsStatus: builder.mutation({
      query: (data) => ({
        url: `/admin/vault/update-status`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["TotalEarning"],
    }),

  }),
});

export const {
    useGetCmPointsQuery,
    useCreateCmPointsMutation,
    useUpdateCmPointsMutation,
    useDeleteCmPointsMutation,
    useUpdateCmPointsStatusMutation,


} = cmPointsApi;



