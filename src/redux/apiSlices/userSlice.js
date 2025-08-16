import { api } from "../api/baseApi";


const userManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && args.length > 0) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: "/admin/users/managements",
          method: "GET",
          params,
        };
      },
      transformResponse: (response) => {
        const parsed = response;
        return {
          users: parsed.data,
          pagination: parsed.pagination,
        };
      },
    }),

    // Update user status (active/blocked)
    updateUserStatus: builder.mutation({
      query: ({ userId, status }) => {
        return {
          url: `/admin/users/managements/status/${userId}`,
          method: "PATCH",

          body: { status },
        };
      },
    }),

    // Get user details by ID
    getUserDetails: builder.query({
      query: (userId) => {
        return {
          url: `/users/${userId}`,
          method: "GET",
        };
      },
      transformResponse: (response) => {
        let parsed;
        try {
          parsed =
            typeof response === "string" ? JSON.parse(response) : response;
        } catch (e) {
          parsed = response;
        }

        return parsed.data;
      },
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useGetUserDetailsQuery,
} = userManagementApi;
