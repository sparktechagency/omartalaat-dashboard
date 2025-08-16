import React from "react";
import {
  Modal,
  Form,
  Tag,
  Card,
  Row,
  Col,
  Divider,
  Space,
  Typography,
} from "antd";
import {
  CloseCircleOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  FolderOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { getImageUrl, getVideoAndThumbnail } from "../common/imageUrl";

const { Title, Text, Paragraph } = Typography;

const VideoDetailsModal = ({ visible, onCancel, currentVideo }) => {
  const [form] = Form.useForm();

  const InfoItem = ({ icon, label, children, span = 24 }) => (
    <Col span={span}>
      <Card
        size="small"
        bordered={false}
        style={{
          backgroundColor: "#fafafa",
          marginBottom: 12,
          borderRadius: 8,
        }}
      >
        <Space align="start" style={{ width: "100%" }}>
          <div style={{ color: "#CA3939", fontSize: 16, marginTop: 2 }}>
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <Text strong style={{ color: "#595959", fontSize: 12 }}>
              {label}
            </Text>
            <div style={{ marginTop: 4 }}>{children}</div>
          </div>
        </Space>
      </Card>
    </Col>
  );

  const MediaSection = ({ title, children }) => (
    <Card
      title={title}
      size="small"
      style={{
        marginBottom: 16,
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}
      headStyle={{
        backgroundColor: "#f8f9fa",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {children}
    </Card>
  );

  return (
    <Modal
      title={
        <Space>
          <PlayCircleOutlined style={{ color: "#CA3939" }} />
          <Text strong style={{ fontSize: 18 }}>
            Video Details
          </Text>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
      closeIcon={
        <CloseCircleOutlined style={{ color: "#ff4d4f", fontSize: 18 }} />
      }
      styles={{
        body: {
          padding: "24px",
          maxHeight: "70vh",
          overflowY: "auto",
        },
      }}
    >
      {currentVideo && (
        <div>
          {/* Title Section */}
          <Card
            style={{
              marginBottom: 20,
              background: "linear-gradient(135deg, #CA3939 0%, #DE5555 100%)",
              border: "none",
              borderRadius: 12,
            }}
          >
            <Title
              level={3}
              style={{
                color: "white",
                margin: 0,
                textAlign: "center",
              }}
            >
              {currentVideo?.title}
            </Title>
          </Card>

          {/* Basic Info Grid */}
          <Row gutter={[12, 0]} style={{ marginBottom: 20 }}>
            <InfoItem icon={<FolderOutlined />} label="CATEGORY" span={12}>
              <Tag
                color="#CA3939"
                style={{
                  fontWeight: 500,
                  color: "white",
                  borderColor: "#CA3939",
                }}
              >
                {currentVideo?.category}
              </Tag>
            </InfoItem>

            <InfoItem
              icon={<FolderOutlined />}
              label={currentVideo?.isReady ? "Status" : "SUB CATEGORY"}
              span={12}
            >
              <Tag
                color="#DE5555"
                style={{
                  fontWeight: 500,
                  color: "white",
                  borderColor: "#DE5555",
                }}
              >
                {currentVideo?.isReady || currentVideo?.subCategory}
              </Tag>
            </InfoItem>

            <InfoItem
              icon={<ClockCircleOutlined />}
              label="DURATION"
              span={12}
              style={{
                opacity: 0.5,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              <Text strong style={{ color: "#CA3939" }}>
                {currentVideo?.duration}
              </Text>
            </InfoItem>

            <InfoItem icon={<ToolOutlined />} label="EQUIPMENT" span={12}>
              <Space wrap>
                {currentVideo?.equipment?.map((eq) => (
                  <Tag
                    key={eq}
                    style={{
                      borderRadius: 12,
                      fontWeight: 500,
                      backgroundColor: "#CA3939",
                      color: "white",
                      borderColor: "#CA3939",
                    }}
                  >
                    {eq}
                  </Tag>
                ))}
              </Space>
            </InfoItem>
          </Row>

          {/* Media Grid */}
          <Row gutter={16}>
            {/* Thumbnail */}
            <Col xs={24} md={12}>
              <MediaSection title="📸 Thumbnail">
                <div
                  style={{
                    width: "100%",
                    height: 200,
                    backgroundColor: "#f5f5f5",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden",
                    borderRadius: 8,
                    border: "2px dashed #d9d9d9",
                  }}
                >
                  {currentVideo?.thumbnailUrl ? (
                    <img
                      src={getVideoAndThumbnail(currentVideo?.thumbnailUrl)}
                      alt="thumbnail"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <Text type="secondary">No thumbnail available</Text>
                  )}
                </div>
              </MediaSection>
            </Col>

            {/* Video */}
            <Col xs={24} md={12}>
              <MediaSection title="🎥 Video Preview">
                <div style={{ textAlign: "center" }}>
                  {currentVideo?.videoUrl ? (
                    <video
                      src={getVideoAndThumbnail(currentVideo.videoUrl)}
                      controls
                      preload="metadata"
                      style={{
                        width: "100%",
                        maxWidth: "350px",
                        height: "200px",
                        objectFit: "contain",
                        borderRadius: 8,
                        boxShadow: "0 4px 12px rgba(202, 57, 57, 0.2)",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: 200,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#f5f5f5",
                        borderRadius: 8,
                        border: "2px dashed #d9d9d9",
                      }}
                    >
                      <Text type="secondary">No video available</Text>
                    </div>
                  )}
                </div>
              </MediaSection>
            </Col>
          </Row>

          {/* Description */}
          {currentVideo?.description && (
            <Card
              title="📝 Description"
              size="small"
              style={{
                marginTop: 16,
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
              headStyle={{
                backgroundColor: "#f8f9fa",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <Paragraph
                style={{
                  margin: 0,
                  lineHeight: 1.6,
                  color: "#595959",
                }}
              >
                {currentVideo?.description}
              </Paragraph>
            </Card>
          )}
        </div>
      )}
    </Modal>
  );
};

export default VideoDetailsModal;
