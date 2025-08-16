import { Button, ConfigProvider, Form, Input } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import image4 from "../../assets/image4.png";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";

const ResetPassword = () => {

  const email = new URLSearchParams(location.search).get("email")
  const navigate = useNavigate();
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  const onFinish = async(values) => {
        navigate(`/auth/login`);
  };

  return (
    <div>
      <div className="text-center mb-8">
        <img src={image4} alt="logo" className="h-40 w-60 mx-auto" />

        <h1 className="text-[25px] font-semibold mb-6">Reset Password</h1>
      </div>

      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="newPassword"
          label={
            <p
              style={{
                display: "block",
                color: "#5C5C5C",
              }}
              htmlFor="email"
              className="font-semibold "
            >
              New Password
            </p>
          }
          rules={[
            {
              required: true,
              message: "Please input your new Password!",
            },
          ]}
          style={{ marginBottom: 0 }}
        >
          <Input.Password
            type={newPasswordVisible ? "text" : "password"}
            placeholder="Enter New password"
            iconRender={(visible) => 
              visible ? 
                <EyeOutlined onClick={() => setNewPasswordVisible(!newPasswordVisible)} /> : 
                <EyeInvisibleOutlined onClick={() => setNewPasswordVisible(!newPasswordVisible)} />
            }
            style={{
              border: "1px solid #E0E4EC",
              height: "52px",
              background: "white",
              borderRadius: "8px",
              outline: "none",
            }}
            className="mb-6"
          />
        </Form.Item>

        <Form.Item
          style={{ marginBottom: 0 }}
          label={
            <p
              style={{
                display: "block",
                color: "#5C5C5C",
              }}
              htmlFor="email"
              className="font-semibold"
            >
              Confirm Password
            </p>
          }
          name="confirmPassword"
          dependencies={["newPassword"]}
          hasFeedback
          rules={[
            {
              required: true,
              message: "Please confirm your password!",
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new password that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            type={confirmPasswordVisible ? "text" : "password"}
            placeholder="Enter Confirm password"
            iconRender={(visible) => 
              visible ? 
                <EyeOutlined onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} /> : 
                <EyeInvisibleOutlined onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} />
            }
            style={{
              border: "1px solid #E0E4EC",
              height: "52px",
              background: "white",
              borderRadius: "8px",
              outline: "none",
            }}
            className="mb-6"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: "#336C79", // Sets primary color
                colorPrimaryHover: "#336C79", // Sets hover background color
              },
            }}
          >
            <Button
              htmlType="submit"
              style={{
                width: "100%",
                height: 45,
                color: "white",
                fontWeight: "400px",
                fontSize: "18px",
                marginTop: 20,
              }}
              className="bg-gradient-to-r from-primary  to-secondary  hover:bg-gradient-to-r hover:from-primary border border-[#A92C2C] hover:to-secondary"
            >
              Update Password
            </Button>
          </ConfigProvider>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPassword;
