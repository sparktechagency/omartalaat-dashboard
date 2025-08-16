import { api } from "../api/baseApi";

const comingSoonApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // POST: Create a new Coming Soon entry
    createComingSoon: builder.mutation({
      query: (data) => {
        return {
          url: "/admin/comingSoon/create",
          method: "POST",
          body: data,
        };
      },
    }),

    // GET: Retrieve all Coming Soon entries
    getAllComingSoon: builder.query({
      query: () => {
        return {
          url: "/admin/comingSoon",
          method: "GET",
        };
      },
      // transformResponse: ({ data }) => {
      //   return data;
      // },
    }),

    getComingSoonById: builder.query({
      query: (id) => `/admin/comingSoon/${id}`,
      method: "GET",
    }),

    // PATCH: Update a Coming Soon entry
    updateComingSoon: builder.mutation({
      query: ({ id, comingSoonData }) => {
        return {
          url: `/admin/comingSoon/${id}`,
          method: "PATCH",
          body: comingSoonData,
        };
      },
    }),

    // DELETE: Delete a Coming Soon entry
    deleteComingSoon: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/comingSoon/${id}`,
          method: "DELETE",
        };
      },
    }),

    updateComingSoonStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/admin/comingSoon/${id}/status`,
          method: "PATCH",
          body: { status },
        };
      },
    }),
  }),
});

export const {
  useCreateComingSoonMutation,
  useGetAllComingSoonQuery,
  useUpdateComingSoonMutation,
  useDeleteComingSoonMutation,
  useUpdateComingSoonStatusMutation,
  useGetComingSoonByIdQuery,
} = comingSoonApi;
