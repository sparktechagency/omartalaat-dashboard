import { api } from "../api/baseApi";

const promoCodeApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createPromoCode: builder.mutation({
      query: (data) => {
        return {
          url: "/promo-codes/create",
          method: "POST",
          body: data,
        };
      },
      invalidatesTags: ["PromoCode"],

    }),

    // GET: Get all push notifications with filtering and pagination
    getPromoCodes: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args && args.length > 0) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: `/promo-codes`,
          method: "GET",
          params,
        };
        
      },

    }),

     getSinglePromoCode: builder.query({
      query: (id) => {
        return {
          url: `/promo-codes/${id}`,
          method: "GET",
          params,
        };  
      },
      providesTags: ["PromoCode"],
    }),

    updatePromoCode: builder.mutation({
      query: ({ id, promoCodeData }) => ({
        url: `/promo-codes/${id}`,
        method: "PUT",
        body: promoCodeData,
      }),
      invalidatesTags: ["PromoCode"],
    }),

    deletePromoCode: builder.mutation({
      query: (id) => ({
        url: `/promo-codes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PromoCode"],
    }),
    updatePromoCodeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/promo-codes/${id}`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["PromoCode"],
    }),

  }),
});

export const {
    useCreatePromoCodeMutation,
    useGetPromoCodesQuery,
    useGetSinglePromoCodeQuery,
    useUpdatePromoCodeMutation,
    useDeletePromoCodeMutation,
    useUpdatePromoCodeStatusMutation,

} = promoCodeApi;


