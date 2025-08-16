import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Image,
  InputNumber,
  DatePicker,
} from "antd";
import { InboxOutlined, DeleteOutlined } from "@ant-design/icons";
import { getVideoAndThumbnail } from "../common/imageUrl";
import JoditTextEditor from "./JoditEditor";
import moment from "moment";

const { TextArea } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const PostFormModal = ({
  visible,
  onClose,
  onSubmit,
  editingItem,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const editor = useRef(null);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [postType, setPostType] = useState("text");
  const [textContent, setTextContent] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [publishDate, setPublishDate] = useState(null);

  const isEditMode = !!editingItem;

  const POST_TYPES = [
    { value: "text", label: "Text Post" },
    { value: "image", label: "Image Post" },
    { value: "video", label: "Video Post" },
  ];

  const getFormTitle = () => (editingItem ? "Edit Post" : "Create New Post");

  useEffect(() => {
    if (editingItem && visible) {
      const fieldsToSet = {
        type: editingItem.type,
      };

      // Only set title for image and video posts
      if (editingItem.type === "image" || editingItem.type === "video") {
        fieldsToSet.title = editingItem.title;
      }

      // Only set description and duration for video posts
      if (editingItem.type === "video") {
        fieldsToSet.description = editingItem.description;
        fieldsToSet.duration = editingItem.duration
          ? String(editingItem.duration)
          : undefined;
        setVideoDuration(
          editingItem.duration ? String(editingItem.duration) : ""
        );
      } else {
        setVideoDuration("");
      }

      // Set publish date if available
      if (editingItem.publishAt) {
        fieldsToSet.publishAt = moment(editingItem.publishAt);
        setPublishDate(moment(editingItem.publishAt));
      } else {
        fieldsToSet.publishAt = null;
        setPublishDate(null);
      }

      form.setFieldsValue(fieldsToSet);

      setPostType(editingItem.type || "text");
      setTextContent(editingItem.content || "");
      setThumbnailFile(null);
      setVideoFile(null);
      setImageFile(null);
    } else if (!visible) {
      form.resetFields();
      setThumbnailFile(null);
      setVideoFile(null);
      setImageFile(null);
      setPostType("text");
      setTextContent("");
      setVideoDuration("");
      setPublishDate(null);
      form.setFieldsValue({ publishAt: null });
    }
  }, [editingItem, visible, form]);

  const handlePostTypeChange = (value) => {
    setPostType(value);
    setThumbnailFile(null);
    setVideoFile(null);
    setImageFile(null);
    setTextContent("");
    setVideoDuration("");

    // Reset form fields when type changes
    form.resetFields(["title", "description", "duration"]);
  };

  const imageProps = {
    beforeUpload: (file) => {
      if (!file.type.startsWith("image/")) {
        message.error("You can only upload image files!");
        return false;
      }
      if (file.size / 1024 / 1024 > 20) {
        message.error("Image must be smaller than 20MB!");
        return false;
      }
      setImageFile(file);
      return false; // prevent auto upload
    },
    onRemove: () => {
      setImageFile(null);
    },
    fileList: imageFile ? [imageFile] : [],
    showUploadList: false,
  };

  const thumbnailProps = {
    beforeUpload: (file) => {
      if (!file.type.startsWith("image/")) {
        message.error("You can only upload image files!");
        return false;
      }
      if (file.size / 1024 / 1024 > 20) {
        message.error("Image must be smaller than 20MB!");
        return false;
      }
      setThumbnailFile(file);
      return false;
    },
    onRemove: () => {
      setThumbnailFile(null);
    },
    fileList: thumbnailFile ? [thumbnailFile] : [],
    showUploadList: false,
  };

  const videoProps = {
    beforeUpload: (file) => {
      if (!file.type.startsWith("video/")) {
        message.error("You can only upload video files!");
        return false;
      }
      if (file.size / 1024 / 1024 > 2000) {
        message.error("Video must be smaller than 2GB!");
        return false;
      }
      setVideoFile(file);

      // Get video duration when file is selected
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        const duration = Math.round(video.duration);
        setVideoDuration(String(duration));
        form.setFieldsValue({ duration: String(duration) });
      };
      video.src = URL.createObjectURL(file);

      return false;
    },
    onRemove: () => {
      setVideoFile(null);
      setVideoDuration("");
      form.setFieldsValue({ duration: undefined });
    },
    fileList: videoFile ? [videoFile] : [],
    showUploadList: false,
  };

  const validateForm = () => {
    if (postType === "text" && !textContent.trim()) {
      message.error("Please enter text content");
      return false;
    }
    if (postType === "image") {
      if (!imageFile && !isEditMode) {
        message.error("Please select an image");
        return false;
      }
      if (isEditMode && !imageFile && !editingItem?.imageUrl && !editingItem?.thumbnailUrl) {
        message.error("Please select an image");
        return false;
      }
    }
    if (postType === "video") {
      if (!videoFile && !isEditMode) {
        message.error("Please select a video");
        return false;
      }
      if (!thumbnailFile && !isEditMode) {
        message.error("Please select a thumbnail");
        return false;
      }
      if (isEditMode) {
        if (!videoFile && !editingItem?.videoUrl) {
          message.error("Please select a video");
          return false;
        }
        if (!thumbnailFile && !editingItem?.thumbnailUrl) {
          message.error("Please select a thumbnail");
          return false;
        }
      }
    }
    return true;
  };

  const handleFormSubmit = useCallback(
    async (values) => {
      try {
        if (!validateForm()) return;

        const postData = {
          type: postType,
          uploadDate:
            editingItem?.uploadDate || new Date().toLocaleDateString(),
          publishAt: values.publishAt ? values.publishAt.toISOString() : null,
        };

        if (postType === "text") {
          // Send textContent as title to backend
          postData.title = textContent;
        } else if (postType === "image") {
          postData.title = values.title;
        } else if (postType === "video") {
          postData.title = values.title;
          postData.description = values.description || "";
          // Keep duration as string to match backend validation
          postData.duration =
            values.duration !== undefined
              ? String(values.duration)
              : videoDuration
              ? String(videoDuration)
              : undefined;
        }

        const formDataToSend = new FormData();
        formDataToSend.append("data", JSON.stringify(postData));

        if (postType === "image" && imageFile) {
          formDataToSend.append("thumbnail", imageFile);
        }
        if (postType === "video") {
          if (videoFile) formDataToSend.append("video", videoFile);
          if (thumbnailFile) formDataToSend.append("thumbnail", thumbnailFile);
        }

        await onSubmit(formDataToSend);
      } catch (error) {
        console.error("Error submitting post:", error);
        message.error(`Failed to ${isEditMode ? "update" : "create"} post`);
      }
    },
    [
      postType,
      textContent,
      thumbnailFile,
      videoFile,
      imageFile,
      editingItem,
      onSubmit,
      isEditMode,
      videoDuration,
    ]
  );

  // Helper function to get the correct image URL
  const getImageSource = (item) => {
    if (!item) return "";
    
    // For image posts
    if (item.imageUrl) {
      return getVideoAndThumbnail(item.imageUrl);
    }
    
    // For video posts or any post with thumbnailUrl
    if (item.thumbnailUrl) {
      return getVideoAndThumbnail(item.thumbnailUrl);
    }
    
    return "";
  };

  return (
    <Modal
      title={getFormTitle()}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
       <div className="flex justify-between gap-10 items-center">
       <Form.Item
          name="type"
          label="Post Type"
          rules={[{ required: true, message: "Please select post type" }]}
          className="w-full"
        >
          <Select
            placeholder="Select Post Type"
            className="h-12 w-full"
            onChange={handlePostTypeChange}
            value={postType}
          >
            {POST_TYPES.map((type) => (
              <Option key={type.value} value={type.value}>
                {type.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Publish Date field - for all post types */}
        <Form.Item
          name="publishAt"
          label="Publish Date & Time"
          rules={[{ required: true, message: "Please select publish date" }]} 
          className="w-full"
        >
          <DatePicker 
            showTime 
            format="YYYY-MM-DD HH:mm:ss"
            placeholder="Select Date and Time"
            className="h-12 w-full"
            onChange={(date) => setPublishDate(date)}
            disabledDate={(current) => current && current < moment().startOf('day')}
            disabledTime={(current) => {
              if (!current) return {};
              const now = moment();
              if (current.isSame(now, 'day')) {
                const disabledHours = [];
                for (let i = 0; i < now.hour(); i++) disabledHours.push(i);
                const disabledMinutes = current.hour() === now.hour() ? Array.from({length: now.minute()}, (_, i) => i) : [];
                const disabledSeconds = (current.hour() === now.hour() && current.minute() === now.minute()) ? Array.from({length: now.second()}, (_, i) => i) : [];
                return {
                  disabledHours: () => disabledHours,
                  disabledMinutes: () => disabledMinutes,
                  disabledSeconds: () => disabledSeconds,
                };
              }
              return {};
            }}
          />
        </Form.Item>
       </div>

        {/* Title field - only for image and video posts */}
        {(postType === "image" || postType === "video") && (
          <Form.Item
            name="title"
            label="Post Title"
            rules={[{ required: true, message: "Please enter post title" }]}
          >
            <Input placeholder="Enter Your Post Title" className="h-12" />
          </Form.Item>
        )}

        {/* Text content - only for text posts */}
        {postType === "text" && (
          <Form.Item label="Post Content" required className="mb-6">
            <div className="editor-wrapper custom-height-editor">
              <JoditTextEditor
                ref={editor}
                value={textContent}
                tabIndex={1}
                onBlur={(newContent) => setTextContent(newContent)}
                onChange={(newContent) => setTextContent(newContent)}
              />
            </div>
          </Form.Item>
        )}

        {/* Image upload - only for image posts */}
        {postType === "image" && (
          <Form.Item label="Image (Thumbnail)" required={!isEditMode}>
            <Dragger {...imageProps}>
              <InboxOutlined className="text-2xl mb-2" />
              <p>Click or drag image to upload</p>
              {isEditMode && (
                <p className="text-blue-500 text-xs">
                  Leave empty to keep existing image
                </p>
              )}
            </Dragger>
            {(imageFile || (editingItem && (editingItem.imageUrl || editingItem.thumbnailUrl))) && (
              <div className="mt-2 text-center relative">
                <Image
                  src={
                    imageFile
                      ? URL.createObjectURL(imageFile)
                      : getImageSource(editingItem)
                  }
                  width={400}
                  height={200}
                  style={{ objectFit: "cover" }}
                  className="rounded border"
                />
                {imageFile && (
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => setImageFile(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600"
                    style={{ borderRadius: "50%", width: 24, height: 24 }}
                  />
                )}
              </div>
            )}
          </Form.Item>
        )}

        {/* Video fields - only for video posts */}
        {postType === "video" && (
          <>
            <Form.Item
              name="duration"
              label="Duration "
              rules={[
                { required: true, message: "Please enter video duration" },
              ]}
            >
              <InputNumber
                placeholder="Enter video duration in seconds"
                className="w-full h-12"
                min={1}
                value={videoDuration ? Number(videoDuration) : undefined}
                onChange={(val) => setVideoDuration(val ? String(val) : "")}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <Form.Item label="Thumbnail" required={!isEditMode}>
                <Dragger {...thumbnailProps}>
                  <InboxOutlined className="text-2xl mb-2" />
                  <p>Click or drag thumbnail to upload</p>
                  {isEditMode && (
                    <p className="text-blue-500 text-xs">
                      Leave empty to keep existing thumbnail
                    </p>
                  )}
                </Dragger>
                {(thumbnailFile || editingItem?.thumbnailUrl) && (
                  <div className="mt-2 text-center relative">
                    <Image
                      src={
                        thumbnailFile
                          ? URL.createObjectURL(thumbnailFile)
                          : getVideoAndThumbnail(editingItem.thumbnailUrl)
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
                )}
              </Form.Item>

              <Form.Item label="Video" required={!isEditMode}>
                <Dragger {...videoProps}>
                  <InboxOutlined className="text-2xl mb-2" />
                  <p>Click or drag video to upload</p>
                  {isEditMode && (
                    <p className="text-blue-500 text-xs">
                      Leave empty to keep existing video
                    </p>
                  )}
                </Dragger>
                {(videoFile || editingItem?.videoUrl) && (
                  <div className="mt-2 text-center relative">
                    <video
                      src={
                        videoFile
                          ? URL.createObjectURL(videoFile)
                          : getVideoAndThumbnail(editingItem.videoUrl)
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
                )}
              </Form.Item>
            </div>

            <Form.Item name="description" label="Description">
              <TextArea
                rows={4}
                placeholder="Add video description (optional)"
              />
            </Form.Item>
          </>
        )}

        <Form.Item>
          <div className="flex justify-end space-x-4">
            <Button onClick={onClose} disabled={loading} className="py-6 px-10">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-primary py-6 px-8"
            >
              {editingItem ? "Update Post" : "Create Post"}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PostFormModal;
