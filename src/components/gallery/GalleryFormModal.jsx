import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined, ReloadOutlined, PictureOutlined } from "@ant-design/icons";
import { getImageUrl } from "../common/imageUrl";

const { TextArea } = Input;

const GalleryForm = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          description: initialValues.description || ""
        });
        // Set preview URL from existing image
        if (initialValues.image) {
          setPreviewUrl(getImageUrl(initialValues.image));
          setImageLoaded(false);
          setImageError(false);
        } else {
          setPreviewUrl(null);
          setImageLoaded(false);
          setImageError(false);
        }
        setImageFile(null);
      } else {
        form.resetFields();
        setPreviewUrl(null);
        setImageFile(null);
        setImageLoaded(false);
        setImageError(false);
      }
    }
  }, [visible, initialValues, form]);

  const handleImageChange = (info) => {
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return;
      }
      
      // Validate file size (2MB limit)
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return;
      }

      setImageFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
        setImageLoaded(true);
        setImageError(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  const resetImage = () => {
    setPreviewUrl(null);
    setImageFile(null);
    setImageLoaded(false);
    setImageError(false);
  };

  const handleFormSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values, imageFile);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  // Render image preview section
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
        alt="Gallery preview"
        className="w-full rounded-3xl mb-2"
        style={{ maxHeight: "200px", objectFit: "contain" }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    );
  };

  return (
    <Modal
      title={initialValues ? "Edit Gallery Item" : "Add New Gallery Item"}
      open={visible}
      onCancel={onCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleFormSubmit}
          className="bg-red-500"
        >
          Save
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="description"
          label="Description"
          rules={[
            { required: true, message: "Please input gallery description!" },
            { min: 10, message: "Description must be at least 10 characters long!" },
            { max: 500, message: "Description cannot exceed 500 characters!" }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Write gallery description here..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item 
          name="image" 
          label="Gallery Image"
          rules={[{ required: !initialValues, message: "Please upload a gallery image!" }]}
        >
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
  );
};

export default GalleryForm;