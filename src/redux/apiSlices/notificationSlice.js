import { api } from "../api/baseApi";

const notificationSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getNotification: builder.query({
      query: ({ page = 1, limit = 10 }) => {
        return {
          url: `/notifications/admin?page=${page}&limit=${limit}`,
          method: "GET",
        };
      },
      providesTags: ["Notification"],
    }),
    readOneNotification: builder.mutation({
      query: (id) => {
        return {
          url: `/notifications/admin/single/${id}`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["Notification"],
    }),
    readAllNotification: builder.mutation({
      query: () => {
        return {
          url: `/notifications`,
          method: "PATCH",
        };
      },
      invalidatesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetNotificationQuery,
  useReadOneNotificationMutation,
  useReadAllNotificationMutation,
} = notificationSlice;
