import React, { useEffect, useState } from "react";
import { Table, Button, Tag, Card, Typography, Space, Pagination } from "antd";
import { EyeOutlined, DollarOutlined } from "@ant-design/icons";
import {
  useGetAllTotalEarningQuery,
  useGetSingleTotalEarningQuery,
} from "../../redux/apiSlices/totalEarningApi";
import OrderDetailsModal from "./OrderDetailsModal";

const { Title, Text } = Typography;

const TotalEarning = () => {
 
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [queryParams, setQueryParams] = useState([]);

  useEffect(() => {
    const params = [];

    params.push({ name: "limit", value: pageSize });
    params.push({ name: "page", value: currentPage });

    if (searchText) {
      params.push({ name: "searchTerm", value: searchText });
    }

    setQueryParams(params);
  }, [pageSize, currentPage, searchText]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };



  const { data: singleTotalEarning } =
    useGetSingleTotalEarningQuery();
     const { data, isLoading } = useGetAllTotalEarningQuery(queryParams);
     const allTotalEarning = data?.data;
     const pagination = data?.meta;
     console.log(allTotalEarning);
  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "processing";
      case "completed":
        return "success";
      case "cancelled":
        return "error";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Order Number",
      dataIndex: "orderId",
      key: "orderId",
      render: (orderId) => <Text strong>{orderId}</Text>,
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      render: (userName) => userName || "N/A",
    },

    {
      title: "Delivery Location",
      dataIndex: "shippingAddress",
      key: "deliveryLocation",
      ellipsis: true,
    },
    {
      title: "Offer",
      dataIndex: "offer",
      key: "offer",
      render: (offer) =>
        offer === "No" ? <Tag>No</Tag> : <Tag color="green">{offer}</Tag>,
    },
    ,
    {
      title: "Total Price",
      dataIndex: "finalAmount",
      key: "totalPrice",
      render: (amount) => (
        <Text strong style={{ color: "#1890ff" }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.finalAmount - b.finalAmount,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Tag>
      ),
      filters: [
        { text: "Processing", value: "processing" },
        { text: "Completed", value: "completed" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <div style={{ marginBottom: "24px" }}>
          <Title
            level={2}
            style={{ margin: 0, display: "flex", alignItems: "center" }}
          >
            <DollarOutlined style={{ marginRight: "8px" }} />
            Total Earnings
          </Title>
          <Text type="secondary">Manage and view all order earnings</Text>
        </div>

        <Table
          columns={columns}
          dataSource={allTotalEarning}
          rowKey={(record) => record._id || record.id}
          loading={isLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: pagination?.total || 0,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
            },
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        orderData={selectedOrder}
      />
    </div>
  );
};

export default TotalEarning;
