import { api } from "../api/baseApi";

const loginCredentialApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createBackUpAdmin: builder.mutation({
      query: (subCategoryData) => {
        return {
          url: "/admin/managment/create-admin",
          method: "POST",
          body: subCategoryData,
        };
      },
      invalidatesTags: ["Admin"],
    }),
    updateBackUpAdmin: builder.mutation({
      query: ({ id, updatedData }) => {
        return {
          url: `/admin/subcategory/${id}`,
          method: "PATCH",
          body: updatedData,
        };
      },
      invalidatesTags: ["Admin"],
    }),
    deleteBackUpAdmin: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/managment/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Admin"],
    }),
    getLoginCredentials: builder.query({
      query: () => {
        return {
          url: "/admin/managment/get-admin",
          method: "GET",
        };
      },
      providesTags: ["Admin"],
    }),
    getSingleSubCategory: builder.query({
      query: (selectedCategoryId) => {
        return {
          url: `/admin/subcategory/${selectedCategoryId}`,
          method: "GET",
        };
      },
      providesTags: ["Admin"],
    }),
    toggleBackUpAdminStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/admin/subcategory/${id}`,
          method: "PUT",
          body: { status },
        };
      },
      invalidatesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetLoginCredentialsQuery,
  useCreateBackUpAdminMutation,
  useUpdateBackUpAdminMutation,
  useDeleteBackUpAdminMutation,
  useGetSingleSubCategoryQuery,
  useToggleBackUpAdminStatusMutation,
} = loginCredentialApi;
