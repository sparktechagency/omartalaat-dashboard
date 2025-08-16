import { api } from "../api/baseApi";

const categorySlice = api.injectEndpoints({
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (categoryData) => {
        return {
          url: "/categories/create",
          method: "POST",
          body: categoryData,
          formData: true,
        };
      },
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation({
      query: ({ id, updatedData }) => {
        return {
          url: `/categories/${id}`,
          method: "PATCH",
          body: updatedData,
          // Disable content type, let browser set it with boundary for FormData
          formData: true,
        };
      },
      invalidatesTags: (result, error, arg) => {
        // Always invalidate regardless of result
        return [
          "Categories",
          { type: "Category", id: "LIST" },
          { type: "Category", id: arg.id },
        ];
      },
    }),

    deleteCategory: builder.mutation({
      query: (id) => {
        return {
          url: `/categories/${id}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["Categories"],
    }),

    getCategory: builder.query({
      query: () => {
        return {
          url: "/categories",
          method: "GET",
        };
      },
      providesTags: (result) => {
        // Return a list of tags for better caching
        const tags = [{ type: "Categories", id: "LIST" }];
        if (result?.data) {
          // Add tag for each category
          result.data.forEach((category) => {
            tags.push({ type: "Category", id: category._id });
          });
        }
        return tags;
      },
    }),

    // Single category endpoint
    getSingleCategory: builder.query({
      query: (id) => {
        return {
          url: `/categories/${id}`,
          method: "GET",
        };
      },
      providesTags: (result, error, id) => [{ type: "Category", id }],
    }),

    getByCategoryAllVideos: builder.query({
      query: (id) => {
        return {
          url: `/admin/category/category-all-videos/${id}`,
          method: "GET",
        };
      },
      providesTags: ["Categories"],
    }),

    // Toggle status endpoint
    toggleCategoryStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/categories/status/${id}`,
          method: "PUT",
          body: { status },
        };
      },
      invalidatesTags: (result, error, arg) => [
        "Categories",
        { type: "Category", id: arg.id },
      ],
    }),

    // Update category order endpoint
    updateCategoryOrder: builder.mutation({
      query: (categoryOrder) => {
        return {
          url: `/admin/category/shuffle`,
          method: "POST",
          body: categoryOrder,
        };
      },
      invalidatesTags: ["Categories"],
    }),

    videoCopyOthersCategory: builder.mutation({
      query: (scheduleData) => {
        return {
          url: `/videos/copy-video`,
          method: "POST",
          body: scheduleData,
        };
      },
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetSingleCategoryQuery,
  useGetByCategoryAllVideosQuery,
  useToggleCategoryStatusMutation,
  useUpdateCategoryOrderMutation,
  useVideoCopyOthersCategoryMutation,
} = categorySlice;
