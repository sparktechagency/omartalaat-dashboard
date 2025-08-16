import React from "react";
import { Modal, Descriptions, Table, Tag, Spin, Typography } from "antd";
import { useGetOrderDetailsQuery } from "../../redux/apiSlices/orderManagement";

const { Title } = Typography;

const OrderDetailsModal = ({ isOpen, onClose, orderId }) => {
  const { data: orderDetails, isLoading } = useGetOrderDetailsQuery(orderId, {
    skip: !orderId,
  });

  const order = orderDetails?.data;

  const getStatusColor = (status) => {
    const colors = {
      processing: "processing",
      shipping: "warning",
      delivered: "success",
      pending: "default",
      cancelled: "error",
    };
    return colors[status] || "default";
  };

  const productColumns = [
    {
      title: "Product Name",
      dataIndex: ["productId", "name"],
      key: "name",
    },
    // {
    //   title: "SKU",
    //   dataIndex: ["productId", "sku"],
    //   key: "sku",
    // },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => `$${price}`,
    },
    {
      title: "Credit Earn",
      dataIndex: "creditEarn",
      key: "creditEarn",
    },
    {
      title: "CS Aura Earn",
      dataIndex: "csAuraEarn",
      key: "csAuraEarn",
    },
  ];

  return (
    <Modal
      title={<Title level={3}>Order Details</Title>}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
        </div>
      ) : order ? (
        <div>
          {/* Order Information */}
          <Descriptions
            title="Order Information"
            bordered
            column={2}
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Order ID">
              {order.orderId}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(order.status)}>
                {order.status?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Email">{order.email}</Descriptions.Item>
           
             <Descriptions.Item label="Delivery Type">
              {order.deliveryType}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">{order.phone}</Descriptions.Item>
            <Descriptions.Item label="Total Amount">
              ${order.totalAmount?.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Order Date">
              {new Date(order.createdAt).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Fee">
              ${order.deliveryFee}
            </Descriptions.Item>
            <Descriptions.Item label="Delivery Date">
              {new Date(order.deliveryDate).toLocaleDateString()}
            </Descriptions.Item>
            <Descriptions.Item label="Discount  ">
              ${order.discount}
            </Descriptions.Item>
            <Descriptions.Item label="Shipping Address">
              {order.shippingAddress.length > 100
                ? `${order?.shippingAddress.slice(0, 100)}...`
                : order.shippingAddress}
            </Descriptions.Item>

            <Descriptions.Item label="Final Amount" style={{ color: "#057199" , fontSize: "18px" , fontWeight: "bold"}}>



              ${order.finalAmount?.toFixed(2)}
            </Descriptions.Item>
          </Descriptions>

          {/* Products Table */}
          <Title level={4} style={{ marginTop: 24, marginBottom: 16 }}>
            Products
          </Title>
          <Table
            columns={productColumns}
            dataSource={order.products}
            rowKey="id"
            pagination={false}
            size="small"
          />

          {/* Comments */}
          {order.comments && (
            <Descriptions title="Comments" bordered style={{ marginTop: 24 }}>
              <Descriptions.Item span={3}>{order.comments}</Descriptions.Item>
            </Descriptions>
          )}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "50px" }}>
          Order details not found
        </div>
      )}
    </Modal>
  );
};

export default OrderDetailsModal;
