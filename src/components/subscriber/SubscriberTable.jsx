import React, { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import {
  Button,
  Input,
  Form,
  message,
  DatePicker,
  TimePicker,
  Switch,
  Space,
  Card,
  Table,
  Modal,
  Tag,
  Tooltip,
  Menu,
  Dropdown,
} from "antd";
import {
  ClockCircleOutlined,
  SendOutlined,
  PlusOutlined,
  EyeOutlined,
  DownOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import "./PushNotification.css";
import {
  useGetSendPushNotificationQuery,
  usePushNotificationSendMutation,
} from "../../redux/apiSlices/pushNotification";
import { Filtering } from "../common/Svg";
import Spinner from "../common/Spinner.jsx";

const PushNotification = () => {
  const editor = useRef(null);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notificationTypeFilter, setNotificationTypeFilter] = useState("All");
  const [messageContent, setMessageContent] = useState("");

  const [pushNotificationSend, { isLoading }] =
    usePushNotificationSendMutation();

  // Query params for filtering and pagination
  const [queryParams, setQueryParams] = useState([]);
  const {
    data,
    isLoading: isTableLoading,
    refetch,
  } = useGetSendPushNotificationQuery(queryParams);

  const notificationData = data?.data || [];

  // Update query params when filters change
  useEffect(() => {
    const params = [];

    if (statusFilter !== "All") {
      params.push({ name: "status", value: statusFilter });
    }

    setQueryParams(params);
  }, [statusFilter]);

  // Function to strip HTML tags from message
  const stripHtmlTags = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Function to truncate text
  const truncateText = (text, maxLength = 100) => {
    if (!text) return "";
    const cleanText = stripHtmlTags(text);
    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + "..."
      : cleanText;
  };

  // Jodit editor configuration
  const config = {
    readonly: false,
    height: 300,
    buttons: [
      "source",
      "|",
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "paragraph",
      "|",
      "image",
      "table",
      "link",
      "|",
      "left",
      "center",
      "right",
      "justify",
      "|",
      "undo",
      "redo",
      "|",
      "hr",
      "eraser",
      "fullsize",
    ],
    buttonsMD: [
      "bold",
      "italic",
      "underline",
      "|",
      "ul",
      "ol",
      "|",
      "image",
      "table",
      "link",
      "|",
      "left",
      "center",
      "right",
    ],
    buttonsSM: ["bold", "italic", "|", "ul", "ol", "|", "image", "link"],
    buttonsXS: ["bold", "image", "|", "ul", "ol"],
    uploader: {
      insertImageAsBase64URI: true,
    },
    toolbarAdaptive: true,
  };

  // Table columns configuration
  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      width: "400px",
      render: (text) => (
        <Tooltip title={stripHtmlTags(text)} placement="topLeft">
          <span className="font-medium">{truncateText(text, 80)}</span>
        </Tooltip>
      ),
    },
    {
      title: "Notification Type",
      dataIndex: "notificationType",
      key: "notificationType",
      align: "center",
      render: (type) => (
        <Tag
          color={type === "schedule" ? "orange" : "green"}
          icon={
            type === "schedule" ? <ClockCircleOutlined /> : <SendOutlined />
          }
        >
          {type === "schedule" ? "Scheduled" : "Instant"}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => {
        const color =
          status === "PENDING" ? "orange" : status === "SEND" ? "green" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Send At",
      dataIndex: "sendAt",
      key: "sendAt",
      render: (sendAt) => {
        if (!sendAt) return "-";
        return dayjs(sendAt).format("MMM D, YYYY h:mm A");
      },
    },
  ];

  const handleSubmit = async (values) => {
    let scheduledDateTime = null;

    // If scheduling is enabled, combine date and time
    if (isScheduled && values.scheduleDate && values.scheduleTime) {
      const date = dayjs(values.scheduleDate);
      const time = dayjs(values.scheduleTime);

      scheduledDateTime = date
        .hour(time.hour())
        .minute(time.minute())
        .second(0)
        .millisecond(0);

      // Check if scheduled time is in the future
      if (scheduledDateTime.isBefore(dayjs())) {
        message.error("Scheduled time must be in the future!");
        return;
      }
    }

    const notificationPayload = {
      title: values.title,
      message: messageContent, // local state থেকে নিবে
      isScheduled: isScheduled,
      sendAt: scheduledDateTime ? scheduledDateTime.toISOString() : null,
    };

    try {
      const result = await pushNotificationSend(notificationPayload).unwrap();

      if (isScheduled) {
        message.success(
          `Notification scheduled successfully for ${scheduledDateTime.format(
            "MMMM D, YYYY at h:mm A"
          )}!`
        );
      } else {
        message.success("Notification send successfully!");
      }

      form.resetFields();
      setIsScheduled(false);
      setIsModalOpen(false);
      refetch(); // Refresh the table data

      if (editor.current) {
        editor.current.value = "";
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      message.error(
        isScheduled
          ? "Failed to schedule notification. Please try again."
          : "Failed to send notification. Please try again."
      );
    }
  };

  const handleScheduleToggle = (checked) => {
    setIsScheduled(checked);
    if (!checked) {
      // Clear schedule fields when disabled
      form.setFieldsValue({
        scheduleDate: null,
        scheduleTime: null,
      });
    }
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsScheduled(false);
    setIsModalOpen(false);
    if (editor.current) {
      editor.current.value = "";
    }
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      await handleSubmit(values);
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  // Disable past dates
  const disabledDate = (current) => {
    return current && current < dayjs().startOf("day");
  };

  // Disable past times for today
  const disabledTime = (current) => {
    if (!current) return {};

    const now = dayjs();
    const selectedDate = dayjs(current);

    if (selectedDate.isSame(now, "day")) {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < now.hour(); i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour) => {
          if (selectedHour === now.hour()) {
            const minutes = [];
            for (let i = 0; i <= now.minute(); i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        },
      };
    }
    return {};
  };

  // Fixed pagination handler to avoid read-only property error
  const handlePaginationChange = (page) => {
    // Create a new array instead of modifying the existing one
    const newParams = queryParams.filter((param) => param.name !== "page");
    newParams.push({ name: "page", value: page });
    setQueryParams(newParams);
  };

  // Filter menus
  const statusMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => setStatusFilter("All")}>
        All Status
      </Menu.Item>
      <Menu.Item key="PENDING" onClick={() => setStatusFilter("PENDING")}>
        Pending
      </Menu.Item>
      <Menu.Item key="SEND" onClick={() => setStatusFilter("SEND")}>
        Send
      </Menu.Item>
    </Menu>
  );

  if (isTableLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-bold text-2xl mb-0">Push Notifications</h1>
      </div>

      {/* Search and Filter Section */}
      <div className="flex justify-end mb-6 items-center">
        <div className="flex gap-4">
          <Space size="small" className="flex gap-4">
            <Dropdown overlay={statusMenu}>
              <Button
                className="mr-2 bg-red-600 py-5 text-white hover:text-black hover:icon-black"
                style={{ border: "none" }}
              >
                <Space>
                  <Filtering className="filtering-icon" />
                  <span className="filter-text">
                    {statusFilter === "All" ? "All Status" : statusFilter}
                  </span>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              className="bg-primary"
              size="large"
            >
              Send Push Notification
            </Button>
          </Space>
        </div>
      </div>

      {/* Notifications Table */}
      <div className="border-2 rounded-lg">
        <Table
          columns={columns}
          dataSource={notificationData}
          loading={isTableLoading}
          rowKey="_id"
          pagination={{
            defaultPageSize: 10,
            total: data?.pagination?.total,
            current: data?.pagination?.currentPage,
            onChange: handlePaginationChange, // Using the fixed handler
          }}
          size="middle"
          className="custom-table"
          scroll={{ x: "max-content" }} // Add horizontal scroll for better mobile experience
        />
      </div>

      {/* Send Push Notification Modal */}
      <Modal
        title="Send Push Notification"
        open={isModalOpen}
        onCancel={handleModalCancel}
        width={800}
        footer={[
          <Button key="cancel" onClick={handleModalCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={isLoading}
            onClick={handleModalSubmit}
            className="bg-primary"
            icon={isScheduled ? <ClockCircleOutlined /> : <SendOutlined />}
          >
            {isScheduled ? "Schedule Notification" : "Send Now"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[
              { required: true, message: "Please enter a notification title" },
            ]}
          >
            <Input placeholder="Write Your Title Here" size="large" />
          </Form.Item>
          <Form.Item
            label="Message"
            required
            rules={[
              { required: true, message: "Please add notification content" },
            ]}
          >
            <JoditEditor
              ref={editor}
              config={config}
              onBlur={(newContent) => setMessageContent(newContent)} 
            />
          </Form.Item>

          {/* Scheduling Section */}
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                Schedule Notification
              </Space>
            }
            className="mb-4"
            size="small"
          >
            <Form.Item
              label="Enable Scheduling"
              name="enableSchedule"
              valuePropName="checked"
              className="mb-3"
            >
              <Switch
                checked={isScheduled}
                onChange={handleScheduleToggle}
                checkedChildren="Scheduled"
                unCheckedChildren="Send Now"
              />
            </Form.Item>

            {isScheduled && (
              <>
                <Space size="middle" className="w-full" wrap>
                  <Form.Item
                    label="Schedule Date"
                    name="scheduleDate"
                    rules={[
                      {
                        required: isScheduled,
                        message: "Please select a date",
                      },
                    ]}
                  >
                    <DatePicker
                      placeholder="Select Date"
                      disabledDate={disabledDate}
                      format="MMMM D, YYYY"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Schedule Time"
                    name="scheduleTime"
                    rules={[
                      {
                        required: isScheduled,
                        message: "Please select a time",
                      },
                    ]}
                  >
                    <TimePicker
                      placeholder="Select Time"
                      format="h:mm A"
                      use12Hours
                      size="large"
                      disabledTime={() => {
                        const scheduleDate = form.getFieldValue("scheduleDate");
                        return disabledTime(scheduleDate);
                      }}
                    />
                  </Form.Item>
                </Space>

                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-0">
                    <ClockCircleOutlined className="mr-2" />
                    This notification will be scheduled for delivery at the
                    specified time.
                  </p>
                </div>
              </>
            )}
          </Card>
        </Form>
      </Modal>
    </div>
  );
};

export default PushNotification;
