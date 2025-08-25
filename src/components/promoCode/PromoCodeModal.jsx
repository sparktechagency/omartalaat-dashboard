import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, DatePicker, Button, message } from 'antd';
import dayjs from 'dayjs';
import { 
  useCreatePromoCodeMutation, 
  useUpdatePromoCodeMutation 
} from '../../redux/apiSlices/promoCode';

const { RangePicker } = DatePicker;

const PromoCodeModal = ({ isOpen, onClose, editingPromoCode }) => {
  const [form] = Form.useForm();
  const [createPromoCode, { isLoading: createLoading }] = useCreatePromoCodeMutation();
  const [updatePromoCode, { isLoading: updateLoading }] = useUpdatePromoCodeMutation();

  const isEditing = !!editingPromoCode;
  const isLoading = createLoading || updateLoading;

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (isOpen) {
      if (editingPromoCode) {
        // Set form values for editing
        form.setFieldsValue({
          title: editingPromoCode.title,
          percentageOff: editingPromoCode.percentageOff,
          maxUsage: editingPromoCode.maxUsage,
          dateRange: [
            dayjs(editingPromoCode.startDate),
            dayjs(editingPromoCode.endDate)
          ],
          promoCode: editingPromoCode.promoCode,
        });
      } else {
        // Reset form for create mode
        form.resetFields();
      }
    }
  }, [isOpen, editingPromoCode, form]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Format data for API
      const apiData = {
        title: values.title,
        percentageOff: values.percentageOff,
        maxUsage: values.maxUsage,
        startDate: values.dateRange[0].toISOString(),
        endDate: values.dateRange[1].toISOString(),
        promoCode: values.promoCode
      };

      if (isEditing) {
        await updatePromoCode({
          id: editingPromoCode._id,
          promoCodeData: apiData
        }).unwrap();
        message.success('Promo code updated successfully');
      } else {
        await createPromoCode(apiData).unwrap();
        message.success('Promo code created successfully');
      }

      form.resetFields();
      onClose();
    } catch (error) {
      message.error('Failed to save promo code. Please try again.');
      console.error('Failed to save promo code:', error);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isLoading) {
      form.resetFields();
      onClose();
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit Promo Code' : 'Create New Promo Code'}
      open={isOpen}
      onCancel={handleClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={isLoading}
      >
        {/* Promo Code Title */}
        <Form.Item
          label="Promo Code Title"
          name="title"
          rules={[
            { required: true, message: 'Please enter promo code title' },
          ]}
        >
          <Input placeholder="Enter Promo Code Title" />
        </Form.Item>

        {/* Percentage Off */}
        <Form.Item
          label="Percentage Off"
          name="percentageOff"
          rules={[
            { required: true, message: 'Please enter percentage off' },
            { type: 'number', min: 1, max: 100, message: 'Percentage must be between 1-100' },
          ]}
        >
          <InputNumber
            placeholder="10"
            min={1}
            max={100}
            addonAfter="%"
            style={{ width: '100%' }}
          />
        </Form.Item>

        {/* Date Range */}
        <Form.Item
          label="Date Range"
          name="dateRange"
          rules={[
            { required: true, message: 'Please select date range' },
          ]}
        >
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            placeholder={['Start Date & Time', 'End Date & Time']}
          />
        </Form.Item>

        {/* Amount Need (Max Usage) */}
        {/* <Form.Item
          label="Amount Need"
          name="maxUsage"
          rules={[
            { required: true, message: 'Please enter amount needed' },
            { type: 'number', min: 1, message: 'Amount must be at least 1' },
          ]}
        >
          <InputNumber
            placeholder="Enter Amount"
            min={1}
            style={{ width: '100%' }}
          />
        </Form.Item> */}

        {/* Promo Code */}
        <Form.Item
          label="Promo Code"
          name="promoCode"
          rules={[
            { required: true, message: 'Please enter promo code' },
            { min: 3, message: 'Promo code must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Enter Promo Code" style={{ textTransform: 'uppercase' }} />
        </Form.Item>

        {/* Form Actions */}
        <Form.Item className="mb-0">
          <div className="flex gap-3 justify-end">
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isLoading}
            >
              {isEditing ? 'Update Promo Code' : 'Create New Promo Code'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PromoCodeModal;