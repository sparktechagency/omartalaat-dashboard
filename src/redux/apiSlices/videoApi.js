import { api } from "../api/baseApi";

const videoApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // POST: Create a new video
    addVideo: builder.mutation({
      query: (data) => {
        return {
          url: "/admin/videos/managment/upload-video",
          method: "POST",
          body: data,
        };
      },
    }),

    // Updated getAllVideos query with proper filtering and pagination
    getAllVideos: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }

        return {
          url: "/admin/videos/managment/videos",
          method: "GET",
          params,
        };
      },
      transformResponse: (response) => {
        return {
          data: response.data || [],
          pagination: response.pagination || {
            total: 0,
            current: 1,
            pageSize: 10,
          },
        };
      },
      providesTags: ["Videos"],
    }),

    // NEW: Get videos by subcategory with pagination
    getVideosBySubCategory: builder.query({
      query: ({ subCategoryId, page = 1, limit = 10 }) => {
        return {
          url: `/admin/videos/managment/video-status/${subCategoryId}`,
          method: "GET",
          params: { page, limit },
        };
      },
      transformResponse: (response) => {
        return {
          data: response.data || [],
          pagination: response.pagination || {
            total: 0,
            current: 1,
            pageSize: 10,
          },
        };
      },
      providesTags: ["Videos"],
    }),

    getCoursesAllVideos: builder.query({
      query: (courseId) => {
        return {
          url: `/admin/videos/managment/get-all-videos-by-course/${courseId}`,
          method: "GET",
        };
      },
    }),

    getVideoById: builder.query({
      query: (id) => {
        return {
          url: `/admin/videos/managment/videos/${id}`,
          method: "GET",
        };
      },
      transformResponse: ({ data }) => {
        return data;
      },
    }),

    // PATCH: Update an existing video
    updateVideo: builder.mutation({
      query: ({ id, videoData }) => {
        return {
          url: `/admin/videos/managment/update-video/${id}`,
          method: "PUT",
          body: videoData,
        };
      },
    }),

    // DELETE: Delete a video
    deleteVideo: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/videos/managment/video-delete/${id}`,
          method: "DELETE",
        };
      },
    }),

    // Toggle video status (active/inactive)
    updateVideoStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/admin/videos/managment/video-status/${id}`,
          method: "PUT",
          body: { status },
        };
      },
    }),
    updateVideoOrder: builder.mutation({
      query: (orderData) => ({
        url: "/admin/subcategory/safhale",
        method: "POST",
        body: orderData,
      }),
      invalidatesTags: ["Video"],
    }),

    // NEW: Get all categories
    // getCategory: builder.query({
    //   query: () => {
    //     return {
    //       url: "/admin/categories",
    //       method: "GET",
    //     };
    //   },
    //   transformResponse: (response) => {
    //     return {
    //       data: response.data || [],
    //     };
    //   },
    //   providesTags: ["Categories"],
    // }),

    // NEW: Get subcategory by ID
    getSubCategoryById: builder.query({
      query: (id) => {
        // const params = new URLSearchParams();
        // if (args) {
        //   args.forEach((arg) => {
        //     params.append(arg.name, arg.value);
        //   });
        // }
        return {
          url: `/admin/videos/managment/get-all-videos-by-course/${id}`,
          method: "GET",
          
        };
      },
     
      providesTags: ["SubCategories"],
    }),
    
    // NEW: Get all videos in the library
    getLibraryVideos: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        
        return {
          url: "/admin/videos/library",
          method: "GET",
          params,
        };
      },
      transformResponse: (response) => {
        return {
          data: response.data || [],
          pagination: response.pagination || {
            total: 0,
            current: 1,
            pageSize: 10,
          },
        };
      },
      providesTags: ["VideoLibrary"],
    }),
    
    // NEW: Schedule a video for daily challenge or inspiration
    scheduleVideo: builder.mutation({
      query: (data) => {
        return {
          url: "/admin/videos/schedule",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["Videos", "VideoLibrary", "DailyChallenge", "DailyInspiration"],
    }),
    
    // NEW: Create a challenge with multiple videos
    createChallenge: builder.mutation({
      query: (data) => {
        return {
          url: "/admin/challenge/create-with-videos",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["DailyChallenge", "VideoLibrary"],
    }),
    
    // NEW: Get scheduled videos
    getScheduledVideos: builder.query({
      query: ({ type, page = 1, limit = 10 }) => {
        return {
          url: `/admin/videos/scheduled/${type}`,
          method: "GET",
          params: { page, limit },
        };
      },
      transformResponse: (response) => {
        return {
          data: response.data || [],
          pagination: response.pagination || {
            total: 0,
            current: 1,
            pageSize: 10,
          },
        };
      },
      providesTags: (result, error, { type }) => [type === "challenge" ? "DailyChallenge" : "DailyInspiration"],
    }),
  }),
});

export const {
  useAddVideoMutation,
  useGetAllVideosQuery,
  useGetVideoByIdQuery,
  useUpdateVideoMutation,
  useDeleteVideoMutation,
  useUpdateVideoStatusMutation,
  useGetCoursesAllVideosQuery,
  // NEW exports for missing endpoints
  useGetVideosBySubCategoryQuery,
  useUpdateVideoOrderMutation,
  // useGetCategoryQuery,
  useGetSubCategoryByIdQuery,
  // NEW exports for library management
  useGetLibraryVideosQuery,
  useScheduleVideoMutation,
  useCreateChallengeMutation,
  useGetScheduledVideosQuery,
} = videoApi;
