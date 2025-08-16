import { Form, Input } from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormItem from "../../components/common/FormItem";
import image4 from "../../assets/image4.png";
import { MdKeyboardBackspace } from "react-icons/md";
import { useForgotPasswordMutation } from "../../redux/apiSlices/authSlice";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [forgotPassword, { isLoading, isError, error }] =
    useForgotPasswordMutation();
  const [verificationStatus, setVerificationStatus] = useState("");

  const onFinish = async (values) => {
    try {
      const response = await forgotPassword({ email: values.email }).unwrap();
      console.log(response);
      if (response.success) {
        navigate(
          "/auth/verify-otp?email=" +
            encodeURIComponent(values.email) +
            "&type=forgot-password"
        );
      } else {
        setVerificationStatus("Failed to send OTP. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setVerificationStatus("Failed to send OTP. Please try again.");
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <img src={image4} alt="logo" className="h-40 w-60 mx-auto" />
        <h1 className="text-[25px] font-semibold mb-6">Forgot Password</h1>
        <p>Please enter your email to receive a password reset link</p>
      </div>
      <Form onFinish={onFinish} layout="vertical">
        <FormItem name={"email"} label={"Email"} />

        {verificationStatus && (
          <div className="text-center text-red-500 mb-4">
            {verificationStatus}
          </div>
        )}

        <Form.Item style={{ marginBottom: 0 }}>
          <button
            htmlType="submit"
            type="submit"
            style={{
              width: "100%",
              height: 45,
              color: "white",
              fontWeight: "400px",
              fontSize: "18px",
              marginTop: 20,
            }}
            className="flex items-center justify-center bg-gradient-to-r border border-[#A92C2C] from-primary to-secondary rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? "Sending OTP..." : "Send OTP"}
          </button>
          <div className="flex items-center justify-center mt-4">
            <a
              className="login-form-back flex items-center justify-center gap-3 text-white"
              href="/auth/login"
            >
              <MdKeyboardBackspace className="W-10" size={28} />
              Back to login
            </a>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;
