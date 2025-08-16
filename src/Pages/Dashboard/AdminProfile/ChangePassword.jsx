import { Button, Form, Input, message, notification } from "antd";
import React, { useState } from "react";
import { useChangePasswordMutation } from "../../../redux/apiSlices/authSlice";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import toast from "react-hot-toast";

const ChangePassword = () => {
  const [changePassword] = useChangePasswordMutation();
  const [form] = Form.useForm();

  // Define error messages state
  const [errorMessages, setErrorMessages] = useState({
    newPassError: "",
    conPassError: "",
  });

  // Validate password change
  const validatePasswordChange = (values) => {
    let errors = {};

    if (values.currentPassword === values.newPassword) {
      errors.newPassError = "The New password is similar to the old Password";
    }

    if (values.newPassword !== values.confirmPassword) {
      errors.conPassError = "New Password and Confirm Password don't match";
    }

    setErrorMessages(errors);
    return errors;
  };

  const onFinish = async (values) => {
    const errors = validatePasswordChange(values);

    // If no errors, proceed with the API call
    if (Object.keys(errors).length === 0) {
      try {
        const res = await changePassword(values).unwrap();
        console.log(res?.data?.success);

        if (res?.success) {
          toast.success("Password changed successfully");
          form.resetFields();
        } else {
          toast.error("Password change failed");
        }
      } catch (err) {
        console.error("Error changing password:", err);
        toast.error("An error occurred while changing the password");
      }
    }
  };

  return (
    <div className="shadow-lg p-10 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center justify-center w-full">
          {/* <IoArrowBackCircleOutline size={26} className="font-medium" /> */}
          Change Password
        </h1>
      </div>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        className="w-[50%] mx-auto mt-20"
      >
        <Form.Item
          name="currentPassword"
          label={<p>Current Password</p>}
          rules={[
            { required: true, message: "Please enter your current password!" },
          ]}
        >
          <Input.Password
            placeholder="Enter current password"
            className="h-12"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label={<p>New Password</p>}
          rules={[{ required: true, message: "Please enter a new password!" }]}
        >
          <Input.Password placeholder="Enter new password" className="h-12" />
        </Form.Item>
        {errorMessages.newPassError && (
          <p className="text-red-500">{errorMessages.newPassError}</p>
        )}

        <Form.Item
          name="confirmPassword"
          label={<p>Confirm Password</p>}
          rules={[
            { required: true, message: "Please confirm your new password!" },
          ]}
        >
          <Input.Password placeholder="Confirm new password" className="h-12" />
        </Form.Item>
        {errorMessages.conPassError && (
          <p className="text-red-500">{errorMessages.conPassError}</p>
        )}

        <Form.Item className="text-center">
          <Button
            htmlType="submit"
            className="w-full h-12 bg-[#CA3939] text-white"
          >
            Update password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePassword;
