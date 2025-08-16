import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  useDeleteDailyChallegeMutation,
  useGetSingleDailyChallengeQuery,
  useUpdateDailyChallengeMutation,
  useScheduleVideoRotationMutation,
  useCreateChallengeWithVideosMutation,
  useGetDailyChallengeVideosQuery,
  useDeleteDailyChallengeVideoMutation,
  useUpdateDailyChallengeVideoMutation
} from "../../redux/apiSlices/dailyChallangeApi";
import VideoUploadSystem from "../common/VideoUploade";
import { 
  useGetAllVideosQuery,
  useGetLibraryVideosQuery
} from "../../redux/apiSlices/videoApi";
import { Button, Modal, Form, Input, DatePicker, Space, Table, message, Tag, Card, Popover, Tabs } from "antd";
import { PlusOutlined, EyeOutlined, DeleteOutlined, CalendarOutlined } from "@ant-design/icons";
import GradientButton from "../common/GradiantButton";
import { getVideoAndThumbnail } from "../common/imageUrl";
import moment from "moment";
import ChallengeVideoUpload from "./ChallengeVideoUpload";

const { TabPane } = Tabs;

const ChallengeDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const challenge = location.state?.challenge;
  
  // Initialize all the hooks at the component level
  const [updateDailyChallenge] = useUpdateDailyChallengeMutation();
  const [updateDailyChallengeVideo] = useUpdateDailyChallengeVideoMutation();
  const [deleteDailyChallengeVideo] = useDeleteDailyChallengeVideoMutation();
  const [scheduleVideoRotation] = useScheduleVideoRotationMutation();
  
  // State for scheduling
  const [schedulingModalVisible, setSchedulingModalVisible] = useState(false);
  const [schedulingVideo, setSchedulingVideo] = useState(null);
  const [schedulingDate, setSchedulingDate] = useState(null);

  // Get challenge details if not passed via location state
  const { data: challengeData, isLoading: challengeLoading } = useGetSingleDailyChallengeQuery(id, {
    skip: !!challenge
  });
  
  const challengeDetails = challenge || challengeData?.data;
  
  // Get all videos from library
  const { data: allVideosData, isLoading: allVideosLoading } = useGetAllVideosQuery();
  const allVideos = allVideosData?.data || [];
  const [createChallengeWithVideos]=useCreateChallengeWithVideosMutation()
  
  // Define categories for today's videos
  const categories = [
    "Video/Picture",
    "Fitness",
    "Yoga",
    "Meditation",
    "Workout",
  ];

  // Pass the initialized mutation functions and query hooks
  const apiHooks = {
    useGetAllQuery: useGetDailyChallengeVideosQuery,
    useGetByIdQuery: useGetSingleDailyChallengeQuery,
    deleteItem: deleteDailyChallengeVideo, 
    updateItemStatus: updateDailyChallenge, 
    updateItem: updateDailyChallengeVideo, // This is the correct update function
    createItem: createChallengeWithVideos,
    categories,
    // Add scheduling capability - only use this for scheduling, not for updates
    scheduleVideo: scheduleVideoRotation,
  };

  // Handle video scheduling
  const handleScheduleVideo = async (videoId, scheduleDate) => {
    try {
      if (!videoId || !scheduleDate) {
        message.error("Please select a video and schedule date");
        return;
      }
  
      // Debug: Log challenge details to see available fields
      console.log("Challenge Details:", challengeDetails);
      console.log("Challenge ID:", id);
      
      // For challenges, the challenge ID itself should be used as the categoryId
      // This is because challenges are created as challenge-categories
      const categoryId = id; // Use the challenge ID from URL params
      
      if (!categoryId) {
        message.error("Challenge category not found. Please check challenge configuration.");
        console.error("Available challenge fields:", Object.keys(challengeDetails || {}));
        return;
      }
  
      const scheduleData = {
        videoId: videoId,
        publishAt: scheduleDate.toISOString(),
        categoryId: categoryId // Use the challenge ID as categoryId
      };
  
      console.log("Scheduling data:", scheduleData);
  
      // Call API to schedule video - only for scheduling, not for updates
      // This function should only be used for scheduling new videos, not updating existing ones
      await scheduleVideoRotation(scheduleData);
      message.success("Video scheduled successfully!");
      setSchedulingVideo(null);
      setSchedulingDate(null);
      setSchedulingModalVisible(false);
    } catch (error) {
      console.error("Failed to schedule video:", error);
      message.error("Failed to schedule video");
    }
  };

  // Sort videos by scheduled date (chronologically, earliest first)
  const sortedVideos = React.useMemo(() => {
    // Map all videos with their schedule info
    const videosWithScheduleInfo = allVideos.map(video => {
      // Check if this video is part of the current challenge
      const isInChallenge = challengeDetails?.videos?.some(
        v => v._id === video._id || v === video._id
      );
      
      return {
        ...video,
        isScheduled: isInChallenge,
        scheduledDate: isInChallenge ? video.publishAt || challengeDetails?.startDate : null
      };
    });

    // Sort videos by scheduled date (chronologically, earliest first)
    return videosWithScheduleInfo.sort((a, b) => {
      // If both have scheduled dates, compare them
      if (a.scheduledDate && b.scheduledDate) {
        const dateA = new Date(a.scheduledDate);
        const dateB = new Date(b.scheduledDate);
        return dateA - dateB; // ascending order (earliest first)
      }
      
      // If only one has a scheduled date, the one with date comes first
      if (a.scheduledDate && !b.scheduledDate) return -1;
      if (!a.scheduledDate && b.scheduledDate) return 1;
      
      // If neither has a scheduled date, keep original order
      return 0;
    });
  }, [allVideos, challengeDetails]);

  // Filter out already scheduled videos
  const availableVideos = allVideos.filter(video => {
    // Check if the video is not part of this challenge
    return !challengeDetails?.videos?.some(
      v => v._id === video._id || v === video._id
    );
  });

  // Videos Table Columns for the modal
  const videoColumns = [
    {
      title: "Video",
      dataIndex: "title",
      key: "video",
      width: "40%", // Fixed width for video column
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
      width: "25%", // Fixed width for status column
      render: (_, record) => {
        if (!record.isScheduled) {
          return <Tag color="red">Not Scheduled</Tag>;
        }
        
        const scheduleDate = record.scheduledDate ? new Date(record.scheduledDate) : null;
        const isUpcoming = scheduleDate && scheduleDate > new Date();
        
        return (
          <div>
            <Tag color={isUpcoming ? "orange" : "green"}>
              {isUpcoming ? "Scheduled" : "Active"}
            </Tag>
            {scheduleDate && (
              <p className="text-xs mt-1">
                {moment(scheduleDate).format("MMM DD, YYYY")}
              </p>
            )}
          </div>
        );
      }
    },
    {
      title: "Actions",
      key: "actions",
      width: "35%", // Fixed width for actions column
      render: (_, record) => {
        // Check if video is already scheduled
        if (record.isScheduled) {
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
              style={{ width: '150px' }} // Fixed width for DatePicker
            />
            <Button 
              type="primary"
              size="small"
              icon={<CalendarOutlined />}
              onClick={() => handleScheduleVideo(record._id, schedulingDate)}
              disabled={!schedulingDate || schedulingVideo !== record._id}
            >
              Schedule
            </Button>
          </div>
        );
      }
    }
  ];

  if (challengeLoading) {
    return <div>Loading challenge details...</div>;
  }

  if (!challengeDetails) {
    return <div>Challenge not found</div>;
  }

  return (
    <div className="w-full">
      {/* Challenge Details Header */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          {challengeDetails.imageUrl && (
            <img 
              src={challengeDetails.imageUrl} 
              alt={challengeDetails.name} 
              className="w-20 h-20 object-cover rounded-lg mr-4"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold">{challengeDetails.name}</h1>
            <p className="text-gray-500">{challengeDetails.description}</p>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <Button
          onClick={() => setSchedulingModalVisible(true)}
          icon={<CalendarOutlined />}
          className="absolute top-0 right-44 h-10 bg-[#CA3939] text-white border-none"
        >
          Schedule Video
        </Button>
      </div>
      {/* Action buttons */}
      <div className="mb-6 ">
        {/* Upload New Content button */}
        <ChallengeVideoUpload 
          pageType="daily-challenge" 
          apiHooks={apiHooks}
          challengeId={id}
        />
        
        {/* Schedule Video button */}
       
      </div>
      
      {/* Schedule Videos Modal */}
      <Modal
        title="Schedule Videos for Challenge"
        open={schedulingModalVisible}
        onCancel={() => {
          setSchedulingModalVisible(false);
          setSchedulingVideo(null);
          setSchedulingDate(null);
        }}
        footer={null}
        width={1500} // Increased modal width
      >
        <div style={{ width: '100%' }}> {/* Ensure full width container */}
          <Table 
            columns={videoColumns}
            dataSource={availableVideos}
            rowKey="_id"
            loading={allVideosLoading}
            pagination={{ pageSize: 8 }}
            locale={{ emptyText: "No videos available" }}
            scroll={{ x: 'max-content' }} // Enable horizontal scroll if needed
            style={{ width: '100%' }} // Ensure table takes full width
            tableLayout="fixed" // Fixed table layout for consistent column widths
          />
        </div>
      </Modal>
    </div>
  );
};

export default ChallengeDetails;