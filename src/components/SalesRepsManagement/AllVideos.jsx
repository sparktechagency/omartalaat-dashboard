import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  DeleteOutlined,
  DownOutlined,
  PlusOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import moment from "moment/moment";
import { useGetByCategoryAllVideosQuery, useGetCategoryQuery, useVideoCopyOthersCategoryMutation } from "../../redux/apiSlices/categoryApi";
import { useDeleteVideoMutation, useGetAllVideosQuery, useGetVideoByIdQuery, useUpdateVideoStatusMutation } from "../../redux/apiSlices/videoApi";
import { useScheduleDailyInspirationMutation } from "../../redux/apiSlices/dailyInspiraton";
import { Filtering } from "../common/Svg";
import Spinner from "../common/Spinner";
import GradientButton from "../common/GradiantButton";
import VideoFormModal from "../retailerManagement/VideoFormModal";
import VideoDetailsModal from "../retailerManagement/VideoDetailsModal";
import { getVideoAndThumbnail } from "../common/imageUrl";

const AllVideos = () => {
  const { categoryId } = useParams();
  console.log(categoryId)

  // Modal and editing states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [equipmentTags, setEquipmentTags] = useState([]);

  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API calls
  const {
    data,
    isLoading: isLoadingVideos,
    refetch,
    } = useGetByCategoryAllVideosQuery(categoryId);
    const { data: categoryData } = useGetCategoryQuery();
    const categories = categoryData?.data || [];
    const { data: allVideosData, isLoading: allVideosLoading } = useGetAllVideosQuery();
    const TotalVideo = allVideosData?.data || [];
  // Schedule API
  const [videoCopyOthersCategory] = useVideoCopyOthersCategoryMutation();

  const allVideos = data?.data?.videos || [];
  const paginationData = data?.data?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    totalPage: 1,
  };

  // Filter videos based on filters
  const filteredVideos = allVideos.filter((video) => {
    const statusMatch = statusFilter === "all" || video.status === statusFilter;
    const typeMatch = typeFilter === "all" || video.type === typeFilter;
    return statusMatch && typeMatch;
  });

  // Paginate filtered videos
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

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
  }, [statusFilter, typeFilter]);

  console.log("Filtered Videos:", paginatedVideos);

  // Show form modal for add or edit
  const showFormModal = (record = null) => {
    if (record) {
      setEditingId(record._id);
      // currentVideo & equipmentTags will update automatically via useEffect above
    } else {
      setEditingId(null);
    }
    setIsFormModalVisible(true);
  };

  // Show details modal and set editingId to fetch video details
  const showDetailsModal = (record) => {
    setEditingId(record._id);
    setIsDetailsModalVisible(true);
  };

  // Close form modal and reset states
  const closeFormModal = () => {
    setIsFormModalVisible(false);
    setEditingId(null);
    setCurrentVideo(null);
    setEquipmentTags([]);
  };

  // Close details modal and reset states
  const closeDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setEditingId(null);
    setCurrentVideo(null);
    setEquipmentTags([]);
  };

  // Close schedule modal
  const closeScheduleModal = () => {
    setIsScheduleModalVisible(false);
  };

  // After form submission, close modal and refresh list
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

  // Handle adding video to Daily Inspiration
  const handleAddToSchedule = async (video) => {
    try {
      if (!video || !categoryId) {
        message.error("Video or category ID is missing");
        return;
      }

      const scheduleData = {
        videoId: video._id,
        categoryId: categoryId,
      };
console.log(scheduleData)
      await videoCopyOthersCategory(scheduleData);
      message.success("Video added to Daily Inspiration successfully!");
      setIsScheduleModalVisible(false);
    } catch (error) {
      console.error("Failed to add video to Daily Inspiration:", error);
      message.error("Failed to add video to Daily Inspiration");
    }
  };

  // Pagination handler
  const handleTableChange = (paginationConfig) => {
    setCurrentPage(paginationConfig.current);
    setPageSize(paginationConfig.pageSize);
  };

  // Filter handlers
  const handleStatusFilter = (status) => setStatusFilter(status.toLowerCase());
  const handleTypeFilter = (type) => setTypeFilter(type.toLowerCase());

  // Filter menus
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

  // Schedule Modal Video Columns
  const scheduleVideoColumns = [
    {
      title: "Video",
      dataIndex: "title",
      key: "video",
      render: (_, record) => (
        <div className="flex items-center">
          {record.thumbnailUrl && (
            <img 
              src={getVideoAndThumbnail(record.thumbnailUrl)} 
              alt={record.title || "Thumbnail"} 
              style={{ width: 80, height: 45, objectFit: "cover" }}
              className="mr-3 rounded"
            />
          )}
          <div>
            <p className="font-medium">{record.title || "Untitled Video"}</p>
            {record.duration && <p className="text-xs text-gray-500">Duration: {record.duration}</p>}
            {record.category && <p className="text-xs text-gray-500">Category: {record.category}</p>}
          </div>
        </div>
      )
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button 
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => handleAddToSchedule(record)}
        >
          Add Video
        </Button>
      )
    }
  ];

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
      title: "Thumbnail",
      dataIndex: "thumbnailUrl",
      key: "thumbnail",
      align: "center",
      width: 120,
      render: (thumbnailUrl) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={getVideoAndThumbnail(thumbnailUrl)}
            alt="thumbnail"
            className="object-cover rounded-xl"
            style={{ width: 100, height: 60 }}
          />
        </div>
      ),
    },
    {
      title: "Video Title",
      dataIndex: "title",
      key: "title",
      align: "center",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      align: "center",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      align: "center",
    },
    {
      title: "Course Name",
      dataIndex: "subCategory",
      key: "subCategory",
      align: "center",
      render: (subCategory) => subCategory || "N/A",
    },
    // {
    //   title: "Type",
    //   dataIndex: "type",
    //   key: "type",
    //   align: "center",
    //   render: (type) => (
    //     <Tag color={type === "course" ? "blue" : "orange"}>
    //       {type.toUpperCase()}
    //     </Tag>
    //   ),
    // },
   
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (createdAt) => moment(createdAt).format("L"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={status.toLowerCase() === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined style={{ color: "#f55" }} />}
            onClick={() => showFormModal(record)}
            title="Edit Video"
          />
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#55f" }} />}
            onClick={() => showDetailsModal(record)}
            title="View Video Details"
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
            title="Delete Video"
          />
        </Space>
      ),
    },
  ];

  // Display text helpers
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
    <div style={{ padding: 24 }}>
      <div className="flex justify-end gap-6 mb-6">
        <Space size="small" className="flex gap-4">
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
{/* 
          <Dropdown
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

        <Space>
          <GradientButton
            type="primary"
            onClick={() => setIsScheduleModalVisible(true)}
            className="py-5"
            icon={<CalendarOutlined />}
          >
            Schedule Video
          </GradientButton>
          
          <GradientButton
            type="primary"
            onClick={() => showFormModal()}
            className="py-5"
            icon={<PlusOutlined />}
          >
            Upload New Video
          </GradientButton>
        </Space>
      </div>

      <h2 style={{ marginBottom: 16 }}>All Videos</h2>

      <Table
        columns={columns}
        dataSource={paginatedVideos}
        rowKey="_id"
        loading={isLoadingVideos}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          //   total: filteredVideos.length,
          //   showSizeChanger: true,
          //   showQuickJumper: true,
          //   showTotal: (total, range) =>
          //     `${range[0]}-${range[1]} of ${total} videos`,
        }}
        onChange={handleTableChange}
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

      {/* Schedule Videos Modal */}
      <Modal
        title="Add Videos to library"
        open={isScheduleModalVisible}
        onCancel={closeScheduleModal}
        footer={null}
        width={900}
      >
        <Table 
          columns={scheduleVideoColumns}
          dataSource={TotalVideo}
          rowKey="_id"
          loading={isLoadingVideos}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "No videos found" }}
        />
      </Modal>
    </div>
  );
};

export default AllVideos;