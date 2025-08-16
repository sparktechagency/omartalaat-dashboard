import { api } from "../api/baseApi";

const aboutUsSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    updateAboutUs: builder.mutation({
      query: ({ id, description }) => {
        return {
          url: `/about/update-about/${id}`,
          method: "PATCH",
          body: { description },
        };
      },
    }),
    aboutUs: builder.query({
      query: () => {
        return {
          url: "/about/get-about",
          method: "GET",
        };
      },
      transformResponse: ({ data }) => {
        return data;
      },
    }),
  }),
});

export const { useUpdateAboutUsMutation, useAboutUsQuery } = aboutUsSlice;
