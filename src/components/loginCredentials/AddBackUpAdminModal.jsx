import React, { useEffect } from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  KeyOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const AddBackUpAdminModal = ({
  open,
  onCancel,
  onSubmit,
  editingAdmin,
  loading,
}) => {
  const [form] = Form.useForm();

  // Reset form when modal opens/closes or editingAdmin changes
  useEffect(() => {
    if (open) {
      if (editingAdmin) {
        // Populate form with existing admin data for editing
        form.setFieldsValue({
          name: editingAdmin.name,
          email: editingAdmin.email,
          phone: editingAdmin.phone || "",
          role: editingAdmin.role,
        });
      } else {
        // Reset form for creating new admin
        form.resetFields();
      }
    }
  }, [open, editingAdmin, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title={editingAdmin ? "Edit Admin" : "Create New Admin"}
      open={open}
      onCancel={handleCancel}
      width={500}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          className="bg-primary"
        >
          {editingAdmin ? "Update Admin" : "Create Admin"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        name="admin_form"
        initialValues={{
          role: "ADMIN",
        }}
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[
            {
              required: true,
              message: "Please input the admin name!",
            },
            {
              min: 2,
              message: "Name must be at least 2 characters long!",
            },
          ]}
        >
          <Input
            prefix={<UserOutlined className="site-form-item-icon" />}
            placeholder="Enter admin name"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: "Please input the email!",
            },
            {
              type: "email",
              message: "Please enter a valid email address!",
            },
          ]}
        >
          <Input
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Enter email address"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            {
              pattern: /^[\+]?[0-9\s\-\(\)]{10,}$/,
              message: "Please enter a valid phone number!",
            },
          ]}
        >
          <Input
            prefix={<PhoneOutlined className="site-form-item-icon" />}
            placeholder="Enter phone number (optional)"
            size="large"
          />
        </Form.Item>

        {!editingAdmin && (
          <Form.Item
            label="Password"
            name="password"
            rules={[
              {
                required: true,
                message: "Please input the password!",
              },
              {
                min: 6,
                message: "Password must be at least 6 characters long!",
              },
            ]}
          >
            <Input.Password
              prefix={<KeyOutlined className="site-form-item-icon" />}
              placeholder="Enter password"
              size="large"
            />
          </Form.Item>
        )}

        <Form.Item
          label="Role"
          name="role"
          rules={[
            {
              required: true,
              message: "Please select a role!",
            },
          ]}
        >
          <Select placeholder="Select role" size="large">
            <Option value="ADMIN">Admin</Option>
          </Select>
        </Form.Item>

        {editingAdmin && (
          <Form.Item
            label="New Password (Optional)"
            name="password"
            help="Leave empty to keep current password"
          >
            <Input.Password
              prefix={<KeyOutlined className="site-form-item-icon" />}
              placeholder="Enter new password (optional)"
              size="large"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default AddBackUpAdminModal;
