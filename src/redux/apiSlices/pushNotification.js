import { api } from "../api/baseApi";

const pushNotificationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // POST: Send push notification
    pushNotificationSend: builder.mutation({
      query: (data) => {
        return {
          url: "/admin/push-notifications/send",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["PushNotification"],
    }),

    // GET: Get all push notifications with filtering and pagination
    getSendPushNotification: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && args.length > 0) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: `/admin/push-notifications`,
          method: "GET",
          params,
        };
        
      },
      // transformResponse: (response) => {
      //   const parsed = response;
      //   return {
      //     data: parsed.data,
      //     pagination: parsed.pagination,
      //   };
      // },
    }),
  }),
});

export const {
  usePushNotificationSendMutation,
  useGetSendPushNotificationQuery,
} = pushNotificationApi;
