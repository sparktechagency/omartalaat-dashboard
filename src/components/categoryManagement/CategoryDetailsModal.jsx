import React from "react";
import { Modal, Descriptions, Image, Tag } from "antd";
import { getImageUrl } from "../common/imageUrl";
import moment from "moment";

const CategoryDetailsModal = ({ visible, onCancel, category }) => {
  if (!category) return null;

  return (
    <Modal
      title="Category Details"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div className="space-y-4">
        {/* Category Image */}
        <div className="text-center">
          <Image
            src={getImageUrl(category.image)}
            alt={category.name}
            className="rounded-lg"
            style={{ maxHeight: "300px", objectFit: "contain" }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        </div>

        {/* Category Information */}
        <Descriptions bordered column={1}>
          <Descriptions.Item label="Category Name">
            <strong>{category.name}</strong>
          </Descriptions.Item>
          
          <Descriptions.Item label="Description">
            {category.description || "No description available"}
          </Descriptions.Item>
          
          <Descriptions.Item label="Video Count">
            <Tag color="blue">{category.videoCount} Videos</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Status">
            <Tag color={category.status.toLowerCase() === "active" ? "green" : "red"}>
              {category.status}
            </Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Created Date">
            {moment(category.createdAt).format("MMMM Do YYYY, h:mm:ss a")}
          </Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default CategoryDetailsModal;