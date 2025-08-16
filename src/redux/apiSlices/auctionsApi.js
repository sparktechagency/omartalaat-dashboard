import { api } from "../api/baseApi";

const auctionMangeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Get all push notifications with filtering and pagination
    getAuctions: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && args.length > 0) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: `/admin/auction/managements/get-all-auctions`,
          method: "GET",
          params,
        };
      },
      providesTags: ["Auction"],
    }),
    // POST: Create Auction
    createAuction: builder.mutation({
      query: (data) => ({
        url: `/admin/auction/managements/create`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auction"],
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
    updateAuction: builder.mutation({
      query: ({ auctionId, data }) => ({
        url: `/admin/auction/managements/update-single-auction/${auctionId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Auction"],
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

