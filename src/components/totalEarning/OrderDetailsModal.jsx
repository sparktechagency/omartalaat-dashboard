import React from "react";
import { Modal, Descriptions, Table, Tag, Divider, Row, Col, Card } from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  CreditCardOutlined,
  TruckOutlined,
} from "@ant-design/icons";

const OrderDetailsModal = ({ isOpen, onClose, orderData }) => {
  if (!orderData) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2)}`;
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

  const productColumns = [
    {
      title: "Product Name",
      dataIndex: ["productId", "name"],
      key: "name",
      width: 200,
    },
    {
      title: "SKU",
      dataIndex: ["productId", "sku"],
      key: "sku",
      width: 120,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      width: 100,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      align: "right",
      width: 100,
      render: (price) => formatCurrency(price),
    },
    {
      title: "Credit Earn",
      dataIndex: "creditEarn",
      key: "creditEarn",
      align: "center",
      width: 100,
    },
    {
      title: "CS Aura Earn",
      dataIndex: "csAuraEarn",
      key: "csAuraEarn",
      align: "center",
      width: 120,
    },
    {
      title: "Total",
      key: "total",
      align: "right",
      width: 100,
      render: (_, record) => formatCurrency(record.price * record.quantity),
    },
  ];

  return (
    <Modal
      title={
        <span>
          <ShoppingCartOutlined /> Order Details - {orderData.orderId}
        </span>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {/* Order Information */}
        <Card
          title={
            <span>
              <TruckOutlined /> Order Information
            </span>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Order ID">
                  {orderData.orderId}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getStatusColor(orderData.status)}>
                    {orderData.status.charAt(0).toUpperCase() +
                      orderData.status.slice(1)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Order Date">
                  {formatDate(orderData.createdAt)}
                </Descriptions.Item>
                <Descriptions.Item label="Delivery Date">
                  {formatDate(orderData.deliveryDate)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Delivery Type">
                  {orderData.deliveryType}
                </Descriptions.Item>
                <Descriptions.Item label="Offer">
                  {orderData.offer}
                </Descriptions.Item>
                <Descriptions.Item label="Payment ID">
                  {orderData.paymentId}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {formatDate(orderData.updatedAt)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Customer Information */}
        <Card
          title={
            <span>
              <UserOutlined /> Customer Information
            </span>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Email">
              {orderData.email}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {orderData.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Shipping Address">
              {orderData.shippingAddress.length > 100
                ? `${orderData.shippingAddress.slice(0, 100)}...`
                : orderData.shippingAddress}
            </Descriptions.Item>

            <Descriptions.Item label="Comments" span={2}>
              {orderData.comments}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Products */}
        <Card
          title={
            <span>
              <ShoppingCartOutlined /> Products
            </span>
          }
          size="small"
          style={{ marginBottom: 16 }}
        >
          <Table
            columns={productColumns}
            dataSource={orderData.products}
            rowKey={(record) => record._id || record.id}
            pagination={false}
            size="small"
            scroll={{ x: 800 }}
          />
        </Card>

        {/* Payment Summary */}
        <Card
          title={
            <span>
              <CreditCardOutlined /> Payment Summary
            </span>
          }
          size="small"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Descriptions column={1} size="small">
                
                <Descriptions.Item label="Delivery Fee">
                  {formatCurrency(orderData.deliveryFee)}
                </Descriptions.Item>
                <Descriptions.Item label="Discount">
                  -{formatCurrency(orderData.discount)}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Subtotal">
                  {formatCurrency(orderData.totalAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Final Amount">
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: "#1890ff",
                    }}
                  >
                    {formatCurrency(orderData.finalAmount)}
                  </span>
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
