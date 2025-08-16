import { api } from "../api/baseApi";

const dailyInspirationApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // POST: Create a new Daily Inspiration entry
    createDailyInspiration: builder.mutation({
      query: (data) => ({
        url: "/admin/dailyInspiration/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DailyInspiration"],
    }),

    // GET: Retrieve all Daily Inspiration entries
    getAllDailyInspiration: builder.query({
      query: () => ({
        url: "/admin/dailyInspiration",
        method: "GET",
      }),
      providesTags: ["DailyInspiration"],
    }),

    // GET: Retrieve single Daily Inspiration by id
    getDailyInspirationById: builder.query({
      query: (id) => `/admin/dailyInspiration/${id}`,
      method: "GET",
    }),

    // PATCH: Update a Daily Inspiration entry
    updateDailyInspiration: builder.mutation({
      query: ({ id, dailyInspirationData }) => ({
        url: `/admin/dailyInspiration/${id}`,
        method: "PATCH",
        body: dailyInspirationData,
      }),
      invalidatesTags: ["DailyInspiration"],
    }),

    // DELETE: Delete a Daily Inspiration entry
    deleteDailyInspiration: builder.mutation({
      query: (id) => ({
        url: `/admin/dailyInspiration/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["DailyInspiration"],
    }),

    // Optionally update status only
    updateDailyInspirationStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/dailyInspiration/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["DailyInspiration"],
    }),
    
   

    scheduleDailyInspiration: builder.mutation({
      query: (scheduleData) => ({
        url: "/admin/dailyInspiration/schedule-create",
        method: "POST",
        body: scheduleData,
      }),
      invalidatesTags: ["DailyInspiration"],
    }),
    
    // NEW: Get Daily Inspiration Library
    getDailyInspirationLibrary: builder.query({
      query: (params) => ({
        url: "/admin/dailyInspiration/library",
        method: "GET",
        params,
      }),
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
      providesTags: ["DailyInspirationLibrary"],
    }),
    
    // NEW: Get scheduled Daily Inspiration
    getScheduledDailyInspiration: builder.query({
      query: (params) => ({
        url: "/admin/dailyInspiration/scheduled",
        method: "GET",
        params,
      }),
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
      providesTags: ["DailyInspirationScheduled"],
    }),
  }),
});

export const {
  useCreateDailyInspirationMutation,
  useGetAllDailyInspirationQuery,
  useGetDailyInspirationByIdQuery,
  useUpdateDailyInspirationMutation,
  useDeleteDailyInspirationMutation,
  useUpdateDailyInspirationStatusMutation,
  // New exports
  useScheduleDailyInspirationMutation,
  useGetDailyInspirationLibraryQuery,
  useGetScheduledDailyInspirationQuery,
} = dailyInspirationApi;
