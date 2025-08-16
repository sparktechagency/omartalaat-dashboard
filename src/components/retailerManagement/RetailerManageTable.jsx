import React, { useState, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import VideoFormModal from "./VideoFormModal";
import VideoDetailsModal from "./VideoDetailsModal";
import GradientButton from "../common/GradiantButton";
import {
  useGetAllVideosQuery,
  useDeleteVideoMutation,
  useUpdateVideoStatusMutation,
  useGetVideoByIdQuery,
} from "../../redux/apiSlices/videoApi";
import { getVideoAndThumbnail } from "../common/imageUrl";
import moment from "moment/moment";
import { Filtering } from "../common/Svg";
import Spinner from "../common/Spinner";
import { useGetCategoryQuery } from "../../redux/apiSlices/categoryApi";

const VideoManagementSystem = () => {
  const navigate = useNavigate();

  // Modal and editing states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [equipmentTags, setEquipmentTags] = useState([]);

  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Build query params
  const queryParams = [];
  if (statusFilter !== "all")
    queryParams.push({ name: "status", value: statusFilter });
  if (typeFilter !== "all")
    queryParams.push({ name: "type", value: typeFilter });
  if (categoryFilter !== "all")
    queryParams.push({ name: "category", value: categoryFilter });
  queryParams.push({ name: "page", value: currentPage });
  queryParams.push({ name: "limit", value: pageSize });

  // API calls
  const { data: categoryData } = useGetCategoryQuery();
  const categories = categoryData?.data || [];
  console.log(categories)

  const {
    data: videosData,
    isLoading: isLoadingVideos,
    refetch,
  } = useGetAllVideosQuery(queryParams);
  console.log(videosData)

  const videos = videosData?.data || [];
  const paginationData = videosData?.pagination || {
    total: 0,
    current: 1,
    pageSize: 10,
  };

  // Fetch single video data when editingId is set
  const { data: videoDetails } = useGetVideoByIdQuery(editingId, {
    skip: !editingId,
  });

  const [deleteVideo] = useDeleteVideoMutation();
  const [updateVideoStatus] = useUpdateVideoStatusMutation();

  // Update currentVideo and equipmentTags whenever videoDetails or editingId changes
  useEffect(() => {
    if (editingId && videoDetails) {
      setCurrentVideo({
        ...videoDetails,
        id: videoDetails._id || videoDetails.id,
      });
      setEquipmentTags(videoDetails.equipment || []);
    } else if (!editingId) {
      setCurrentVideo(null);
      setEquipmentTags([]);
    }
  }, [editingId, videoDetails]);

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, categoryFilter]);

  // Show form modal for add or edit
  const showFormModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
    } else {
      setEditingId(null);
    }
    setIsFormModalVisible(true);
  };

  // Show details modal and set editingId to fetch video details
  const showDetailsModal = (record) => {
    if (record.type === "class") {
      setEditingId(record._id);
      setIsDetailsModalVisible(true);
    } else if (record.type === "course") {
      const subCategoryId = record.subCategoryId?._id || record.subCategoryId;
      if (subCategoryId) {
        navigate(`/video-management/${subCategoryId}`);
      } else {
        message.error("Subcategory ID not found");
      }
    }
  };

  const closeFormModal = () => {
    setIsFormModalVisible(false);
    setEditingId(null);
    setCurrentVideo(null);
    setEquipmentTags([]);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setEditingId(null);
    setCurrentVideo(null);
    setEquipmentTags([]);
  };

  const handleFormSubmit = async () => {
    closeFormModal();
    await refetch();
  };

  // Delete video with confirmation
  const handleDeleteVideo = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this video?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteVideo(id).unwrap();
          message.success("Video deleted successfully");
          refetch();
        } catch {
          message.error("Failed to delete video");
        }
      },
    });
  };

  // Change video status with confirmation
  const handleStatusChange = (checked, record) => {
    const newStatus = checked ? "active" : "inactive";
    Modal.confirm({
      title: `Are you sure you want to set the status to "${newStatus}"?`,
      okText: "Yes",
      cancelText: "No",
      okButtonProps: { style: { backgroundColor: "red", borderColor: "red" } },
      onOk: async () => {
        try {
          await updateVideoStatus({
            id: record._id,
            ...record,
            status: newStatus,
          }).unwrap();
          message.success(`Video status updated to ${newStatus}`);
          refetch();
        } catch {
          message.error("Failed to update video status");
        }
      },
    });
  };

  // Pagination handler
  const handleTableChange = (paginationConfig) => {
    setCurrentPage(paginationConfig.current);
    setPageSize(paginationConfig.pageSize);
  };

  // Filter handlers
  const handleCategoryFilter = (category) => setCategoryFilter(category);
  const handleStatusFilter = (status) => setStatusFilter(status.toLowerCase());
  const handleTypeFilter = (type) => setTypeFilter(type.toLowerCase());

  // Filter menus
  const categoryMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => handleCategoryFilter("all")}>
        All Categories
      </Menu.Item>
      {categories.map((cat) => (
        <Menu.Item key={cat._id} onClick={() => handleCategoryFilter(cat.name)}>
          {cat?.name}
        </Menu.Item>
      ))}
    </Menu>
  );

  const statusMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => handleStatusFilter("all")}>
        All Status
      </Menu.Item>
      <Menu.Item key="active" onClick={() => handleStatusFilter("active")}>
        Active
      </Menu.Item>
      <Menu.Item key="inactive" onClick={() => handleStatusFilter("inactive")}>
        Inactive
      </Menu.Item>
    </Menu>
  );

  // const typeMenu = (
  //   <Menu>
  //     <Menu.Item key="all" onClick={() => handleTypeFilter("all")}>
  //       All Type
  //     </Menu.Item>
  //     <Menu.Item key="class" onClick={() => handleTypeFilter("class")}>
  //       Class
  //     </Menu.Item>
  //     <Menu.Item key="course" onClick={() => handleTypeFilter("course")}>
  //       Course
  //     </Menu.Item>
  //   </Menu>
  // );

  // Table columns
  const columns = [
    {
      title: "SL",
      key: "id",
      width: 70,
      align: "center",
      render: (_, __, index) => `# ${(currentPage - 1) * pageSize + index + 1}`,
    },
    {
      title: "Video Title",
      dataIndex: "title",
      key: "title",
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
            style={{ width: 100, height: 50, objectFit: "cover" }}
            className="rounded-lg"
          />
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: ["categoryId", "name"],
      key: "category",
      align: "center",
    },
    // {
    //   title: "Type",
    //   dataIndex: "type",
    //   key: "type",
    //   align: "center",
    // },
    // {
    //   title: "Name",
    //   dataIndex: "subCategory",
    //   key: "subCategory",
    //   align: "center",
    //   render: (text) => (text ? text : "N/A"), 
    // },
    
    {
      title: "Upload Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (text) => moment(text).format("L"),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      align: "center",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      // render: (status) => (
      //   <Tag color={status === "active" ? "success" : "error"}>
      //     {status === "active" ? "Active" : "Inactive"}
      //   </Tag>
      // ),
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
            onClick={() => showFormModal(record)}
          />
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#55f" }} />}
            onClick={() => showDetailsModal(record)}
            title={
              record.type === "class"
                ? "View Details"
                : "View Subcategory Videos"
            }
          />
          <Switch
            size="small"
            checked={record.status === "active"}
            onChange={(checked) => handleStatusChange(checked, record)}
            style={{
              backgroundColor: record.status === "active" ? "red" : "gray",
            }}
          />
          <Button
            type="text"
            icon={<DeleteOutlined style={{ color: "#ff4d4f" }} />}
            onClick={() => handleDeleteVideo(record._id)}
          />
        </Space>
      ),
    },
  ];

  // Display text helpers
  const getCategoryDisplayText = () => {
    if (categoryFilter === "all") return "All Categories";
    const category = categories.find((cat) => cat.name === categoryFilter);
    return category ? category.name : "All Categories";
  };

  const getTypeDisplayText = () => {
    if (typeFilter === "all") return "All Type";
    return typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1);
  };

  const getStatusDisplayText = () => {
    if (statusFilter === "all") return "All Status";
    return statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1);
  };

  if (isLoadingVideos) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="flex justify-end gap-6 mb-6">
        <Space size="small" className="flex gap-4">
          <Dropdown
            overlay={categoryMenu}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <Button
              className="py-5 mr-2 text-white bg-red-600 hover:bg-red-800 hover:text-white hover:icon-black"
              style={{ border: "none" }}
            >
              <Space>
                <Filtering className="filtering-icon" />
                <span className="filter-text">{getCategoryDisplayText()}</span>
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown>

          <Dropdown
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
          </Dropdown>

          {/* <Dropdown
            overlay={typeMenu}
            trigger={["click"]}
            placement="bottomLeft"
          >
            <Button
              className="py-5 mr-2 text-white bg-red-600 hover:bg-red-800 hover:text-white hover:icon-black"
              style={{ border: "none" }}
            >
              <Space>
                <Filtering className="filtering-icon" />
                <span className="filter-text">{getTypeDisplayText()}</span>
                <DownOutlined />
              </Space>
            </Button>
          </Dropdown> */}
        </Space>

        <GradientButton
          type="primary"
          onClick={() => showFormModal()}
          className="py-5"
          icon={<PlusOutlined />}
        >
          Upload New Video
        </GradientButton>
      </div>

      <Table
        columns={columns}
        dataSource={videos}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: paginationData.total || 0,
        }}
        onChange={handleTableChange}
        rowKey="_id"
        bordered
        size="small"
        className="custom-table"
        scroll={{ x: "max-content" }}
      />

      {/* Add/Edit Video Modal */}
      <VideoFormModal
        visible={isFormModalVisible}
        onCancel={closeFormModal}
        onSuccess={handleFormSubmit}
        currentVideo={currentVideo}
        editingId={editingId}
        categories={categories}
        equipmentTags={equipmentTags}
        setEquipmentTags={setEquipmentTags}
      />

      {/* Video Details Modal */}
      <VideoDetailsModal
        visible={isDetailsModalVisible}
        onCancel={closeDetailsModal}
        currentVideo={currentVideo}
      />
    </div>
  );
};

export default VideoManagementSystem;
