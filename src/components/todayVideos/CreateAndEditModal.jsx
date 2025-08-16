import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Button,
  message,
  Upload,
  Image,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import {
  useAddVideoMutation,
  useUpdateVideoMutation,
} from "../../redux/apiSlices/videoApi";
import { useGetSingleSubCategoryQuery } from "../../redux/apiSlices/subCategoryApi";
import { getVideoAndThumbnail } from "../common/imageUrl";

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

const CreateAndEditModal = ({
  visible,
  onCancel,
  onSuccess,
  currentVideo,
  categories,
  equipmentTags,
  setEquipmentTags,
}) => {
  const [form] = Form.useForm();
  const [categoryId, setCategoryId] = useState(null);
  const [videoType, setVideoType] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [tagInput, setTagInput] = useState("");

  const isEditMode = !!currentVideo?._id;

  const [addVideo, { isLoading: isAdding }] = useAddVideoMutation();
  const [updateVideo, { isLoading: isUpdating }] = useUpdateVideoMutation();

  const { data: subCategoryData } = useGetSingleSubCategoryQuery(categoryId, {
    skip: !categoryId || videoType === "class",
  });

  const subCategories = subCategoryData?.data || [];
  const isLoading = isAdding || isUpdating;

  // Initialize form data on modal open or currentVideo change
  useEffect(() => {
    if (visible && currentVideo) {
      const selectedCategoryId = currentVideo?.categoryId?._id || null;
      const selectedVideoType = currentVideo.type || "course";

      setCategoryId(selectedCategoryId);
      setVideoType(selectedVideoType);

      // Set form fields with proper values
      form.setFieldsValue({
        serial: currentVideo.serial || undefined,
        title: currentVideo.title,
        type: selectedVideoType,
        category: selectedCategoryId,
        subCategory: currentVideo.subCategoryId?._id || undefined,
        duration: currentVideo.duration || "",
        description: currentVideo.description || "",
      });

      setThumbnailFile(null); // Reset thumbnailFile so existing image shows
      setVideoFile(null); // Reset videoFile so existing video shows
      setTagInput("");
    } else if (visible) {
      form.resetFields();
      setCategoryId(null);
      setVideoType(null);
      setThumbnailFile(null);
      setVideoFile(null);
      setTagInput("");
    }
  }, [visible, currentVideo, form]);

  const handleThumbnailUpload = (info) => {
    const file = info.fileList[0];
    setThumbnailFile(file?.originFileObj || file);
  };

  const handleVideoUpload = (info) => {
    const file = info.fileList[0];
    setVideoFile(file?.originFileObj || file);

    if (file?.originFileObj) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        const duration = Math.floor(video.duration);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        const formatted = `${minutes}:${seconds.toString().padStart(2, "0")}`;
        form.setFieldsValue({ duration: formatted });
      };
      video.src = URL.createObjectURL(file.originFileObj);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !equipmentTags.includes(tag)) {
      setEquipmentTags([...equipmentTags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setEquipmentTags(equipmentTags.filter((tag) => tag !== tagToRemove));
  };

  const handleTypeChange = (value) => {
    setVideoType(value);
    if (value === "class") {
      form.setFieldsValue({ subCategory: undefined });
    }
  };

  const handleCategoryChange = (value) => {
    setCategoryId(value);
    form.setFieldsValue({ subCategory: undefined });
  };

  const handleSubmit = async (values) => {
    try {
      if (!isEditMode && (!thumbnailFile || !videoFile)) {
        message.error("Please upload both thumbnail and video");
        return;
      }

      const selectedCategory = categories?.find(
        (cat) => cat._id === values.category
      );
      const selectedSubCategory =
        videoType === "course"
          ? subCategories?.find((sub) => sub._id === values.subCategory)
          : null;

      const videoData = {
        serial: values.serial,
        title: values.title,
        type: values.type,
        categoryId: values.category,
        category: selectedCategory?.name,
        subCategoryId: videoType === "course" ? values.subCategory : "",
        subCategory: videoType === "course" ? selectedSubCategory?.name : "",
        duration: values.duration.includes("Min")
          ? values.duration
          : `${values.duration} Min`,
        description: values.description || "",
        equipment: equipmentTags,
        uploadDate: currentVideo?.uploadDate || new Date().toLocaleDateString(),
      };

      if (isEditMode) {
        videoData.id = currentVideo._id;
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(videoData));

      if (thumbnailFile) formData.append("thumbnail", thumbnailFile);
      if (videoFile) formData.append("video", videoFile);

      const response = isEditMode
        ? await updateVideo({
            id: currentVideo._id,
            videoData: formData,
          }).unwrap()
        : await addVideo(formData).unwrap();

      message.success(`Video ${isEditMode ? "updated" : "added"} successfully`);
      onSuccess();
      onCancel();
    } catch (error) {
      message.error(`Failed to ${isEditMode ? "update" : "add"} video`);
    }
  };

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    showUploadList: false,
  };

  const thumbnailProps = {
    ...uploadProps,
    accept: "image/*",
    onChange: handleThumbnailUpload,
  };

  const videoProps = {
    ...uploadProps,
    accept: "video/*",
    onChange: handleVideoUpload,
  };

  return (
    <Modal
      title={isEditMode ? "Edit Video" : "Add New Video"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {/* Form Fields */}
        <div className="grid grid-cols-3 gap-4">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Video Title" className="py-6" />
          </Form.Item>

          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select
              placeholder="Select Category"
              onChange={handleCategoryChange}
              className="h-12"
            >
              {categories?.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Type"
            name="type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select
              placeholder="Select Type"
              onChange={handleTypeChange}
              className="h-12"
            >
              <Option value="class">class</Option>
              <Option value="course">course</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {isEditMode && (
            <Form.Item
              label="Serial Name"
              name="serial"
              rules={[{ required: true, message: "Please enter serial name" }]}
            >
              <Input
                type="number"
                placeholder="Serial Name (number)"
                className="py-6"
              />
            </Form.Item>
          )}

          {videoType === "course" && (
            <Form.Item
              label="Sub Category"
              name="subCategory"
              rules={[{ required: true, message: "Please select subcategory" }]}
            >
              <Select
                placeholder="Select Sub Category"
                disabled={!categoryId}
                className="h-12"
              >
                {subCategories?.map((sub) => (
                  <Option key={sub._id} value={sub._id}>
                    {sub.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Form.Item
            label="Duration"
            name="duration"
            rules={[{ required: true, message: "Please enter duration" }]}
          >
            <Input placeholder="MM:SS" className="py-6" />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Form.Item label="Equipment">
            <div className="border rounded-lg p-2 h-[60px] w-full">
              {equipmentTags?.map((tag) => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => removeTag(tag)}
                  className="mb-1"
                >
                  {tag}
                </Tag>
              ))}
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onPressEnter={addTag}
                onBlur={addTag}
                placeholder="Add equipment"
                className="border-none"
                style={{ width: "200px" }}
              />
            </div>
          </Form.Item>
        </div>

        <div className="grid grid-cols-2 gap-4 ">
          <Form.Item label="Thumbnail" required={!isEditMode}>
            <Dragger {...thumbnailProps}>
              <InboxOutlined className="text-2xl mb-2" />
              <p>Click or drag image to upload</p>
            </Dragger>
            {(thumbnailFile || currentVideo?.thumbnailUrl) && (
              <div className="mt-2 text-center">
                <Image
                  src={
                    thumbnailFile
                      ? URL.createObjectURL(thumbnailFile)
                      : getVideoAndThumbnail(currentVideo.thumbnailUrl)
                  }
                  width={400}
                  height={200}
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item label="Video" required={!isEditMode}>
            <Dragger {...videoProps}>
              <InboxOutlined className="text-2xl mb-2" />
              <p>Click or drag video to upload</p>
            </Dragger>
            {(videoFile || currentVideo?.videoUrl) && (
              <div className="mt-2 text-center">
                <video
                  src={
                    videoFile
                      ? URL.createObjectURL(videoFile)
                      : getVideoAndThumbnail(currentVideo.videoUrl)
                  }
                  controls
                  style={{ width: 400, height: 200, objectFit: "cover" }}
                />
              </div>
            )}
          </Form.Item>
        </div>

        <Form.Item label="Description" name="description">
          <TextArea rows={4} placeholder="Video description" />
        </Form.Item>

        <div className="flex justify-end gap-6">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            className="py-6 px-10"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="bg-primary p-6"
          >
            {isEditMode ? "Update This" : "Add New"} Video
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateAndEditModal;
