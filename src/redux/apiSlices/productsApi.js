import { api } from "../api/baseApi";

const productsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all quotations
    getAllProducts: builder.query({
      query: (args) => {
        const params = new URLSearchParams();
        if (args) {
          args.forEach((arg) => {
            params.append(arg.name, arg.value);
          });
        }
        return {
          url: `/admin/inventory/managements`,
          method: "GET",
          params
        };
      },
    }),
    // Create a new quotation
    createNewProducts: builder.mutation({
      query: (data) => {
        return {
          url: "/admin/inventory/managements/create",
          method: "POST",
          body: data,
        };
      },
    }),

    // Get a single quotation by ID
    getSingleProduct: builder.query({
      query: (id) => {
        return {
          url: `/admin/inventory/managements/getSingle/${id}`,
          method: "GET",
        };
      },
      transformResponse: ({ data }) => {
        return data;
      },
    }),

    // Update an existing quotation
    updateProduct: builder.mutation({

      query: ({ id, ...quotationData }) => {
        return {
          url: `/admin/inventory/managements/update/${id}`,
          method: "PATCH",
          body: quotationData,
        };
      },
    }),

    // Delete a quotation
    deleteProduct: builder.mutation({
      query: (id) => {
        return {
          url: `/admin/inventory/managements/delete/${id}`,
          method: "DELETE",
        };
      },
    }),

    updateProductStatus: builder.mutation({
      query: ({ id, status }) => {
        return {
          url: `/admin/inventory/managements/update/status/${id}`,
          method: "PATCH",
          body: { status },
        };
      },
    }),
  }),
});

export const {
  useGetAllProductsQuery,
  useCreateNewProductsMutation,
  useGetSingleProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUpdateProductStatusMutation,

} = productsApi;
