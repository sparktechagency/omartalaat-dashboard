import { api } from "../api/baseApi";

const challengeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // POST: Create a new Challenge
    newDailyChallenge: builder.mutation({
      query: (challengeData) => ({
        url: "/admin/challenge-category/create-challenge-category",
        method: "POST",
        body: challengeData,
      }),
      invalidatesTags: ["DailyChallenge"], 
    }),
    
    // POST: Create a new Challenge with videos
    createChallengeWithVideos: builder.mutation({
      query: (data) => ({
        url: "/admin/challenge/create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["DailyChallenge", "Videos"],
    }),

    // GET: Retrieve all Challenges
    getDailyChallenge: builder.query({
      query: () => ({
        url: "/admin/challenge-category/get-all-challenge-category",
        method: "GET",
      }),
      providesTags: ["DailyChallenge"], 
    }),

    // GET: Single Challenge
    getSingleDailyChallenge: builder.query({
      query: (id) => ({
        url: `/admin/challenge/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "DailyChallenge", id }], 
    }),

    getDailyChallengeVideos: builder.query({
      query: (id) => ({
        url: `/admin/challenge/get-challenges-videos/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "DailyChallenge", id }], 
    }),
    
    // GET: Get Challenge Videos
    getChallengeVideos: builder.query({
      query: (id) => ({
        url: `/admin/challenge/${id}/videos`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "DailyChallenge", id }, "Videos"],
    }),

    // PATCH: Update a Challenge
    updateDailyChallenge: builder.mutation({
      query: ({ id,  challengeData}) => ({
        url: `/admin/challenge-category/update-challenge-category/${id}`,
        method: "PATCH",
        body: challengeData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DailyChallenge", id },
        "DailyChallenge",
      ],
    }),
    updateDailyChallengeVideo: builder.mutation({
      query: ({ id,  challengeData}) => ({
        url: `/admin/challenge/${id}`,
        method: "PATCH",
        body: challengeData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DailyChallenge", id },
        "DailyChallenge",
      ],
    }),

    updateDailyChallengeStatus: builder.mutation({
      query: ({ id,  data}) => ({
        url: `/admin/challenge-category/update-challenge-category-status/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DailyChallenge", id },
        "DailyChallenge",
      ],
    }),

    // DELETE: Delete a Challenge
    deleteDailyChallege: builder.mutation({
      query: (id) => ({
        url: `/admin/challenge-category/delete-challenge-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "DailyChallenge", id },
        "DailyChallenge",
      ],
    }),
    deleteDailyChallengeVideo: builder.mutation({
      query: (id) => ({
        url: `/admin/challenge/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "DailyChallenge", id },
        "DailyChallenge",
      ],
    }),
    
    // POST: Add video to challenge
    addVideoToChallenge: builder.mutation({
      query: ({ challengeId, videoId }) => ({
        url: `/admin/challenge/${challengeId}/videos`,
        method: "POST",
        body: { videoId },
      }),
      invalidatesTags: (result, error, { challengeId }) => [
        { type: "DailyChallenge", id: challengeId },
        "DailyChallenge",
      ],
    }),
    
    // DELETE: Remove video from challenge
    removeVideoFromChallenge: builder.mutation({
      query: ({ challengeId, videoId }) => ({
        url: `/admin/challenge/${challengeId}/videos/${videoId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { challengeId }) => [
        { type: "DailyChallenge", id: challengeId },
        "DailyChallenge",
      ],
    }),
    
    // PUT: Update video order in challenge
    updateVideoOrder: builder.mutation({
      query: ({ challengeId, videoOrder }) => ({
        url: `/admin/challenge/${challengeId}/video-order`,
        method: "PUT",
        body: { videoOrder },
      }),
      invalidatesTags: (result, error, { challengeId }) => [
        { type: "DailyChallenge", id: challengeId },
        "DailyChallenge",
      ],
    }),
    
    // POST: Schedule video rotation
    scheduleVideoRotation: builder.mutation({
      query: (scheduleData) => ({
        url: `/admin/challenge/schedule-create`,
        method: "POST",
        body: scheduleData,
      }),
      invalidatesTags: ["DailyChallenge"],
    }),
  }),
});

export const {
  useGetDailyChallengeQuery,
  useNewDailyChallengeMutation,
  useGetSingleDailyChallengeQuery,
  useUpdateDailyChallengeMutation,
  useDeleteDailyChallegeMutation,
  // New exports
  useGetDailyChallengeVideosQuery,
  useCreateChallengeWithVideosMutation,
  useUpdateDailyChallengeStatusMutation,
  useUpdateDailyChallengeVideoMutation,
  useGetChallengeVideosQuery,
  useAddVideoToChallengeMutation,
  useDeleteDailyChallengeVideoMutation,
  useRemoveVideoFromChallengeMutation,
  useUpdateVideoOrderMutation,
  useScheduleVideoRotationMutation,
} = challengeApi;
