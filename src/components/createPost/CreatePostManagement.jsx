import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Modal,
  message,
  Tag,
  Card,
  Row,
  Col,
  Pagination,
  Tooltip,
} from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  FileTextOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import GradientButton from "../common/GradiantButton";
import moment from "moment/moment";
import PostFormModal from "./PostFormModal";
import { getVideoAndThumbnail } from "../common/imageUrl";
import {
  useCreatePostMutation,
  useDeletePostMutation,
  useGetAllPostsQuery,
  useGetPostByIdQuery,
  useUpdatePostMutation,
  useUpdatePostStatusMutation,
} from "../../redux/apiSlices/createPostApi";
import Spinner from "../common/Spinner";

const PostManagementSystem = () => {
  // State management
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);

  // API calls
  const {
    data: postsData,
    isLoading: isLoadingPosts,
    refetch,
  } = useGetAllPostsQuery({
    page: currentPage,
    limit: pageSize,
  });

  const { data: postDetails } = useGetPostByIdQuery(selectedItemId, { 
    skip: !selectedItemId 
  });

  const [deletePost] = useDeletePostMutation();
  const [createPost] = useCreatePostMutation();
  const [updatePost] = useUpdatePostMutation();

  const posts = postsData?.data || [];
  
  // Update total count when data changes
  useEffect(() => {
    if (postsData?.pagination) {
      setTotal(postsData.pagination.total || 0);
    }
  }, [postsData]);

  // Get current editing post data
  const currentEditingPost = React.useMemo(() => {
    if (!editingId) return null;
    return postDetails?.data || posts.find((post) => post._id === editingId) || null;
  }, [editingId, postDetails, posts]);

  // Handle edit button click
  const handleEdit = async (id) => {
    setSelectedItemId(id);
    setEditingId(id);
    setTimeout(() => {
      setIsFormModalVisible(true);
    }, 100);
  };

  // Handle add new button click
  const showFormModal = () => {
    setSelectedItemId(null);
    setEditingId(null);
    setIsFormModalVisible(true);
  };

  // Handle pagination change
  const handlePaginationChange = (page, size) => {
    setCurrentPage(page);
    setPageSize(size);
  };

  // Form submit handler
  const handleFormSubmit = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      try {
        if (editingId) {
          await updatePost({
            id: editingId,
            postData: formData,
          });
          message.success("Post updated successfully");
        } else {
          await createPost(formData);
          message.success("Post created successfully");
        }

        setIsFormModalVisible(false);
        setEditingId(null);
        setSelectedItemId(null);
        await refetch();
      } catch (error) {
        console.error("Error in form submit:", error);
        message.error(
          `Failed to ${editingId ? "update" : "create"} post: ${
            error?.message || "Unknown error"
          }`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingId, createPost, updatePost, refetch]
  );

  // Delete handler
  const handleDeletePost = useCallback(
    (id) => {
      Modal.confirm({
        title: "Delete Post",
        content: "Are you sure you want to delete this post? This action cannot be undone.",
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        onOk: async () => {
          try {
            await deletePost(id);
            message.success("Post deleted successfully");
            refetch();
          } catch (error) {
            message.error("Failed to delete post");
            console.error("Error deleting post:", error);
          }
        },
      });
    },
    [deletePost, refetch]
  );

  // Modal close handlers
  const handleFormModalClose = () => {
    setIsFormModalVisible(false);
    setEditingId(null);
    setSelectedItemId(null);
  };

  // Get post type configuration
  const getPostTypeConfig = (type) => {
    const configs = {
      text: {
        icon: <FileTextOutlined />,
        color: "#1890ff",
        tagColor: "blue",
        label: "TEXT"
      },
      image: {
        icon: <FileImageOutlined />,
        color: "#52c41a",
        tagColor: "green",
        label: "IMAGE"
      },
      video: {
        icon: <VideoCameraOutlined />,
        color: "#ff4d4f",
        tagColor: "red",
        label: "VIDEO"
      }
    };
    return configs[type] || configs.text;
  };

  // Strip HTML tags from content
  const stripHtmlTags = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  // Render post preview
  const renderPostPreview = (post) => {
    if (post.type === "text") {
      const content = stripHtmlTags(post.title || post.content || "");
      return (
        <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 flex items-center justify-center">
          <div className="text-center">
            <FileTextOutlined className="text-2xl text-blue-500 mb-2" />
            <p className="text-sm text-gray-600 line-clamp-2">
              {content.substring(0, 80)}...
            </p>
          </div>
        </div>
      );
    } 
    
    if (post.type === "image" && post.thumbnailUrl) {
      return (
        <div className="relative h-32 overflow-hidden rounded-lg">
          <img
            src={getVideoAndThumbnail(post.thumbnailUrl)}
            alt="preview"
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-full p-1">
            <FileImageOutlined className="text-green-500 text-sm" />
          </div>
        </div>
      );
    } 
    
    if (post.type === "video" && post.thumbnailUrl) {
      return (
        <div className="relative h-32 overflow-hidden rounded-lg">
          <img
            src={getVideoAndThumbnail(post.thumbnailUrl)}
            alt="thumbnail"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white bg-opacity-90 rounded-full p-2">
              <PlayCircleOutlined className="text-red-500 text-xl" />
            </div>
          </div>
          {post.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {post.duration}s
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <FileTextOutlined className="text-2xl mb-2" />
          <p className="text-sm">No preview</p>
        </div>
      </div>
    );
  };

  if (isLoadingPosts) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Post Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your posts and content
          </p>
        </div>
        <GradientButton
          type="primary"
          onClick={showFormModal}
          className="px-6 py-2 h-10"
          icon={<PlusOutlined />}
        >
          Add New Post
        </GradientButton>
      </div>

      {/* Posts Grid */}
      <Row gutter={[24, 24]} className="mb-8">
        {posts.map((post, index) => {
          const actualIndex = (currentPage - 1) * pageSize + index + 1;
          const typeConfig = getPostTypeConfig(post.type);
          const title = stripHtmlTags(post.title || "Untitled Post");
          
          return (
            <Col xs={24} sm={12} md={8} lg={6} key={post._id}>
              <Card
                hoverable
                className="h-full  shadow-md hover:shadow-lg transition-all duration-300 border-0"
                style={{ borderRadius: "16px" }}
                bodyStyle={{ padding: "20px" }}
                cover={
                  <div className="p-4 pb-0">
                    {renderPostPreview(post)}
                  </div>
                }
                actions={[
                  <Tooltip title="Edit Post">
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(post._id)}
                      className="text-black hover:text-blue-600 hover:bg-blue-50"
                    />
                  </Tooltip>,
                  <Tooltip title="Delete Post">
                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeletePost(post._id)}
                      className="text-red-600 hover:text-red-600 hover:bg-red-50"
                    />
                  </Tooltip>
                ]}
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    #{actualIndex}
                  </span>
                  <Tag
                    icon={typeConfig.icon}
                    color={typeConfig.tagColor}
                    className="m-0 font-medium"
                  >
                    {typeConfig.label}
                  </Tag>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-4 line-clamp-2 min-h-[3.5rem]">
                  {title}
                </h3>

                {/* Post Info */}
                <div className="space-y-2">
                  {/* Created Date */}
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarOutlined className="mr-2" />
                    <span>Created {moment(post.createdAt).format("MMM DD, YYYY")}</span>
                  </div>

                  {/* Publish Date */}
                  {post.publishAt && (
                    <div className="flex items-center text-sm text-blue-600">
                      <ClockCircleOutlined className="mr-2" />
                      <span>
                        Publish {moment(post.publishAt).format("MMM DD, YYYY")}
                      </span>
                    </div>
                  )}

                  {/* Status */}
                  <div className="flex justify-between items-center pt-2">
                    <Tag
                      color={post.status === "active" ? "success" : "default"}
                      className="font-medium"
                    >
                      {post.status === "active" ? "Active" : "Inactive"}
                    </Tag>
                    
                    {post.description && (
                      <Tooltip title={post.description}>
                        <Button type="text" size="small" className="text-gray-400">
                          <FileTextOutlined />
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Empty State */}
      {posts.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileTextOutlined className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first post to get started with content management
            </p>
            <GradientButton
              type="primary"
              onClick={showFormModal}
              icon={<PlusOutlined />}
              className="px-6 py-2"
            >
              Create First Post
            </GradientButton>
          </div>
        </div>
      )}

      {/* Pagination */}
      {posts.length > 0 && total > pageSize && (
        <div className="flex justify-center mt-8">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePaginationChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} of ${total} posts`
            }
            className="bg-white px-4 py-2 rounded-lg shadow-sm"
          />
        </div>
      )}

      {/* Post Form Modal */}
      <PostFormModal
        visible={isFormModalVisible}
        onClose={handleFormModalClose}
        onSubmit={handleFormSubmit}
        editingItem={currentEditingPost}
        loading={isSubmitting}
        postType={currentEditingPost?.type || null}
        isEditing={!!editingId}
      />
    </div>
  );
};

export default PostManagementSystem;