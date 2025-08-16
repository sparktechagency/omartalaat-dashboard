import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Switch,
  Modal,
  message,
  Tag,
  Breadcrumb,
  Typography,
  Card,
  Row,
  Col,
} from "antd";
import {
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  DragOutlined,
  TableOutlined,
  AppstoreOutlined,
  SaveOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import VideoFormModal from "./VideoFormModal";
import VideoDetailsModal from "./VideoDetailsModal";
import GradientButton from "../common/GradiantButton";
import {
  useGetVideosBySubCategoryQuery,
  useDeleteVideoMutation,
  useGetVideoByIdQuery,
  useGetSubCategoryByIdQuery,
  useUpdateVideoStatusMutation,
  useUpdateVideoOrderMutation,
} from "../../redux/apiSlices/videoApi";
import { useGetCategoryQuery } from "../../redux/apiSlices/categoryApi";
import { getVideoAndThumbnail } from "../common/imageUrl";
import moment from "moment/moment";
import Spinner from "../common/Spinner";

const { Title } = Typography;

// Video Card Component for drag and drop view
const VideoCard = ({
  video,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  isDragging,
  dragHandleProps,
  serialNumber,
}) => {
  return (
    <div
      className={`video-card ${isDragging ? "dragging" : ""} py-2`}
      style={{
        marginBottom: 10,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: isDragging
          ? "0 8px 32px rgba(0,0,0,0.2)"
          : "0 2px 8px rgba(0,0,0,0.1)",
        transform: isDragging ? "rotate(2deg) scale(1.02)" : "none",
        transition: "all 0.3s ease",
        border: isDragging ? "2px solid #1890ff" : "1px solid #f0f0f0",
        opacity: isDragging ? 0.8 : 1,
      }}
      hoverable
    >
      <Row gutter={16} align="middle">
        <Col span={1}>
          <div
            {...dragHandleProps}
            className="drag-handle"
            style={{
              cursor: "grab",
              padding: "8px",
              color: "#666",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
            }}
          >
            <DragOutlined />
          </div>
        </Col>

        <Col span={1}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#1890ff",
              textAlign: "center",
            }}
          >
            #{serialNumber}
          </div>
        </Col>

        <Col span={4}>
          <img
            src={getVideoAndThumbnail(video.thumbnailUrl)}
            alt={video.title}
            style={{
              width: "100%",
              height: 80,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        </Col>

        <Col span={8}>
          <div>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              {video.title}
            </h4>
            <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
              Duration: {video.duration || "N/A"}
            </p>
            <p style={{ margin: 0, color: "#999", fontSize: "12px" }}>
              Created: {moment(video.createdAt).format("L")}
            </p>
          </div>
        </Col>

        <Col span={3}>
          <Tag color={video.status === "active" ? "success" : "error"}>
            {video.status === "active" ? "Active" : "Inactive"}
          </Tag>
        </Col>

        <Col span={6}>
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(video)}
              style={{ color: "#1890ff" }}
              title="Edit Video"
            />
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(video)}
              style={{ color: "#52c41a" }}
              title="View Details"
            />
            <Switch
              size="small"
              checked={video.status === "active"}
              onChange={(checked) => onStatusChange(checked, video)}
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(video._id)}
              style={{ color: "#ff4d4f" }}
              danger
              title="Delete Video"
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

// Draggable Video List Component
const DraggableVideoList = ({
  videos,
  onReorder,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  hasChanges,
  onUpdateOrder,
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const handleDragStart = (e, video) => {
    setDraggedItem(video);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, video) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverItem(video);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = (e, targetVideo) => {
    e.preventDefault();

    if (!draggedItem || draggedItem._id === targetVideo._id) {
      return;
    }

    const draggedIndex = videos.findIndex((v) => v._id === draggedItem._id);
    const targetIndex = videos.findIndex((v) => v._id === targetVideo._id);

    const newVideos = [...videos];
    const [removed] = newVideos.splice(draggedIndex, 1);
    newVideos.splice(targetIndex, 0, removed);

    // Update serial numbers based on new order
    const reorderedVideos = newVideos.map((video, index) => ({
      ...video,
      serial: index + 1,
    }));

    onReorder(reorderedVideos);
  };

  return (
    <div className="draggable-video-list">
      {/* Update Order Button */}
      {hasChanges && (
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={onUpdateOrder}
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            Update Drag and Drop Order
          </Button>
        </div>
      )}

      {videos.map((video, index) => (
        <div
          key={video._id}
          draggable
          onDragStart={(e) => handleDragStart(e, video)}
          onDragOver={(e) => handleDragOver(e, video)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, video)}
          className={`drag-item ${
            dragOverItem?._id === video._id ? "drag-over" : ""
          }`}
          style={{
            transition: "all 0.2s ease",
          }}
        >
          <VideoCard
            video={video}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            isDragging={draggedItem?._id === video._id}
            serialNumber={video.serial}
            dragHandleProps={{
              onMouseDown: (e) => e.preventDefault(),
            }}
          />
        </div>
      ))}

      <style jsx>{`
        .drag-item {
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .drag-over {
          border-top: 3px solid #1890ff;
          padding-top: 8px;
          margin-top: 8px;
        }

        .video-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .drag-handle:hover {
          color: #1890ff;
          background: rgba(24, 144, 255, 0.1);
          border-radius: 4px;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .dragging {
          z-index: 1000;
          position: relative;
        }
      `}</style>
    </div>
  );
};

const CourseDetails = () => {
  const { subCategoryId } = useParams();
  const navigate = useNavigate();
  console.log(subCategoryId)

  // Modal states
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [equipmentTags, setEquipmentTags] = useState([]);

  // View mode state
  const [viewMode, setViewMode] = useState("card");

  // Drag and drop state
  const [localVideos, setLocalVideos] = useState([]);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // API calls
  const { data: categoryData } = useGetCategoryQuery();
  const categories = categoryData?.data || [];
  console.log(categories)

  const {
    data: videosData,
    isLoading: isLoadingVideos,
    refetch,
  } = useGetSubCategoryByIdQuery(subCategoryId);
  console.log(videosData);

  //   const {
  //     data: videosData,
  //     isLoading: isLoadingVideos,
  //     refetch,
  //   } = useGetVideosBySubCategoryQuery({
  //     subCategoryId,
  //     page: currentPage,
  //     limit: pageSize,
  //   });

  // console.log(videosData)

  const { data: videoDetails } = useGetVideoByIdQuery(editingId, {
    skip: !editingId,
  });

  const [deleteVideo] = useDeleteVideoMutation();
  const [updateVideoStatus] = useUpdateVideoStatusMutation();
  const [updateVideoOrder] = useUpdateVideoOrderMutation();

  const videos = videosData?.data || [];
  const paginationData = videosData?.pagination || {
    total: 0,
    current: 1,
    pageSize: 10,
  };
  // console.log(videos)

  // Sort videos by serial number and update local state
  useEffect(() => {
    if (videos.length > 0) {
      const sortedVideos = [...videos].sort((a, b) => a.serial - b.serial);
      setLocalVideos(sortedVideos);
      setHasOrderChanges(false);
    }
  }, [videos]);

  // Update current video when editing
  useEffect(() => {
    if (editingId) {
      if (videoDetails) {
        setCurrentVideo({
          ...videoDetails,
          id: videoDetails._id || videoDetails.id,
        });
        setEquipmentTags(videoDetails.equipment || []);
      }
    } else {
      setCurrentVideo(null);
      setEquipmentTags([]);
    }
  }, [editingId, videoDetails]);

  // Handle video reordering (local state only)
  const handleReorder = (reorderedVideos) => {
    setLocalVideos(reorderedVideos);
    setHasOrderChanges(true);
  };

  // Handle actual order update to server
  const handleUpdateOrder = async () => {
    try {
      // Create the update data array with _id and serial
      const orderData = localVideos.map((video) => ({
        _id: video._id,
        serial: video.serial,
      }));

      // Call the API to update order
      const res = await updateVideoOrder(orderData).unwrap();
      console.log(res);

      message.success("Video order updated successfully!");
      setHasOrderChanges(false);

      // Refetch to get updated data from server
      await refetch();
    } catch (error) {
      message.error("Failed to update video order");
      console.error("Update order error:", error);
    }
  };

  const showFormModal = (record = null) => {
    if (record) {
      setEditingId(record._id); // <-- set editingId to trigger single video fetch
    } else {
      setEditingId(null);
    }
    setIsFormModalVisible(true);
  };

  const showDetailsModal = (record) => {
    setEditingId(record._id);
    setIsDetailsModalVisible(true);
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

  // Delete video
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
        } catch (error) {
          message.error("Failed to delete video");
        }
      },
    });
  };

  // Status change
  const handleStatusChange = (checked, record) => {
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
          await updateVideoStatus({
            id: record._id,
            ...record,
            status: newStatus,
          }).unwrap();
          message.success(`Video status updated to ${newStatus}`);
          refetch();
        } catch (error) {
          message.error("Failed to update video status");
        }
      },
    });
  };

  // Table pagination
  const handleTableChange = (paginationConfig) => {
    setCurrentPage(paginationConfig.current);
    setPageSize(paginationConfig.pageSize);
  };

  // Table columns
  const columns = [
    {
      title: "Serial",
      dataIndex: "serial",
      key: "serial",
      align: "center",
      render: (text) => {
        return `# ${text}`;
      },
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
            onClick={() => showFormModal(record)}
          />
          <Button
            type="text"
            icon={<EyeOutlined style={{ color: "#55f" }} />}
            onClick={() => showDetailsModal(record)}
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

  if (isLoadingVideos ) {
    return <Spinner />;
  }

  return (
    <div style={{ padding: 24, minHeight: "100vh" }}>
      {/* Header Section */}
      <Card className="mb-6">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <Title level={3} className="mb-2">
              {videosData?.subCategoryId?.name || "Course"} Videos
            </Title>
            <div className="text-gray-600">
              Total Videos: {paginationData.total || 0}
            </div>
          </div>

          {/* Back Button */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            style={{
              borderRadius: "8px",
              height: "40px",
              padding: "0 16px",
            }}
          >
            Back
          </Button>
        </div>
      </Card>

      {/* Controls */}
      <div
        className="flex justify-between items-center mb-6"
        style={{ marginBottom: 24 }}
      >
        <div></div> {/* Empty div for spacing */}

        <Space size="middle">
          <Button.Group>
            <Button
              type="default"
              icon={<AppstoreOutlined />}
              onClick={() => setViewMode("card")}
              style={{
                borderRadius: "8px 0 0 8px",
                backgroundColor: viewMode === "card" ? "#CA3939" : undefined,
                color: viewMode === "card" ? "#fff" : undefined,
                padding: "10px 16px",
              }}
              className="h-10"
            >
              Do Shuffle
            </Button>
            <Button
              type="default"
              icon={<TableOutlined />}
              onClick={() => setViewMode("table")}
              style={{
                borderRadius: "0 8px 8px 0",
                backgroundColor: viewMode === "table" ? "#CA3939" : undefined,
                color: viewMode === "table" ? "#fff" : undefined,
                padding: "10px 16px",
              }}
              className="h-10"
            >
              Table View
            </Button>
          </Button.Group>

          <GradientButton
            type="primary"
            onClick={() => showFormModal()}
            className="py-5"
            icon={<PlusOutlined />}
          >
            Add New Video
          </GradientButton>
        </Space>
      </div>

      {/* Content */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        {viewMode === "card" ? (
          <DraggableVideoList
            videos={localVideos}
            onReorder={handleReorder}
            onEdit={showFormModal}
            onView={showDetailsModal}
            onDelete={handleDeleteVideo}
            onStatusChange={handleStatusChange}
            hasChanges={hasOrderChanges}
            onUpdateOrder={handleUpdateOrder}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={localVideos}
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
            locale={{
              emptyText: "No videos found in this subcategory",
            }}
          />
        )}
      </div>

      {localVideos.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#999",
          }}
        >
          <h3>No videos found</h3>
          <p>Add new videos to this course</p>
        </div>
      )}

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

export default CourseDetails;