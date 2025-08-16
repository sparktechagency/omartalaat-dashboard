import { api } from "../api/baseApi";

const subCategorySlice = api.injectEndpoints({
  endpoints: (builder) => ({
    createSubCategory: builder.mutation({
      query: (subCategoryData) => {
        return {
          url: "/admin/subcategory/create",
          method: "POST",
          body: subCategoryData,
        };
      },
      invalidatesTags: ["SubCategories", "Categories"],
    }),
    updateSubCategory: builder.mutation({
      query: ({ id, updatedData }) => {
        return {
          url: `/admin/subcategory/${id}`,
          method: "PATCH",
          body: updatedData,
        };
      },
      invalidatesTags: ["SubCategories", "Categories"],
    }),
    deleteSubCategory: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/subcategory/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["SubCategories", "Categories"],
    }),
    getSubCategories: builder.query({
      query: () => {
        return {
          url: "/admin/subcategory",
          method: "GET",
        };
      },
      providesTags: ["SubCategories"],
    }),
    getSingleSubCategory: builder.query({
      query: (selectedCategoryId) => {
        return {
          url: `/admin/subcategory/${selectedCategoryId}`,
          method: "GET",
        };
      },
      providesTags: ["SubCategories"],
    }),
    toggleSubCategoryStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/admin/subcategory/${id}`,
          method: "PUT",
          body: { status },
        };
      },
      invalidatesTags: ["SubCategories", "Categories"],
    }),
  }),
});

export const {
  useGetSubCategoriesQuery,
  useCreateSubCategoryMutation,
  useUpdateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetSingleSubCategoryQuery,
  useToggleSubCategoryStatusMutation,
} = subCategorySlice;
