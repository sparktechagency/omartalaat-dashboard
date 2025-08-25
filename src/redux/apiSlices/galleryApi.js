import { api } from "../api/baseApi";

const galleryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getGallery: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && args.length > 0) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: "/gallery",
          method: "GET",
          params
        };
      },
      transformResponse: (response) => {
        return response;
      },
      providesTags: ["Gallery"],
    }),

    createGallery: builder.mutation({
      query: (data) => {
        // Check if data is FormData
        const isFormData = data instanceof FormData;
        
        return {
          url: `/gallery`,
          method: "POST",
          body: data,
          // Don't set Content-Type header for FormData - let browser set it with boundary
          ...(isFormData && {
            formData: true,
          })
        };
      },
      invalidatesTags: ["Gallery"],
    }),

    updateGallery: builder.mutation({
      query: ({ id, data }) => {
        // Check if data is FormData
        const isFormData = data instanceof FormData;
        
        return {
          url: `/gallery/${id}`,
          method: "PATCH",
          body: data,
          // Don't set Content-Type header for FormData - let browser set it with boundary
          ...(isFormData && {
            formData: true,
          })
        };
      },
      invalidatesTags: ["Gallery"],
    }),

    deleteGallery: builder.mutation({
      query: (id) => ({
        url: `/gallery/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Gallery"],
    }),

    updateStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/gallery/status/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Gallery"],
    }),
  }),
});

export const {
  useGetGalleryQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useDeleteGalleryMutation,
  useUpdateStatusMutation,
} = galleryApi;