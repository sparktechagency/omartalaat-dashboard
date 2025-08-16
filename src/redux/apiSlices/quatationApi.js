import { api } from "../api/baseApi";

const quotationSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all quotations
    getAllQuotations: builder.query({
      query: ( page ) => {
      return {
        url: `/admin/quotation/managment/admin?page=${page}`,
        method: "GET",
      };
      },
    }),

    // Get a single quotation by ID
    getQuotationById: builder.query({
      query: (id) => {
        return {
          url: `/admin/quotation/managment/${id}`,
          method: "GET",
        };
      },
      transformResponse: ({ data }) => {
        return data;
      },
    }),

    // Create a new quotation
    createQuotation: builder.mutation({
      query: (quotationData) => {
        return {
          url: "/admin/quotation/managment/create",
          method: "POST",
          body: quotationData,
        };
      },
    }),

    // Update an existing quotation
    updateQuotation: builder.mutation({
      query: ({ id, ...quotationData }) => {
        return {
          url: `/admin/quotation/managment/${id}`,
          method: "PATCH",
          body: quotationData,
        };
      },
    }),

    // Delete a quotation
    deleteQuotation: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/quotation/managment/${id}`,
          method: "DELETE",
        };
      },
    }),

    toggleQuotationStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/admin/quotation/managment/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
    }),
  }),
});

export const {
  useGetAllQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
  useToggleQuotationStatusMutation,
} = quotationSlice;
