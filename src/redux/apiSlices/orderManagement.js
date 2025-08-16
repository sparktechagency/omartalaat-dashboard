import { api } from "../api/baseApi";

const orderManagementApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET: Get all push notifications with filtering and pagination
    getAllOrders: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && args.length > 0) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: `/admin/product-orders/get-all`,
          method: "GET",
          params,
        };
      },
      providesTags: ["Order"],
    }),

    // GET: Get order details by ID
    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `/admin/product-orders/get-single/${orderId}`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),
    // PUT: Update order status
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/admin/product-orders/update/${orderId}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Order"],
    }),
    // GET: Get order analysis
    getOrderAnalysis: builder.query({
      query: () => ({
        url: `/admin/product-orders/analysis`,
        method: "GET",
      }),
      providesTags: ["Order"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useGetOrderDetailsQuery,
  useUpdateOrderStatusMutation,
  useGetOrderAnalysisQuery,
} = orderManagementApi;

