import React, { useState, useEffect } from "react";
import { Form, Input, Button, Upload, message } from "antd";
import { useProfileQuery, useUpdateProfileMutation } from "../../../redux/apiSlices/authSlice";
import { getImageUrl } from "../../../components/common/imageUrl";
import Spinner from "../../../components/common/Spinner";

const DEFAULT_IMAGE_URL = "https://i.ibb.co/PGZ7TG64/blue-circle-with-white-user-78370-4707.jpg";

const UserProfile = () => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE_URL);
  const [fileList, setFileList] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const { data, isLoading } = useProfileQuery();
  const [updateProfile] = useUpdateProfileMutation();

  const user = data?.data;

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        address: user.address,
        phone: user.phone || "",
      });

      if (user.image) {
        setImageUrl(user.image);
        setFileList([
          {
            uid: "-1",
            name: "profile.jpg",
            status: "done",
            url: user.image,
          },
        ]);
      } else {
        setImageUrl(DEFAULT_IMAGE_URL);
        setFileList([
          {
            uid: "-1",
            name: "default.jpg",
            status: "done",
            url: DEFAULT_IMAGE_URL,
          },
        ]);
      }
    }
  }, [form, user]);

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleImageChange = (info) => {
    const limitedFileList = info.fileList.slice(-1);
    setFileList(limitedFileList);

    if (limitedFileList.length > 0 && limitedFileList[0].originFileObj) {
      setImageFile(limitedFileList[0].originFileObj);
      const newImageUrl = URL.createObjectURL(limitedFileList[0].originFileObj);
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
      setImageUrl(newImageUrl);
    } else {
      setImageFile(null);
      setImageUrl(user?.image || DEFAULT_IMAGE_URL);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("Please upload an image file.");
      return Upload.LIST_IGNORE;
    }

    const isLessThan2MB = file.size / 1024 / 1024 < 2;
    if (!isLessThan2MB) {
      message.error("Image must be smaller than 2MB.");
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  const onFinish = async (values) => {
    try {
      const userData = {
        name: values.name,
        email: values.email,
        address: values.address,
        phone: values.phone || "",
      };

      const formDataToSend = new FormData();
      formDataToSend.append("data", JSON.stringify(userData));

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      } else if (imageUrl === DEFAULT_IMAGE_URL) {
        formDataToSend.append("imageUrl", DEFAULT_IMAGE_URL);
      }

      const response = await updateProfile(formDataToSend).unwrap();

      if (response.success) {
        message.success("Profile updated successfully!");
        if (response.token) {
          localStorage.setItem("accessToken", response.token);
        }
      } else {
        message.error(response.message || "Failed to update profile!");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      message.error(error.data?.message || "An error occurred while updating the profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center rounded-lg shadow-xl">
      <Form form={form} layout="vertical" style={{ width: "80%" }} onFinish={onFinish}>
        <div className="grid w-full grid-cols-1 lg:grid-cols-2 lg:gap-x-16 gap-y-7">
          {/* Profile Image */}
          <div className="flex justify-center col-span-2">
            <Form.Item label="Profile Image" style={{ marginBottom: 0 }}>
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleImageChange}
                fileList={fileList}
                accept="image/*"
              >
                <div style={{ cursor: "pointer" }}>
                  <img
                    src={
                      imageUrl.startsWith("blob:")
                        ? imageUrl
                        : getImageUrl(imageUrl) || DEFAULT_IMAGE_URL
                    }
                    alt="Profile"
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "2px solid #d9d9d9",
                    }}
                  />
                </div>
              </Upload>
            </Form.Item>
          </div>

          {/* Name */}
          <Form.Item
            name="name"
            label="Name"
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              placeholder="Enter your Name"
              style={{
                height: "45px",
                backgroundColor: "#f7f7f7",
                borderRadius: "8px",
                outline: "none",
              }}
            />
          </Form.Item>

          {/* Email (Disabled) */}
          <Form.Item
            name="email"
            label="Email"
            style={{ marginBottom: 0 }}
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input
              placeholder="Enter your Email"
              style={{
                height: "45px",
                backgroundColor: "#f7f7f7",
                borderRadius: "8px",
                border: "1px solid #E0E4EC",
                outline: "none",
              }}
              disabled
            />
          </Form.Item>

          {/* Address */}
          <Form.Item
            name="address"
            label="Address"
            style={{ marginBottom: 0 }}
            rules={[{ required: true, message: "Please enter your address" }]}
          >
            <Input
              placeholder="Enter your Address"
              style={{
                height: "45px",
                backgroundColor: "#f7f7f7",
                borderRadius: "8px",
                outline: "none",
              }}
            />
          </Form.Item>

          {/* Phone */}
          <Form.Item name="phone" label="Phone" style={{ marginBottom: 0 }}>
            <Input
              placeholder="Enter your Phone Number"
              style={{
                height: "45px",
                backgroundColor: "#f7f7f7",
                borderRadius: "8px",
                outline: "none",
              }}
            />
          </Form.Item>

          {/* Update Profile Button */}
          <div className="col-span-2 mt-6 text-end">
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ height: 48 }}
                className="text-white rounded-md bg-primary hover:bg-primary"
              >
                Update Profile
              </Button>
            </Form.Item>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default UserProfile;
