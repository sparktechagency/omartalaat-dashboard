import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, DatePicker, message, Select } from "antd";
import moment from "moment";
import {
  useCreateCmPointsMutation,
  useUpdateCmPointsMutation,
} from "../../redux/apiSlices/CmPointsApi";

const { Option } = Select;

const CmPointsFormModal = ({ visible, onCancel, onSuccess, cmPoint }) => {
  const [form] = Form.useForm();
  const isEditMode = Boolean(cmPoint);

  const [createCmPoints, { isLoading: isCreating }] = useCreateCmPointsMutation();
  const [updateCmPoints, { isLoading: isUpdating }] = useUpdateCmPointsMutation();

  // Initialize form with cmPoint data if in edit mode
  useEffect(() => {
    if (visible && cmPoint) {
      // Format the month for DatePicker
      const monthValue = cmPoint.month ? moment(cmPoint.month) : null;
      
      // Set form values
      form.setFieldsValue({
        month: monthValue,
        category: cmPoint.category,
        noMembershipReward: cmPoint.rewards.find(r => r.userType === "noMembership")?.rewardAmount,
        advanceMembershipReward: cmPoint.rewards.find(r => r.userType === "advanceMembership")?.rewardAmount,
        premiumMembershipReward: cmPoint.rewards.find(r => r.userType === "premiumMembership")?.rewardAmount,
      });
    } else if (visible) {
      // Reset form when opening in create mode
      form.resetFields();
    }
  }, [visible, cmPoint, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Format the data for API
      const formattedData = {
        month: values.month.format("YYYY-MM"),
        category: values.category,
        rewards: [
          {
            userType: "noMembership",
            rewardAmount: values.noMembershipReward,
            minPurchaseRequired: 1,
          },
          {
            userType: "advanceMembership",
            rewardAmount: values.advanceMembershipReward,
            minPurchaseRequired: 1,
          },
          {
            userType: "premiumMembership",
            rewardAmount: values.premiumMembershipReward,
            minPurchaseRequired: 1,
          },
        ],
      };

      if (isEditMode) {
        // Add ID for update
        await updateCmPoints({
          ...formattedData,
          id: cmPoint._id,
        }).unwrap();
        message.success("CM Point updated successfully");
      } else {
        await createCmPoints(formattedData).unwrap();
        message.success("CM Point created successfully");
      }
      
      onSuccess();
    } catch (error) {
      console.error("Form submission error:", error);
      message.error("Failed to save CM Point");
    }
  };

  return (
    <Modal
      title={isEditMode ? "Edit CM Point" : "Add New CM Point"}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={isCreating || isUpdating}
          onClick={handleSubmit}
          className="bg-primary"
        >
          {isEditMode ? "Update" : "Create"}
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        name="cmPointsForm"
        initialValues={{
          category: "Offers",
        }}
      >
        <Form.Item
          name="month"
          label="Month"
          rules={[{ required: true, message: "Please select a month" }]}
        >
          <DatePicker
            picker="month"
            format="YYYY-MM"
            style={{ width: "100%" }}
            placeholder="Select month"
          />
        </Form.Item>

        <Form.Item
          name="category"
          label="Category"
          rules={[{ required: true, message: "Please enter a category" }]}
        >
         <Select
          placeholder="Select category"
          options={[
            { value: "credit", label: "Credit" },
            { value: "csAura", label: "Cs Aura" },
          ]} ></Select>
        </Form.Item>

        <Form.Item
          name="noMembershipReward"
          label="No Membership Reward"
          rules={[
            { required: true, message: "Please enter reward amount" },
            {
              type: "number",
              min: 0,
              transform: (value) => Number(value),
              message: "Reward must be a positive number",
            },
          ]}
        >
          <Input type="number" placeholder="Enter reward amount" />
        </Form.Item>

        <Form.Item
          name="advanceMembershipReward"
          label="Advance Membership Reward"
          rules={[
            { required: true, message: "Please enter reward amount" },
            {
              type: "number",
              min: 0,
              transform: (value) => Number(value),
              message: "Reward must be a positive number",
            },
          ]}
        >
          <Input type="number" placeholder="Enter reward amount" />
        </Form.Item>

        <Form.Item
          name="premiumMembershipReward"
          label="Premium Membership Reward"
          rules={[
            { required: true, message: "Please enter reward amount" },
            {
              type: "number",
              min: 0,
              transform: (value) => Number(value),
              message: "Reward must be a positive number",
            },
          ]}
        >
          <Input type="number" placeholder="Enter reward amount" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CmPointsFormModal;