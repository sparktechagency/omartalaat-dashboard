import { api } from "../api/baseApi";

const auctionMangeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Get all push notifications with filtering and pagination
    getAuctions: builder.query({
      query: ({ page, limit, search, status, startDate, endDate }) => {
        const query = new URLSearchParams();

        if (page) query.append("page", page);
        if (limit) query.append("limit", limit);
        if (search) query.append("search", search);
        if (status) query.append("status", status);
        if (startDate) query.append("startDate", startDate);
        if (endDate) query.append("endDate", endDate);

        return {
          url: `/admin/auction/managements/get-all-auctions?${query.toString()}`,
          method: "GET",
        };
      },
      providesTags: ["Auction"],
    }),

    // POST: Create Auction
    createAuction: builder.mutation({
      query: (data) => {
        console.log("Creating auction with data:", data);
        return {
          url: `/admin/auction/managements/create`,
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["Auction"],
      // Add response logging
      transformResponse: (response, meta, arg) => {
        console.log("Create auction response:", response);
        return response;
      },
    }),

    // GET: Get Auction details by ID
    getAuctionDetails: builder.query({
      query: (id) => ({
        url: `/admin/auction/managements/get-single-auction/${id}`,
        method: "GET",
      }),
      providesTags: ["Auction"],
    }),

    // PUT: Update Auction status
    updateAuctionStatus: builder.mutation({
      query: ({ auctionId, status }) => ({
        url: `/admin/auction/managements/update-single-auction-status/${auctionId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Auction"],
    }),

    // DELETE: Delete Auction
    deleteAuction: builder.mutation({
      query: (auctionId) => ({
        url: `/admin/auction/managements/delete-single-auction/${auctionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Auction"],
    }),

    // PATCH: Update Auction - WITH DEBUGGING
    updateAuction: builder.mutation({
      query: ({ auctionId, data }) => {
        // console.log("Updating auction ID:", auctionId);
        // console.log("Update data type:", data instanceof FormData ? "FormData" : typeof data);

        // Debug FormData contents
        if (data instanceof FormData) {
          console.log("FormData contents:");
          for (let [key, value] of data.entries()) {
            if (value instanceof File) {
              console.log(`${key}: File - ${value.name} (${value.size} bytes)`);
            } else {
              console.log(`${key}:`, value);
            }
          }
        } else {
          console.log("Update data:", data);
        }

        return {
          url: `/admin/auction/managements/update-single-auction/${auctionId}`,
          method: "PATCH",
          body: data,
        };
      },
      invalidatesTags: ["Auction"],
      // Add response and error logging
      // transformResponse: (response, meta, arg) => {
      //   console.log("Update auction response:", response);
      //   console.log("Update auction meta:", meta);
      //   return response;
      // },
      // transformErrorResponse: (response, meta, arg) => {
      //   console.error("Update auction error:", response);
      //   console.error("Update auction error meta:", meta);
      //   return response;
      // },
    }),
  }),
});

export const {
  useGetAuctionsQuery,
  useCreateAuctionMutation,
  useGetAuctionDetailsQuery,
  useUpdateAuctionStatusMutation,
  useDeleteAuctionMutation,
  useUpdateAuctionMutation,
} = auctionMangeApi;
