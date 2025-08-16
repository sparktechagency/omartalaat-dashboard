import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  TimePicker,
  Select,
  Button,
  message,
} from "antd";
import { PictureOutlined, DeleteFilled } from "@ant-design/icons";
import moment from "moment";
import {
  useCreateAuctionMutation,
  useUpdateAuctionMutation,
} from "../../redux/apiSlices/auctionsApi";

const { Option } = Select;

const AuctionFormModal = ({ visible, onClose, editingAuction, onSuccess }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form] = Form.useForm();

  const [createAuction, { isLoading: isCreating }] = useCreateAuctionMutation();
  const [updateAuction, { isLoading: isUpdating }] = useUpdateAuctionMutation();

  const isEditing = !!editingAuction;

  useEffect(() => {
    if (visible && editingAuction) {
      // Parse the combined datetime back to separate date and time
      const startDateTime = editingAuction.startDate ? moment(editingAuction.startDate) : null;
      const endDateTime = editingAuction.endDate ? moment(editingAuction.endDate) : null;

      form.setFieldsValue({
        productName: editingAuction.name,
        productPrice: editingAuction.price,
        startDate: startDateTime,
        endDate: endDateTime,
        startTime: startDateTime,
        endTime: endDateTime,
        highestBidder: editingAuction.highestBidder,
        highestAmount: editingAuction.highestAmount,
        status: editingAuction.status,
        csAuraWorth: editingAuction.csAuraWorth,
        creditWorth: editingAuction.creditWorth,
        creditNeeds: editingAuction.creditNeeds,
      });

      if (editingAuction.productImage || editingAuction.image) {
        setImagePreview(editingAuction.productImage || editingAuction.image);
      }
    } else if (visible) {
      form.resetFields();
      setImagePreview(null);
      setSelectedImage(null);
    }
  }, [visible, editingAuction, form]);

  const handleClose = () => {
    form.resetFields();
    setSelectedImage(null);
    setImagePreview(null);
    onClose();
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        message.error("Please select an image file");
        return;
      }

      setSelectedImage(file);
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const removeImage = () => {
    if (imagePreview && selectedImage) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedImage(null);
    setImagePreview(null);
  };

  // Form submission handler
  const handleFormSubmit = async (values) => {
    try {
      // Validate required image for new auctions
      if (!isEditing && !selectedImage) {
        message.error("Please select an image for the auction");
        return;
      }

      // Combine date and time properly
      const startDateTime = values.startDate && values.startTime 
        ? moment(values.startDate)
            .hour(values.startTime.hour())
            .minute(values.startTime.minute())
            .second(0)
            .millisecond(0)
        : null;

      const endDateTime = values.endDate && values.endTime 
        ? moment(values.endDate)
            .hour(values.endTime.hour())
            .minute(values.endTime.minute())
            .second(0)
            .millisecond(0)
        : null;

      // Prepare the data
      const auctionData = {
        name: values.productName,
        startDate: startDateTime?.toISOString(),
        endDate: endDateTime?.toISOString(),
        csAuraWorth: Number(values.csAuraWorth),
        creditWorth: Number(values.creditWorth),
        creditNeeds: Number(values.creditNeeds),
      };

      // Add price only for new auctions or if provided in edit
      if (!isEditing || values.productPrice) {
        auctionData.price = Number(values.productPrice);
      }

      // Add status only if provided (not required for new auctions)
      if (values.status) {
        auctionData.status = values.status;
      }

      // Add editing-specific fields
      if (isEditing) {
        if (values.highestBidder) {
          auctionData.highestBidder = values.highestBidder;
        }
        if (values.highestAmount) {
          auctionData.highestAmount = Number(values.highestAmount);
        }
      }

      let result;

      if (selectedImage) {
        // If there's an image, send as FormData
        const formData = new FormData();
        formData.append("image", selectedImage);
        formData.append("data", JSON.stringify(auctionData));

        if (isEditing) {
          result = await updateAuction({
            auctionId: editingAuction._id || editingAuction.id,
            data: formData,
          }).unwrap();
        } else {
          result = await createAuction(formData).unwrap();
        }
      } else {
        // If no image, send as JSON (only for updates)
        if (isEditing) {
          result = await updateAuction({
            auctionId: editingAuction._id || editingAuction.id,
            data: auctionData,
          }).unwrap();
        } else {
          message.error("Image is required for new auctions");
          return;
        }
      }

      message.success(
        isEditing
          ? "Auction updated successfully!"
          : "Auction created successfully!"
      );
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      message.error(
        error?.data?.message ||
          `Failed to ${isEditing ? "update" : "create"} auction`
      );
    }
  };

  return (
    <Modal
      title={isEditing ? "Edit Auction" : "Create New Auction"}
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFormSubmit}
        className="mt-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="productName"
            label="Product Name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

    <Form.Item
            name="creditNeeds"
            label="Credit Needs"
            rules={[{ required: true, message: "Please enter Credit Needs" }]}
          >
            <InputNumber
              placeholder="Enter Credit Needs"
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>

          {/* <Form.Item
            name="productPrice"
            label={isEditing ? "Starting Price (Optional)" : "Starting Price"}
            rules={isEditing ? [] : [{ required: true, message: "Please enter starting price" }]}
          >
            <InputNumber
              placeholder="Enter starting price"
              style={{ width: "100%" }}
              min={0}
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item> */}
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="csAuraWorth"
            label="CS Aura Worth"
            rules={[{ required: true, message: "Please enter CS Aura Worth" }]}
          >
            <InputNumber
              placeholder="Enter CS Aura Worth"
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="creditWorth"
            label="Credit Worth"
            rules={[{ required: true, message: "Please enter Credit Worth" }]}
          >
            <InputNumber
              placeholder="Enter Credit Worth"
              style={{ width: "100%" }}
              min={0}
            />
          </Form.Item>

      
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="startDate"
            label="Start Date"
            rules={[{ required: true, message: "Please select start date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="End Date"
            rules={[{ required: true, message: "Please select end date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            name="startTime"
            label="Start Time"
            rules={[{ required: true, message: "Please select start time" }]}
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm" />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="End Time"
            rules={[{ required: true, message: "Please select end time" }]}
          >
            <TimePicker style={{ width: "100%" }} format="HH:mm" />
          </Form.Item>
        </div>

        {/* Required fields */}
      

        {isEditing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name="highestBidder" label="Highest Bidder">
              <Input placeholder="Highest bidder name" />
            </Form.Item>

            <Form.Item name="highestAmount" label="Highest Amount">
              <InputNumber
                placeholder="Highest bid amount"
                style={{ width: "100%" }}
                min={0}
                formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
              />
            </Form.Item>
          </div>
        )}

        <Form.Item name="status" label="Status (Optional)">
          <Select placeholder="Select status" allowClear>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
            <Option value="completed">Completed</Option>
          </Select>
        </Form.Item>

        {/* Custom Image Upload Section */}
        <Form.Item 
          label="Product Image"
          required={!isEditing}
          help={!isEditing ? "Image is required for new auctions" : ""}
        >
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 relative">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded"
                />
                <Button
                  type="primary"
                  danger
                  icon={<DeleteFilled />}
                  size="small"
                  className="absolute top-2 right-2"
                  onClick={removeImage}
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <PictureOutlined className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-500">Click to select image</p>
                {!isEditing && <p className="text-red-500 text-sm">* Required</p>}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </Form.Item>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isCreating || isUpdating}
          >
            {isEditing ? "Update Auction" : "Create Auction"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default AuctionFormModal;
