import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Tag,
  Image,
  DatePicker,
} from "antd";
import { InboxOutlined, DeleteOutlined, CalendarOutlined } from "@ant-design/icons";
import { getVideoAndThumbnail } from "./imageUrl";
import moment from "moment";

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const VideoFormModal = ({
  visible,
  onClose,
  onSubmit,
  editingItem,
  pageType,
  loading = false,
  apiHooks,
}) => {
  const [form] = Form.useForm();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [equipmentInput, setEquipmentInput] = useState("");
  const [videoDuration, setVideoDuration] = useState("");

  console.log(pageType);
  console.log(editingItem);

  const isEditMode = !!editingItem;

  // Function to get video duration
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      if (!file) {
        resolve("");
        return;
      }

      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;

        // Convert seconds to minutes and format
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);

        let formattedDuration;
        if (minutes > 0) {
          formattedDuration =
            seconds > 0
              ? `${minutes}.${seconds.toString().padStart(2, "0")} Min`
              : `${minutes} Min`;
        } else {
          formattedDuration = `${seconds} Sec`;
        }

        resolve(formattedDuration);
      };

      video.onerror = () => {
        window.URL.revokeObjectURL(video.src);
        resolve("");
      };

      video.src = URL.createObjectURL(file);
    });
  };

  // Categories based on page type
  const getCategories = () => {
    switch (pageType) {
      case "coming-soon":
        return ["Coming Soon"];
      case "daily-challenge":
        return ["Daily Challenge"];
      case "daily-inspiration":
        return ["Daily Inspiration"];
      default:
        return ["Video"];
    }
  };

  const getFormTitle = () => {
    const pageTitle =
      {
        "coming-soon": "Coming Soon",
        "today-video": "Today's Video",
        "challenge-video": "Challenge Video",
      }[pageType] || "Content";

    return editingItem ? `Edit ${pageTitle}` : `Add New ${pageTitle}`;
  };

  // Initialize form when editing
  useEffect(() => {
    if (editingItem && visible) {
      form.setFieldsValue({
        title: editingItem.title,
        category: editingItem.category,
        timeDuration: editingItem.timeDuration || editingItem.duration,
        description: editingItem.description,
        // Parse publishAt as ISO string if it exists
        publishAt: editingItem.publishAt ? moment(editingItem.publishAt) : null,
        // Set isReady value if it exists for coming-soon videos
        isReady: editingItem.isReady,
        // Set redirectUrl if it exists for coming-soon videos
        redirectUrl: editingItem.redirectUrl,
      });

      // Set equipments
      if (editingItem.equipments || editingItem.equipment) {
        const itemEquipments = editingItem.equipments || editingItem.equipment;
        setEquipments(
          Array.isArray(itemEquipments) ? itemEquipments : [itemEquipments]
        );
      }
    }
  }, [editingItem, visible, form]);

  // Reset form when modal closes
  useEffect(() => {
    if (!visible) {
      form.resetFields();
      setThumbnailFile(null);
      setVideoFile(null);
      setEquipments([]);
      setEquipmentInput("");
      setVideoDuration("");
    }
  }, [visible, form]);

  // Equipment handlers
  const addEquipment = () => {
    if (equipmentInput.trim() && !equipments.includes(equipmentInput.trim())) {
      setEquipments([...equipments, equipmentInput.trim()]);
      setEquipmentInput("");
    }
  };

  const removeEquipment = (equipmentToRemove) => {
    setEquipments(equipments.filter((eq) => eq !== equipmentToRemove));
  };

  const handleEquipmentKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEquipment();
    }
  };

  // File upload handlers
  const thumbnailProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }
      const isLt20M = file.size / 1024 / 1024 < 20;
      if (!isLt20M) {
        message.error("Image must be smaller than 20MB!");
        return false;
      }
      setThumbnailFile(file);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setThumbnailFile(null);
    },
    fileList: thumbnailFile ? [thumbnailFile] : [],
    showUploadList: false,
  };

  const videoProps = {
    beforeUpload: async (file) => {
      const isVideo = file.type.startsWith("video/");
      if (!isVideo) {
        message.error("You can only upload video files!");
        return false;
      }
      const isLt2000M = file.size / 1024 / 1024 < 2000;
      if (!isLt2000M) {
        message.error("Video must be smaller than 2GB!");
        return false;
      }

      setVideoFile(file);

      // Get video duration and set it to form
      try {
        const duration = await getVideoDuration(file);
        if (duration) {
          setVideoDuration(duration);
          form.setFieldsValue({
            timeDuration: duration,
          });
        }
      } catch (error) {
        console.error("Error getting video duration:", error);
      }

      return false; // Prevent auto upload
    },
    onRemove: () => {
      setVideoFile(null);
      setVideoDuration("");
      form.setFieldsValue({
        timeDuration: "",
      });
    },
    fileList: videoFile ? [videoFile] : [],
    showUploadList: false,
  };

  // Disable past dates for DatePicker
  const disablePastDates = (current) => {
    // Can not select days before today
    return current && current < moment().startOf('day');
  };

  // Form submission handler
  const handleFormSubmit = useCallback(
    async (values) => {
      try {
        const hasExistingThumbnail =
          editingItem?.thumbnailUrl || editingItem?.thumbnail;
        const hasExistingVideo = editingItem?.videoUrl;

        // Validate required files
        if (!thumbnailFile && !isEditMode) {
          message.error("Please select a thumbnail");
          return;
        }
        
        // Video is optional for coming-soon page type
        if (!videoFile && !isEditMode && pageType !== "coming-soon") {
          message.error("Please select a video");
          return;
        }

        // For edit mode, check if we have either existing files or new files
        if (isEditMode) {
          if (!thumbnailFile && !hasExistingThumbnail) {
            message.error("Please select a thumbnail");
            return;
          }
          if (!videoFile && !hasExistingVideo && pageType !== "coming-soon") {
            message.error("Please select a video");
            return;
          }
        }

        // Format duration - use the auto-detected duration if available
        const formattedDuration =
          values.timeDuration.includes(" Min") ||
          values.timeDuration.includes(" Sec")
            ? values.timeDuration
            : `${values.timeDuration} Min`;

        // Check if we're only scheduling an existing video
        // Only use the scheduling API if we're specifically on a page that needs scheduling
        // and not when we're editing an existing video (which should use the update API)
        if (isEditMode && editingItem?._id && values.publishAt && !thumbnailFile && !videoFile && 
            pageType !== "daily-inspiration" && pageType !== "daily-challenge") {
          // If only updating the schedule for an existing video
          const scheduleData = {
            videoId: editingItem._id,
            publishAt: values.publishAt.toISOString()
          };
          
          // Call the scheduling API directly
          try {
            if (apiHooks && apiHooks.scheduleVideo) {
              await apiHooks.scheduleVideo(scheduleData);
              message.success("Video scheduled successfully!");
              onClose();
              return;
            }
          } catch (error) {
            console.error("Error scheduling video:", error);
            message.error("Failed to schedule video");
            return;
          }
        }

        // For normal uploads with or without scheduling
        const videoData = {
          title: values.title,
          category: values.category,
          duration: formattedDuration,
          timeDuration: formattedDuration,
          description: values.description || "",
          equipment: equipments,
          equipments: equipments,
          uploadDate: editingItem?.uploadDate || new Date().toLocaleDateString(),
        };
        
        // If it's coming-soon and no video is provided, set a flag
        if (pageType === "coming-soon" && !videoFile && !hasExistingVideo) {
          videoData.noVideo = true;
        }
        
        // Add isReady field if it's a coming-soon video
        if (pageType === "coming-soon") {
          if (values.isReady) {
            videoData.isReady = values.isReady;
          }
          if (values.redirectUrl) {
            videoData.redirectUrl = values.redirectUrl;
          }
        };

        // Add publishAt if provided
        if (values.publishAt) {
          videoData.publishAt = values.publishAt.toISOString();
        }

        // Create FormData
        const formDataToSend = new FormData();
        formDataToSend.append("data", JSON.stringify(videoData));

        // Append files only if they are new files
        if (thumbnailFile) {
          formDataToSend.append("thumbnail", thumbnailFile);
        }
        if (videoFile) {
          formDataToSend.append("video", videoFile);
        }

        await onSubmit(formDataToSend);
      } catch (error) {
        console.error("Error submitting video:", error);
        message.error(
          `Failed to ${editingItem ? "update" : "add"} video: ${
            error?.message || "Unknown error"
          }`
        );
      }
    },
    [thumbnailFile, videoFile, editingItem, equipments, onSubmit, isEditMode, apiHooks]
  );

  return (
    <Modal
      title={getFormTitle()}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
      className="video-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        className="video-upload-form"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title */}
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter video title" }]}
          >
            <Input placeholder="Enter Your Video Title" className="h-12" />
          </Form.Item>

          {/* Category */}
          <Form.Item
            name="category"
            label="Select Category"
            rules={[{ required: true, message: "Please select a category" }]}
          >
            <Select placeholder="Video/Picture" className="h-12">
              {getCategories().map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Time Duration */}
          <Form.Item
            name="timeDuration"
            label="Time Duration"
            rules={[{ required: true, message: "Please enter time duration" }]}
          >
            <Input
              placeholder="Duration will be auto-detected from video"
              className="h-12"
              readOnly={!!videoDuration}
            />
          </Form.Item>

          {/* Publish At (Schedule) - Added new field */}
          <Form.Item
            name="publishAt"
            label="Publish At (Schedule)"
            help="Leave empty for immediate publishing"
          >
            <DatePicker 
              showTime 
              placeholder="Select date and time to publish" 
              className="h-12 w-full" 
              format="YYYY-MM-DDTHH:mm:ss.SSS[Z]"
              disabledDate={disablePastDates}
            />
          </Form.Item>
          
          {/* Ready Status - Only for coming-soon videos */}
          {pageType === "coming-soon" && (
            <>
              <Form.Item
                name="isReady"
                label="Status"
                rules={[{ required: true, message: "Please select a status" }]}
              >
                <Select placeholder="Select status" className="h-12">
                  <Option value="arrivedSoon">Arrived Soon</Option>
                  <Option value="ready">Ready</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="redirectUrl"
                label="Redirect URL"
                rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
              >
                <Input placeholder="Enter redirect URL (optional)" className="h-12" />
              </Form.Item>
            </>
          )}
            
          

          {/* Equipment */}
          <Form.Item label="Equipment">
            <div className="space-y-2">
              <Input
                placeholder="Add equipment and press Enter"
                value={equipmentInput}
                onChange={(e) => setEquipmentInput(e.target.value)}
                onKeyPress={handleEquipmentKeyPress}
                className="h-12"
                suffix={
                  <Button
                    type="text"
                    onClick={addEquipment}
                    disabled={!equipmentInput.trim()}
                  >
                    Add
                  </Button>
                }
              />
              {equipments.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {equipments.map((equipment, index) => (
                    <Tag
                      key={index}
                      closable
                      onClose={() => removeEquipment(equipment)}
                      color="red"
                    >
                      {equipment}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          </Form.Item>
        </div>

        {/* File Uploads */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {/* Thumbnail Upload */}
          <Form.Item label="Thumbnail" required={!isEditMode}>
            <Dragger {...thumbnailProps}>
              <InboxOutlined className="text-2xl mb-2" />
              <p>Click or drag image to upload</p>
              {isEditMode && (
                <p className="text-blue-500 text-xs">
                  Leave empty to keep existing thumbnail
                </p>
              )}
            </Dragger>
            {(thumbnailFile || editingItem?.thumbnailUrl) && (
              <div className="mt-2 text-center">
                <div className="relative inline-block">
                  <Image
                    src={
                      thumbnailFile
                        ? URL.createObjectURL(thumbnailFile)
                        : getVideoAndThumbnail
                        ? getVideoAndThumbnail(editingItem.thumbnailUrl)
                        : editingItem.thumbnailUrl || editingItem.thumbnail
                    }
                    width={400}
                    height={200}
                    style={{ objectFit: "cover" }}
                    className="rounded border"
                  />
                  {thumbnailFile && (
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => setThumbnailFile(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                      style={{ borderRadius: "50%", width: 24, height: 24 }}
                    />
                  )}
                </div>
              </div>
            )}
          </Form.Item>

          {/* Video Upload */}
          <Form.Item label="Video" required={!isEditMode && pageType !== "coming-soon"}>
            <Dragger {...videoProps}>
              <InboxOutlined className="text-2xl mb-2" />
              <p>Click or drag video to upload {pageType === "coming-soon" && "(optional)"}</p>
              {isEditMode && (
                <p className="text-blue-500 text-xs">
                  Leave empty to keep existing video
                </p>
              )}
            </Dragger>
            {(videoFile || editingItem?.videoUrl) && (
              <div className="mt-2 text-center">
                <div className="relative inline-block">
                  <video
                    src={
                      videoFile
                        ? URL.createObjectURL(videoFile)
                        : getVideoAndThumbnail
                        ? getVideoAndThumbnail(editingItem.videoUrl)
                        : editingItem.videoUrl
                    }
                    controls
                    style={{ width: 400, height: 200, objectFit: "cover" }}
                    className="rounded border"
                  />
                  {videoFile && (
                    <Button
                      type="text"
                      size="small"
                      icon={<DeleteOutlined />}
                      onClick={() => setVideoFile(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                      style={{ borderRadius: "50%", width: 24, height: 24 }}
                    />
                  )}
                </div>
              </div>
            )}
          </Form.Item>
        </div>

        {/* Description */}
        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Add video description (optional)" />
        </Form.Item>

        {/* Submit & Cancel Buttons - Keep on right side */}
        <Form.Item>
          <div className="flex justify-end space-x-4">
            <Button
              onClick={onClose}
              disabled={loading}
              className="py-6 px-10"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-primary py-6 px-8"
            >
              {editingItem ? "Update This Video" : "Add New Video"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default VideoFormModal;
