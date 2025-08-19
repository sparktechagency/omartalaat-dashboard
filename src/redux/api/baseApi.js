import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://10.10.7.62:7005/api/v1",
    // baseUrl: "https://api.yogawithjen.life/api/v1",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "User",
    "Contact",
    "Video",
    "Category",
    "Categories",
    "Package",
    "DailyVideo",
    "DailyChallenge",
    "DailyInspiration",
    "Admin",
    "Notification",
    "PushNotification",
    "Gallery",
  ],
  endpoints: () => ({}),
});

export const imageUrl = "http://10.10.7.62:7005";
// export const imageUrl = "https://api.yogawithjen.life";
