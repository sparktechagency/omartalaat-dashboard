import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  useDeleteDailyChallegeMutation,
  useGetDailyChallengeQuery,
  useNewDailyChallengeMutation,
  useUpdateDailyChallengeMutation,
  useUpdateDailyChallengeStatusMutation, 
} from "../../redux/apiSlices/dailyChallangeApi";
import { useGetAllVideosQuery } from "../../redux/apiSlices/videoApi";
import { Button, Modal, Form, Input, Table, message, Tag, Upload, Switch } from "antd";
import { PlusOutlined, EyeOutlined, DeleteOutlined, EditOutlined, UploadOutlined, ReloadOutlined, PictureOutlined } from "@ant-design/icons";
import GradientButton from "../common/GradiantButton";
import moment from "moment";
import { getImageUrl } from "../common/imageUrl";

const { TextArea } = Input;

const TodayVideos = () => {
  const navigate = useNavigate();
  const [createDailyChallenge] = useNewDailyChallengeMutation();
  const [updateDailyChallenge] = useUpdateDailyChallengeMutation();
  const [deleteDailyChallenge] = useDeleteDailyChallegeMutation();
  const [updateDailyChallengeStatus] = useUpdateDailyChallengeStatusMutation(); // Add this hook

  const [challengeModalVisible, setChallengeModalVisible] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [challengeForm] = Form.useForm();
  
  // Image handling states (following SubCategoryForm pattern)
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const { data: allVideosData } = useGetAllVideosQuery();
  const allVideos = allVideosData?.data || [];

  const { data: challengesData, isLoading: challengesLoading, refetch: refetchChallenges } = useGetDailyChallengeQuery();
  const challenges = challengesData?.data || [];

  // Reset form and image states when modal opens/closes
  useEffect(() => {
    if (challengeModalVisible) {
      if (editingChallenge) {
        // Set form fields for editing
        challengeForm.setFieldsValue({
          name: editingChallenge.name || "",
          description: editingChallenge.description || "",
        });

        // Set image preview URL using getImageUrl helper if image exists
        if (editingChallenge.image) {
          setPreviewUrl(getImageUrl(editingChallenge.image));
          setImageLoaded(false);
          setImageError(false);
        } else {
          setPreviewUrl(null);
          setImageLoaded(false);
          setImageError(false);
        }

        // Clear image file because no new file selected yet
        setImageFile(null);
      } else {
        // Reset for new challenge
        challengeForm.resetFields();
        setPreviewUrl(null);
        setImageFile(null);
        setImageLoaded(false);
        setImageError(false);
      }
    }
  }, [challengeModalVisible, editingChallenge, challengeForm]);

  // Handle image file change
  const handleImageChange = (info) => {
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        setImageLoaded(true);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  // Handle image load error
  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  // Reset image
  const resetImage = () => {
    setPreviewUrl(null);
    setImageFile(null);
    setImageLoaded(false);
    setImageError(false);
  };

  // Render image preview section (following SubCategoryForm pattern)
  const renderImagePreview = () => {
    if (!previewUrl) {
      // No image selected - show placeholder
      return (
        <div className="w-full h-48 bg-gray-200 rounded mb-2 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <PictureOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
            <div>No image selected</div>
          </div>
        </div>
      );
    }

    if (imageError) {
      // Image failed to load - show error placeholder
      return (
        <div className="w-full h-48 bg-red-100 rounded mb-2 flex items-center justify-center">
          <div className="text-center text-red-500">
            <PictureOutlined style={{ fontSize: '48px', marginBottom: '8px' }} />
            <div>Failed to load image</div>
          </div>
        </div>
      );
    }

    // Show actual image
    return (
      <img
        src={previewUrl}
        alt="Challenge image preview"
        className="w-full rounded mb-2"
        style={{ maxHeight: "200px", objectFit: "contain" }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    );
  };

  const handleChallengeSubmit = async (values) => {
    try {
      const formData = new FormData();
      const jsonData = {
        name: values.name,
        description: values.description,
      };
  
      // If there is an image, append it to FormData
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (editingChallenge?.image) {
        formData.append('image', editingChallenge.image);
      }
  
      // Log the FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
  
      // Add JSON data to the form (excluding the image)
      formData.append('data', JSON.stringify(jsonData));
  
      // Check if we are editing or creating a new challenge
      if (editingChallenge) {
        await updateDailyChallenge({
          id: editingChallenge._id, // Send the ID as a parameter
          challengeData: formData, // Send the form data as the body with the correct parameter name
        });
        message.success("Challenge updated successfully!");
      } else {
        await createDailyChallenge(formData);  // Add the function to create a new challenge if needed.
        message.success("Challenge created successfully!");
      }
  
      // Reset form and states
      challengeForm.resetFields();
      setImageFile(null);
      setPreviewUrl(null);
      setEditingChallenge(null);
      setChallengeModalVisible(false);
      setImageLoaded(false);
      setImageError(false);
      refetchChallenges();
    } catch (error) {
      console.error("Failed to save challenge:", error);
      message.error("Failed to save challenge");
    }
  };

  // Handle status toggle
  const handleStatusToggle = async (challengeId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      
      await updateDailyChallengeStatus({
        id: challengeId,
        data: { status: newStatus }
      });
      
      message.success(`Challenge status updated to ${newStatus}`);
      refetchChallenges();
    } catch (error) {
      console.error("Failed to update challenge status:", error);
      message.error("Failed to update challenge status");
    }
  };
  
  const handleDeleteChallenge = async (id) => {
    try {
      await deleteDailyChallenge(id);
      message.success("Challenge deleted successfully!");
      refetchChallenges();
    } catch (error) {
      console.error("Failed to delete challenge:", error);
      message.error("Failed to delete challenge");
    }
  };

  const handleEditChallenge = (challenge) => {
    setEditingChallenge(challenge);
    setChallengeModalVisible(true);
  };

  const handleViewChallenge = (challenge) => {
    navigate(`/challenge-details/${challenge._id}`, { state: { challenge } });
  };

  const handleModalCancel = () => {
    setChallengeModalVisible(false);
    setEditingChallenge(null);
    challengeForm.resetFields();
    setImageFile(null);
    setPreviewUrl(null);
    setImageLoaded(false);
    setImageError(false);
  };

  const challengeColumns = [
    {
      title: "Challenge Name",
      key: "challengeName",
      render: (_, record) => (
        <div className="flex items-center">
          <p className="font-medium">{record.name || "Untitled Challenge"}</p>
        </div>
      ),
    },
    {
      title: "Challenge Image",
      key: "challengeImage",
      render: (_, record) => (
        <div className="flex items-center">
          {record.image && (
            <img
              src={getImageUrl(record.image)}
              alt={record.name || "Challenge"}
              style={{ width: 80, height: 45, objectFit: "cover" }}
              className="rounded"
            />
          )}
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (text) => <p className="max-w-md truncate">{text}</p>,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Tag color={record.status === "active" ? "green" : "red"}>
            {record.status || "inactive"}
          </Tag>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="flex items-center space-x-2">
          <Button
            size="small"
            className="hover:bg-red-600 border-none hover:text-white text-red-500"
            icon={<EyeOutlined />}
            onClick={() => handleViewChallenge(record)}
          />
          <Button
            size="small"
            className="hover:bg-red-600 border-none hover:text-white text-red-500"
            icon={<EditOutlined />}
            onClick={() => handleEditChallenge(record)}
          />
          <Switch
            checked={record.status === "active"}
            onChange={() => handleStatusToggle(record._id, record.status)}
            size="small"
            className="hover:bg-red-600 border-none hover:text-white text-red-500"
          />
          <Button
            className="hover:bg-red-600 border-none hover:text-white text-red-500"
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteChallenge(record._id)}
          />
        </div>
      ),
    },
  ];
  

  return (
    <div>
      {/* Add New Challenge button */}
      <div className="mb-4 flex justify-end">
        <GradientButton
          onClick={() => {
            setEditingChallenge(null);
            setChallengeModalVisible(true);
          }}
          icon={<PlusOutlined />}
        >
          Add New Challenge
        </GradientButton>
      </div>

      {/* Challenges Table */}
      <Table
        columns={challengeColumns}
        dataSource={challenges}
        rowKey="_id"
        loading={challengesLoading}
        pagination={{ pageSize: 8 }}
        locale={{ emptyText: "No challenges found" }}
          className="custom-table"
          size="small"
          scroll={{ x: "max-content" }}
      />

      {/* Challenge Modal */}
      <Modal
        title={editingChallenge ? "Edit Challenge" : "Add New Challenge"}
        open={challengeModalVisible}
        onCancel={handleModalCancel}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => challengeForm.submit()}
            className="bg-red-500"
          >
            {editingChallenge ? "Update" : "Create"} Challenge
          </Button>,
        ]}
        width={600}
      >
        <Form form={challengeForm} layout="vertical" onFinish={handleChallengeSubmit}>
          <Form.Item
            name="name"
            label="Challenge Name"
            rules={[{ required: true, message: "Please enter challenge name" }]}
          >
            <Input placeholder="Enter challenge name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={4} placeholder="Enter challenge description" />
          </Form.Item>

          <Form.Item name="image" label="Challenge Image">
            <div className="bg-gray-100 p-1 rounded">
              {renderImagePreview()}
              <div className="flex justify-between">
                <Upload
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                  maxCount={1}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>Select Image</Button>
                </Upload>
                <Button
                  icon={<ReloadOutlined />}
                  size="small"
                  shape="circle"
                  onClick={resetImage}
                  title="Reset image"
                />
              </div>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TodayVideos;