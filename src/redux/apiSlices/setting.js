import { api } from "../api/baseApi";

const settingApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getSetting: builder.query({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
      transformResponse: ({ data }) => data,
      providesTags: ["Settings"],
    }),
    updateSetting: builder.mutation({
      query: (data) => ({
        url: "/settings",
        method: "PUT",
        body: data,
      }),
      transformResponse: ({ data }) => data,
      invalidatesTags: ["Settings"],
    }),
  }),
});

export const { useGetSettingQuery, useUpdateSettingMutation } = settingApi;
