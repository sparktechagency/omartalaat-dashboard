import React, { useState } from "react";
import { 
  useCreateDailyInspirationMutation, 
  useDeleteDailyInspirationMutation, 
  useGetAllDailyInspirationQuery, 
  useGetDailyInspirationByIdQuery, 
  useUpdateDailyInspirationMutation, 
  useUpdateDailyInspirationStatusMutation,
  useScheduleDailyInspirationMutation,
  useGetScheduledDailyInspirationQuery
} from "../../redux/apiSlices/dailyInspiraton";
import VideoUploadSystem from "../common/VideoUploade";
import { 
  useGetAllVideosQuery,
  useScheduleVideoMutation
} from "../../redux/apiSlices/videoApi";
import { Button, Modal, Form, Input, Select, DatePicker, Space, Table, message, Tag, Card, Popover } from "antd";
import { PlusOutlined, CalendarOutlined, UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import GradientButton from "../common/GradiantButton";
import { getVideoAndThumbnail } from "../common/imageUrl";
import moment from "moment";

const { Option } = Select;

const DailyInspirationPage = () => {
  const [createDailyInspiration] = useCreateDailyInspirationMutation();
  const [updateDailyInspiration] = useUpdateDailyInspirationMutation();
  const [deleteDailyInspiration] = useDeleteDailyInspirationMutation();
  const [updateDailyInspirationStatus] = useUpdateDailyInspirationStatusMutation();

  // Schedule API hooks
  const [scheduleDailyInspiration] = useScheduleDailyInspirationMutation();
  
  // State for scheduling
  const [schedulingModalVisible, setSchedulingModalVisible] = useState(false);
  const [schedulingVideo, setSchedulingVideo] = useState(null);
  const [schedulingDate, setSchedulingDate] = useState(null);
  const [scheduledVideoId, setScheduledVideoId] = useState(null); // Track just scheduled video
  
  // Get all videos and scheduled videos - using the all videos API
  const { data: allVideosData, isLoading: allVideosLoading } = useGetAllVideosQuery();
  const { data: scheduledData, isLoading: scheduledLoading, refetch: refetchScheduled } = useGetScheduledDailyInspirationQuery();
  console.log(scheduledData)
  console.log(allVideosData)
  
  const allVideos = allVideosData?.data || [];
  const scheduledVideos = scheduledData?.data || [];

  // Sort videos by publishAt date (chronologically, earliest first)
  const sortedVideos = React.useMemo(() => {
    // Create a map for quick lookup of scheduled video info
    const scheduledMap = new Map();
    scheduledVideos.forEach(sv => {
      scheduledMap.set(sv.videoId, sv);
    });

    // Map all videos with their schedule info
    const videosWithScheduleInfo = allVideos.map(video => {
      return {
        ...video,
        isScheduled: video.publishAt ? true : false,
      };
    });

    // Sort videos by publishAt date (chronologically, earliest first)
    return videosWithScheduleInfo.sort((a, b) => {
      // If both have publishAt dates, compare them
      if (a.publishAt && b.publishAt) {
        const dateA = new Date(a.publishAt);
        const dateB = new Date(b.publishAt);
        return dateA - dateB; // ascending order (earliest first)
      }
      
      // If only one has a publishAt date, the one with date comes first
      if (a.publishAt && !b.publishAt) return -1;
      if (!a.publishAt && b.publishAt) return 1;
      
      // If neither has a publishAt date, keep original order
      return 0;
    });
  }, [allVideos]);

  const categories = ["Daily Inspiration"];

  const apiHooks = {
    useGetAllQuery: useGetAllDailyInspirationQuery,
    useGetByIdQuery: useGetDailyInspirationByIdQuery,
    deleteItem: deleteDailyInspiration,
    updateItemStatus: updateDailyInspirationStatus,
    createItem: createDailyInspiration,
    updateItem: updateDailyInspiration, // This is the correct update function
    categories,
    // Add scheduling capability to the VideoUploadSystem component
    scheduleVideo: scheduleDailyInspiration, // Only use this for scheduling, not for updates
    refetchScheduled: refetchScheduled
  };

  // Handle scheduling Daily Inspiration videos
  const handleScheduleVideo = async (videoId, scheduleDate) => {
    try {
      if (!videoId || !scheduleDate) {
        message.error("Please select a video and schedule date");
        return;
      }

      const scheduleData = {
        videoId: videoId,
        publishAt: scheduleDate.toISOString()
      };

      // Call API to schedule video using the endpoint
      await scheduleDailyInspiration(scheduleData);
      message.success("Daily Inspiration video scheduled successfully!");
      setSchedulingVideo(null);
      setSchedulingDate(null);
      setScheduledVideoId(videoId); // Mark as scheduled
      setSchedulingModalVisible(false); // Close modal
      refetchScheduled();
    } catch (error) {
      console.error("Failed to schedule Daily Inspiration:", error);
      message.error("Failed to schedule Daily Inspiration video");
    }
  };

  // Library videos filtered to only show non-scheduled videos
  const availableVideos = allVideos.filter(video => 
    !scheduledVideos.some(scheduled => scheduled.videoId === video._id)
  );
  
  // Videos Table Columns for the modal
  const videoColumns = [
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
          </div>
        </div>
      )
    },
    {
      title: "Schedule Status",
      key: "scheduleStatus",
      render: (_, record) => {
        if (!record.publishAt) {
          return <Tag color="red">Not Scheduled</Tag>;
        }
        
        const scheduleDate = new Date(record.publishAt);
        const isUpcoming = scheduleDate > new Date();
        
        return (
          <div>
            <Tag color={isUpcoming ? "orange" : "green"}>
              {isUpcoming ? "Scheduled" : "Published"}
            </Tag>
            <p className="text-xs mt-1">
              {moment(record.publishAt).format("MMM DD, YYYY HH:mm")}
            </p>
          </div>
        );
      }
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => {
        // Check if video already has a publishAt date
        if (record.publishAt) {
          return (
            <Button 
              type="default"
              size="small"
              disabled
            >
              Scheduled
            </Button>
          );
        }
        
        return (
          <div className="flex items-center space-x-2">
            <DatePicker 
              showTime 
              size="small"
              onChange={(date) => {
                setSchedulingVideo(record._id);
                setSchedulingDate(date);
              }}
              className="mr-2"
              format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
              disabledDate={(current) => current && current < moment().startOf('day')}
              disabledTime={(current) => {
                if (!current) return {};
                const now = moment();
                if (current.isSame(now, 'day')) {
                  return {
                    disabledHours: () => [...Array(now.hour()).keys()],
                    disabledMinutes: () => current.hour() === now.hour() ? [...Array(now.minute()).keys()] : [],
                    disabledSeconds: () => current.hour() === now.hour() && current.minute() === now.minute() ? [...Array(now.second()).keys()] : [],
                  };
                }
                return {};
              }}
            />
            <Button 
              type="primary"
              size="small"
              icon={<CalendarOutlined />}
              onClick={() => handleScheduleVideo(record._id, schedulingDate)}
              disabled={scheduledVideoId === record._id || !schedulingDate || schedulingVideo !== record._id}
            >
              Schedule
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      {/* Add New Content button with Schedule Video button next to it */}
      <VideoUploadSystem 
        pageType="daily-inspiration" 
        apiHooks={apiHooks}
        additionalButtons={
          <GradientButton 
            onClick={() => setSchedulingModalVisible(true)}
            icon={<CalendarOutlined />}
            className="ml-2"
          >
            Schedule Video
          </GradientButton>
        }
      />
      
      {/* Schedule Videos Modal */}
      <Modal
        title="Schedule Daily Inspiration Videos"
        open={schedulingModalVisible}
        onCancel={() => {
          setSchedulingModalVisible(false);
          setSchedulingVideo(null);
          setSchedulingDate(null);
          setScheduledVideoId(null); // Reset on modal close
        }}
        footer={null}
        width={900}
      >
        <Table 
          columns={videoColumns}
          dataSource={sortedVideos}
          rowKey="_id"
          loading={allVideosLoading || scheduledLoading}
          pagination={{ pageSize: 8 }}
          locale={{ emptyText: "No videos found" }}
        />
      </Modal>
    </div>
  );
};

export default DailyInspirationPage;
