import { api } from "../api/baseApi";

const analyticsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getRevenue: builder.query({
      query: () => {
        return {
          url: "/admin/dashboard/revenue",
          method: "GET",
        };
      },
      transformResponse: ({ data }) => {
        return data; 
      },
    }),

    getStatistics: builder.query({
      query: () => {
        return {
          url: "/admin/dashboard/analysis",
          method: "GET",
        };
      },
      transformResponse: ({ data }) => {
        return data; 
      },
    }),

    getRecentUsers: builder.query({
      query: () => {
        return {
          url: "/admin/dashboard/resent-users",
          method: "GET",
        };
      },
      transformResponse: ({ data }) => {
        return data; 
      },
    }),
  }),
});

export const {
  useGetRevenueQuery,
  useGetStatisticsQuery,
  useGetRecentUsersQuery,
} = analyticsApi;
