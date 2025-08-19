
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
        // Create FormData for both image and description
        const formData = new FormData();
        
        // Add description to FormData
        formData.append('description', data.description);
        
        // Add image if available
        if (data.image) {
          formData.append('image', data.image);
        }
        
        return {
          url: `/gallery`,
          method: "POST",
          body: formData
        };
      },
      invalidatesTags: ["Gallery"],
    }),
    
    updateGallery: builder.mutation({
      query: ({ id, data }) => {
        // Create FormData for both image and description
        const formData = new FormData();
        
        // Add description to FormData
        if (data.description) {
          formData.append('description', data.description);
        }
        
        // Add image if available
        if (data.image) {
          formData.append('image', data.image);
        }
        
        return {
          url: `/gallery/${id}`,
          method: "PATCH",
          body: formData
        };
      },
      invalidatesTags: ["Gallery"],
    }),

    deleteGallery: builder.mutation({
      query: (id) => ({
        url: `/gallery/${id}`,
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




