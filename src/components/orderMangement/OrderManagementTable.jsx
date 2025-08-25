import React, { useState } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Select,
  Space,
  Modal,
  message,
  Typography,
  DatePicker,
} from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from '../../redux/apiSlices/orderManagement';
import OrderDetailsModal from './OrderDetailsModal';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { MonthPicker } = DatePicker;

const OrderManagementTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState(null);
  const [monthFilter, setMonthFilter] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Build query args
  const queryArgs = [
    { name: 'page', value: currentPage },
    { name: 'limit', value: 10 },
  ];

  if (statusFilter !== 'All') {
    queryArgs.push({ name: 'status', value: statusFilter.toLowerCase() });
  }

  if (yearFilter) {
    queryArgs.push({ name: 'year', value: yearFilter });
  }

  if (monthFilter) {
    queryArgs.push({ name: 'month', value: monthFilter });
  }

  // Fix: Pass queryArgs to the API call
  const { data: ordersData, isLoading } = useGetAllOrdersQuery(queryArgs);
  const [updateOrderStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();
  console.log(ordersData)

  const orders = ordersData?.data || [];
  const meta = ordersData?.meta || {};

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailsModalOpen(true);
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setIsStatusModalOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateOrderStatus({
        orderId: selectedOrder.id,
        status: newStatus,
      }).unwrap();
      message.success('Order status updated successfully!');
      setIsStatusModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      message.error('Failed to update order status');
      console.error('Failed to update status:', error);
    }
  };

  const handleMonthChange = (date) => {
    if (date) {
      const year = date.year();
      const month = date.month() + 1; // dayjs months are 0-indexed
      setYearFilter(year);
      setMonthFilter(month);
    } else {
      setYearFilter(null);
      setMonthFilter(null);
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusColor = (status) => {
    const colors = {
      processing: 'processing',
      shipping: 'warning',
      delivered: 'success',


    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
      width: 100,
    },
    {
      title: 'Order Number',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 150,
    },
    {
      title: 'User Name',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    // {
    //   title: 'Product SKU',
    //   key: 'sku',
    //   render: (record) => record.products?.[0]?.productId?.sku || 'N/A',
    //   width: 120,
    // },
    {
      title: 'Delivery Location',
      dataIndex: 'shippingAddress',
      key: 'shippingAddress',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Offer',
      dataIndex: 'offer',
      key: 'offer',
      width: 80,
    },
    // {
    //   title: 'Order Item & Qty',
    //   key: 'items',
    //   render: (record) => `${record.products?.length || 0} item(s)`,
    //   width: 120,
    // },
    {
      title: 'Total Price',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount) => `$${amount?.toFixed(2)}`,
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
      width: 100,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetails(record.id)}
          />
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleStatusUpdate(record)}
          />
        </Space>
      ),
      width: 100,
      fixed: 'right',
    },
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Order Management</Title>
        <Space>
          <MonthPicker
            placeholder="Select Month & Year"
            onChange={handleMonthChange}
            style={{ width: 180 }}
            format="YYYY MMMM"
          />
          <Select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ width: 150 }}
          >
            <Option value="All">All Status</Option>
            <Option value="processing">Processing</Option>
            <Option value="shipping">Shipping</Option>
            <Option value="delivered">Delivered</Option>         
          </Select>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={isLoading}
        scroll={{ x: 1200 }}
        pagination={{
          current: currentPage,
          pageSize: 10,

          total: meta.total,
          // showSizeChanger: false,
          // showQuickJumper: true,
          // showTotal: (total, range) =>
          //   `${range[0]}-${range[1]} of ${total} orders`,
          onChange: (page) => setCurrentPage(page),
        }}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
      />

      {/* Status Update Modal */}
      <Modal
        title="Update Order Status"
        open={isStatusModalOpen}
        onCancel={() => {
          setIsStatusModalOpen(false);
          setSelectedOrder(null);
        }}
        footer={null}
        width={400}
      >
        <div style={{ marginBottom: 16 }}>
          <p>Update status for order: <strong>{selectedOrder?.orderId}</strong></p>
        </div>
        <Space direction="vertical" style={{ width: '100%' }}>
          {['processing', 'shipping', 'delivered'].map((status) => (
            <Button
              key={status}
              type={selectedOrder?.status === status ? 'primary' : 'default'}
              block
              loading={isUpdating}
              onClick={() => handleStatusChange(status)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </Space>
      </Modal>
    </Card>
  );
};

export default OrderManagementTable;