import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, Upload, Tag } from "antd";
import { UploadOutlined, ReloadOutlined, PictureOutlined } from "@ant-design/icons";
import { getImageUrl } from "../../common/imageUrl";

const { TextArea } = Input;

const SubCategoryForm = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Equipment state
  const [equipmentInput, setEquipmentInput] = useState("");
  const [equipments, setEquipments] = useState([]);

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        // Set form fields including description
        form.setFieldsValue({
          name: initialValues.name || "",
          description: initialValues.description || "",
        });

        // Set equipments from initialValues (default empty array)
        setEquipments(initialValues.equipment || []);

        // Set thumbnail preview URL using getImageUrl helper if thumbnail exists
        if (initialValues.thumbnail) {
          setPreviewUrl(getImageUrl(initialValues.thumbnail));
          setImageLoaded(false);
          setImageError(false);
        } else {
          setPreviewUrl(null);
          setImageLoaded(false);
          setImageError(false);
        }

        // Clear thumbnail file because no new file selected yet
        setThumbnailFile(null);
      } else {
        form.resetFields();
        setPreviewUrl(null);
        setThumbnailFile(null);
        setEquipments([]);
        setImageLoaded(false);
        setImageError(false);
      }
      setEquipmentInput("");
    }
  }, [visible, initialValues, form]);

  const handleThumbnailChange = (info) => {
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      setThumbnailFile(file);

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
    setThumbnailFile(null);
    setImageLoaded(false);
    setImageError(false);
  };

  const addEquipment = () => {
    const trimmed = equipmentInput.trim();
    if (trimmed && !equipments.includes(trimmed)) {
      setEquipments([...equipments, trimmed]);
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

  const handleFormSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit({ ...values, equipments }, thumbnailFile);
      form.resetFields();
      setThumbnailFile(null);
      setEquipments([]);
      setEquipmentInput("");
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
        alt="Thumbnail preview"
        className="w-full rounded mb-2"
        style={{ maxHeight: "200px", objectFit: "contain" }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    );
  };

  return (
    <Modal
      title={initialValues ? "Edit Course" : "Add New Course"}
      open={visible}
      onCancel={onCancel}
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
          name="name"
          label="Course Name"
          rules={[
            { required: true, message: "Please input Course Name!" },
          ]}
        >
          <Input placeholder="Write course Title" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            {
              required: true,
              message: "Please input course description!",
            },
          ]}
        >
          <TextArea rows={4} placeholder="Write course Description" />
        </Form.Item>

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

        <Form.Item name="thumbnail" label="Thumbnail">
          <div className="bg-gray-100 p-1 rounded">
            {renderImagePreview()}
            <div className="flex justify-between">
              <Upload
                beforeUpload={() => false}
                onChange={handleThumbnailChange}
                maxCount={1}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Select Thumbnail</Button>
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

export default SubCategoryForm;