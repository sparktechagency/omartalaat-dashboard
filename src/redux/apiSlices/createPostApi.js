import { api } from "../api/baseApi";


const postApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // POST: Create a new post entry
    createPost: builder.mutation({
      query: (data) => ({
        url: "/admin/post/managment/create",
        method: "POST",
        body: data,
      }),
    }),

    // GET: Retrieve all posts with pagination and filtering
    getAllPosts: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => {
        let queryParams = new URLSearchParams();
        
        // Add pagination parameters
        queryParams.append('page', page);
        queryParams.append('limit', limit);
        
        return {
          url: `/admin/post/managment?${queryParams.toString()}`,
          method: "GET",
        };
      },
    }),

    // GET: Retrieve single post by id
    getPostById: builder.query({
      query: (id) => ({
        url: `/admin/post/managment/${id}`,
        method: "GET",
      }),
    }),

    // PATCH: Update a post entry
    updatePost: builder.mutation({
      query: ({ id, postData }) => ({
        url: `/admin/post/managment/${id}`,
        method: "PATCH",
        body: postData,
      }),
    }),

    // DELETE: Delete a post entry
    deletePost: builder.mutation({
      query: (id) => ({
        url: `/admin/post/managment/${id}`,
        method: "DELETE",
      }),
    }),

    // PATCH: Update post status only
    updatePostStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/admin/post/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
    }),
  }),
});

export const {
  useCreatePostMutation,
  useGetAllPostsQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useDeletePostMutation,
  useUpdatePostStatusMutation,
} = postApi;
