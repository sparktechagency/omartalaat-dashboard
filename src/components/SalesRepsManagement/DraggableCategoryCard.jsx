import React from 'react';
import { Card, Row, Col, Tag, Button, Space, Switch } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined, DragOutlined, AppstoreOutlined } from '@ant-design/icons';
import moment from 'moment/moment';
import { getImageUrl, getVideoAndThumbnail } from '../common/imageUrl';

const DraggableCategoryCard = ({
  category,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  onViewVideos,
  isDragging,
  dragHandleProps,
  serialNumber,
}) => {
  console.log(category?.thumbnail)
  return (
    <div
      className={`category-card ${isDragging ? "dragging" : ""} py-2`}
      style={{
        marginBottom: 10,
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: isDragging
          ? "0 8px 32px rgba(0,0,0,0.2)"
          : "0 2px 8px rgba(0,0,0,0.1)",
        transform: isDragging ? "rotate(2deg) scale(1.02)" : "none",
        transition: "all 0.3s ease",
        border: isDragging ? "2px solid #1890ff" : "1px solid #f0f0f0",
        opacity: isDragging ? 0.8 : 1,
      }}
      hoverable
    >
      <Row gutter={16} align="middle">
        <Col span={1}>
          <div
            {...dragHandleProps}
            className="drag-handle"
            style={{
              cursor: "grab",
              padding: "4px",
              color: "#666",
              fontSize: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "4px",
            }}
          >
            <DragOutlined />
          </div>
        </Col>

        <Col span={1}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              color: "#1890ff",
              textAlign: "center",
            }}
          >
            #{serialNumber}
          </div>
        </Col>

        <Col span={4}>
          <img
            src={getImageUrl(category.thumbnail)}
            alt={category.name}
            style={{
              width: "80%",
              height: 80,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        </Col>

        <Col span={8}>
          <div>
            <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              {category.name}
            </h4>
            <p style={{ margin: "4px 0", color: "#666", fontSize: "14px" }}>
              Videos: {category.videoCount || 0}
            </p>
            <p style={{ margin: 0, color: "#999", fontSize: "12px" }}>
              Created: {moment(category.createdAt).format("L")}
            </p>
          </div>
        </Col>

        <Col span={3}>
          <Tag color={category.status === "active" ? "success" : "error"}>
            {category.status === "active" ? "Active" : "Inactive"}
          </Tag>
        </Col>

        <Col span={6}>
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEdit(category)}
              style={{ color: "#1890ff" }}
              title="Edit Category"
            />
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onView(category)}
              style={{ color: "#52c41a" }}
              title="View Details"
            />
            <Button
              type="text"
              icon={<AppstoreOutlined />}
              onClick={() => onViewVideos(category)}
              style={{ color: "#722ed1" }}
              title="View Videos"
            />
            <Switch
              size="small"
              checked={category.status === "active"}
              onChange={(checked) => onStatusChange(checked, category)}
            />
            <Button
              type="text"
              icon={<DeleteOutlined />}
              onClick={() => onDelete(category._id)}
              style={{ color: "#ff4d4f" }}
              danger
              title="Delete Category"
            />
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default DraggableCategoryCard; 