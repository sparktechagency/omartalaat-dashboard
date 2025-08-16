import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Space,
  Switch,
  Dropdown,
  Menu,
  message,
  Tag,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  DownOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
// import GradientButton from "../common/GradiantButton";
// import { Filtering } from "../common/Svg";
import moment from "moment/moment";
// import VideoFormModal from "./VideoUploadModal";
// import Spinner from "./Spinner";
// import { getVideoAndThumbnail } from "./imageUrl";
// import VideoDetailsModal from "../retailerManagement/VideoDetailsModal";
import { useParams } from "react-router-dom";
import GradientButton from "../common/GradiantButton";
import VideoFormModal from "../common/VideoUploadModal";
import Spinner from "../common/Spinner";
import { getVideoAndThumbnail } from "../common/imageUrl";
import VideoDetailsModal from "../retailerManagement/VideoDetailsModal";
import CreateAndEditModal from "./CreateAndEditModal";

// Added additionalButtons prop with default empty fragment
const ChallengeVideoUpload = ({
  pageType,
  apiHooks,
  additionalButtons = <></>,
}) => {
  const {
    useGetAllQuery,
    useGetByIdQuery,
    deleteItem,
    updateItemStatus,
    createItem,
    updateItem,
  } = apiHooks;

  // State management
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const { id } = useParams();
  console.log(id);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtering and pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  // Build query params for getAllQuery
  const queryParams = React.useMemo(() => {
    const params = [];
    if (statusFilter !== "all") {
      params.push({ name: "status", value: statusFilter });
    }
    params.push({ name: "page", value: currentPage });
    params.push({ name: "limit", value: pageSize });
    return params;
  }, [statusFilter, currentPage, pageSize]);

  // Fetch all items
  const {
    data: itemsData,
    isLoading: isLoadingItems,
    refetch,
  } = useGetAllQuery(id);
  console.log(itemsData);
  // Fetch single item for details and edit form
  const { data: itemDetails, isLoading: isLoadingDetails } = useGetByIdQuery(
    selectedItemId,
    { skip: !selectedItemId }
  );

  // Handle edit button click - sets both IDs and opens form modal
  const handleEdit = (id) => {
    setSelectedItemId(id);
    setEditingId(id);
    setIsFormModalVisible(true);
  };

  // Handle add new button click - resets IDs and opens form modal
  const showFormModal = () => {
    setSelectedItemId(null);
    setEditingId(null);
    setIsFormModalVisible(true);
  };

  // Show details modal
  const showDetailsModal = (record) => {
    setSelectedItemId(record._id);
    setIsDetailsModalVisible(true);
  };

  const items = itemsData?.data || [];
  const paginationData = itemsData?.pagination || {
    total: 0,
    current: 1,
    pageSize: 10,
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Form submit handler
  const handleFormSubmit = useCallback(
    async (formData) => {
      setIsSubmitting(true);
      try {
        const dataJSON = JSON.parse(formData.get("data"));

        dataJSON.challengeId = id;
        formData.set("data", JSON.stringify(dataJSON));

        if (editingId) {
          // Edit Mode

          if (thumbnailFile) {
            formData.append("thumbnail", thumbnailFile);
          } else if (itemDetails?.data?.thumbnailUrl) {
            formData.append("thumbnail", itemDetails.data.thumbnailUrl);
          }
          if (videoFile) {
            formData.append("video", videoFile);
          } else if (itemDetails?.data?.videoUrl) {
            formData.append("video", itemDetails.data.videoUrl);
          }

          await updateItem({
            id: editingId,
            challengeData: formData,
          });
          message.success(`${getPageTitle()} updated successfully`);
        } else {
          // Create Mode

          if (thumbnailFile) {
            formData.append("thumbnail", thumbnailFile);
          }

          if (videoFile) {
            formData.append("video", videoFile);
          }

          await createItem(formData);
          message.success(`${getPageTitle()} created successfully`);
        }

        // Modal reset & close
        setIsFormModalVisible(false);
        setEditingId(null);
        setSelectedItemId(null);
        await refetch();
      } catch (error) {
        console.error("Error in form submit:", error);
        message.error(
          `Failed to ${editingId ? "update" : "create"} ${getPageTitle()}: ${
            error?.message || "Unknown error"
          }`
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      editingId,
      createItem,
      updateItem,
      refetch,
      id,
      thumbnailFile,
      videoFile,
      itemDetails,
    ] // Added itemDetails dependency
  );

  // Delete handler
  const handleDeleteItem = useCallback(
    (id) => {
      Modal.confirm({
        title: `Are you sure you want to delete this ${getPageTitle()} item?`,
        content: "This action cannot be undone.",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            await deleteItem(id);
            message.success(`${getPageTitle()} item deleted successfully`);
            refetch();
          } catch (error) {
            message.error(`Failed to delete ${getPageTitle()} item`);
            console.error("Error deleting item:", error);
          }
        },
      });
    },
    [deleteItem, refetch]
  );

  // Status change handler
  const handleStatusChange = useCallback(
    (checked, record) => {
      const newStatus = checked ? "active" : "inactive";
      Modal.confirm({
        title: `Are you sure you want to set the status to "${newStatus}"?`,
        okText: "Yes",
        cancelText: "No",
        okButtonProps: {
          style: { backgroundColor: "red", borderColor: "red" },
        },
        onOk: async () => {
          try {
            if (updateItemStatus) {
              await updateItemStatus({
                id: record._id,
                status: newStatus,
              });
            } else {
              await updateItem({
                id: record._id,
                formData: { ...record, status: newStatus },
              });
            }
            message.success(`Status updated to ${newStatus}`);
            refetch();
          } catch (error) {
            message.error("Failed to update status");
            console.error("Error updating status:", error);
          }
        },
      });
    },
    [updateItemStatus, updateItem, refetch]
  );

  // Table change handler
  const handleTableChange = useCallback((paginationConfig) => {
    setCurrentPage(paginationConfig.current);
    setPageSize(paginationConfig.pageSize);
  }, []);

  // Modal close handlers
  const handleFormModalClose = () => {
    setIsFormModalVisible(false);
    setEditingId(null);
    setSelectedItemId(null);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalVisible(false);
    setSelectedItemId(null);
  };

  const handleStatusFilterChange = useCallback((status) => {
    setStatusFilter(status.toLowerCase());
  }, []);

  const statusMenu = React.useMemo(
    () => (
      <Menu>
        <Menu.Item key="all" onClick={() => handleStatusFilterChange("all")}>
          All Status
        </Menu.Item>
        <Menu.Item
          key="active"
          onClick={() => handleStatusFilterChange("active")}
        >
          Active
        </Menu.Item>
        <Menu.Item
          key="inactive"
          onClick={() => handleStatusFilterChange("inactive")}
        >
          Inactive
        </Menu.Item>
      </Menu>
    ),
    [handleStatusFilterChange]
  );

  // Table columns
  const columns = React.useMemo(
    () => [
      {
        title: "SL",
        key: "id",
        width: 70,
        align: "center",
        render: (text, record, index) => {
          const actualIndex = (currentPage - 1) * pageSize + index + 1;
          return `# ${actualIndex}`;
        },
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        align: "center",
      },
      //   {
      //     title: "Category",
      //     dataIndex: "category",
      //     key: "category",
      //     align: "center",
      //   },
      {
        title: "Duration",
        dataIndex: "duration",
        key: "duration",
        align: "center",
      },
      {
        title: "Thumbnail",
        dataIndex: "thumbnailUrl",
        key: "thumbnailUrl",
        align: "center",
        render: (_, record) => (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={getVideoAndThumbnail(record.thumbnailUrl)}
              alt="thumbnail"
              style={{
                width: 100,
                height: 50,
                objectFit: "cover",
              }}
              className="rounded-lg"
            />
          </div>
        ),
      },
      {
        title: "Publish Date",
        dataIndex: "publishAt",
        key: "publishAt",
        align: "center",
        render: (text) => moment(text).format("L"),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        align: "center",
        render: (status) => (
          <Tag color={status === "active" ? "success" : "error"}>
            {status === "active" ? "Active" : "Inactive"}
          </Tag>
        ),
      },
      {
        title: "Action",
        key: "action",
        align: "center",
        render: (_, record) => (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined style={{ color: "#f55" }} />}
              onClick={() => handleEdit(record._id)}
            />
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#55f" }} />}
              onClick={() => showDetailsModal(record)}
            />
            {/* <Switch
              size="small"
              checked={record.status === "active"}
              onChange={(checked) => handleStatusChange(checked, record)}
              style={{
                backgroundColor: record.status === "active" ? "red" : "gray",
              }}
            /> */}
            <Button
              type="text"
              icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
              onClick={() => handleDeleteItem(record._id)}
            />
          </Space>
        ),
      },
    ],
    [
      currentPage,
      pageSize,
      handleEdit,
      showDetailsModal,
      handleStatusChange,
      handleDeleteItem,
    ]
  );

  const getStatusDisplayText = () => {
    if (statusFilter === "all") return "All Status";
    return statusFilter?.charAt(0)?.toUpperCase() + statusFilter?.slice(1);
  };

  const getPageTitle = () => {
    switch (pageType) {
      case "coming-soon":
        return "Coming Soon";
      case "today-video":
        return "Today's Video";
      case "challenge-video":
        return "Challenge Video";
      default:
        return "Content";
    }
  };

  if (isLoadingItems) {
    return <Spinner />;
  }

  return (
    <div>
      {/* Header with filters and add button */}
      <div className="flex justify-end gap-6 mb-6">
        <div>
          <Space size="small" className="flex gap-4">
            {/* Status Filter */}
            {/* <Dropdown
              overlay={statusMenu}
              trigger={["click"]}
              placement="bottomLeft"
            >
              <Button
                className="py-5 mr-2 text-white bg-red-600 hover:bg-red-800 hover:text-white hover:icon-black"
                style={{ border: "none" }}
              >
                <Space>
                  <Filtering className="filtering-icon" />
                  <span className="filter-text">{getStatusDisplayText()}</span>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown> */}
          </Space>
        </div>

        <div className="flex items-center">
          <GradientButton
            type="primary"
            onClick={showFormModal}
            className="py-5"
            icon={<PlusOutlined />}
          >
            Add New {getPageTitle()}
          </GradientButton>
          {/* Render additionalButtons next to the Add New button */}
          {additionalButtons}
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={items}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: paginationData?.total || 0,
        }}
        onChange={handleTableChange}
        rowKey="_id"
        bordered
        size="small"
        className="custom-table"
        scroll={{ x: "max-content" }}
      />

      {/* Video Form Modal */}
      <VideoFormModal
        visible={isFormModalVisible}
        onClose={handleFormModalClose}
        onSubmit={handleFormSubmit}
        editingItem={itemDetails?.data}
        loading={isSubmitting}
        pageType={pageType}
        apiHooks={apiHooks}
      />

      {/* Video Details Modal */}
      <VideoDetailsModal
        visible={isDetailsModalVisible}
        onCancel={handleDetailsModalClose}
        currentVideo={itemDetails?.data}
        loading={isLoadingDetails}
      />
    </div>
  );
};

export default ChallengeVideoUpload;
