import React from "react";
import { Table, Button, Space, Switch, Tag } from "antd";
import {
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment/moment";
import { getImageUrl } from "../common/imageUrl";

const CategoryTable = ({
  categories,
  onEdit,
  onView,
  onStatusChange,
  onDelete,
}) => {
  console.log(categories)
  const columns = [
    {
      title: "SL",
      key: "id",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (image) => (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <img
            src={getImageUrl(image)}
            alt="category image"
            className="object-cover rounded-xl"
            style={{ width: 100, height: 50 }}
          />
        </div>
      ),
    },
    {
      title: "Products",
      dataIndex: "count",
      key: "count",
      align: "center",
      render: (count) => count || 0,
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (createdAt) => moment(createdAt).format("L"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <Tag color={status.toLowerCase() === "active" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => onEdit(record)}
            className="text-blue-500"
            title="Edit Category"
          />
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            className="text-green-500"
            title="View Details"
          />
          <Switch
            checked={record.status.toLowerCase() === "active"}
            size="small"
            onChange={(checked) => onStatusChange(checked, record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined />}
            className="text-red-500"
            title="Delete Category"
            onClick={() => onDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={categories}
      rowKey="_id"
      pagination={{ pageSize: 10 }}
      bordered
      size="small"
      className="custom-table"
    />
  );
};

export default CategoryTable;
