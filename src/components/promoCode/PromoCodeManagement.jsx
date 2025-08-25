import React, { useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, Switch, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { 
  useCreatePromoCodeMutation, 
  useDeletePromoCodeMutation, 
  useGetPromoCodesQuery, 
  useUpdatePromoCodeMutation, 
  useUpdatePromoCodeStatusMutation 
} from '../../redux/apiSlices/promoCode';
import PromoCodeModal from './PromoCodeModal';

const PromoCodeManagement = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState(null);
  
  // API hooks
  const { data, isLoading, refetch } = useGetPromoCodesQuery([
    { name: 'page', value: currentPage },
    { name: 'limit', value: 10 }
  ]);
  
  const [updateStatus, { isLoading: updateStatusLoading }] = useUpdatePromoCodeStatusMutation();
  const [deletePromoCode, { isLoading: deleteLoading }] = useDeletePromoCodeMutation();

  // Handle create new promo code
  const handleCreateNew = () => {
    setEditingPromoCode(null);
    setIsModalOpen(true);
  };

  // Handle edit promo code
  const handleEdit = (promoCode) => {
    setEditingPromoCode(promoCode);
    setIsModalOpen(true);
  };

  // Handle status toggle
  const handleStatusToggle = async (checked, record) => {
    try {
      const newStatus = checked ? 'running' : 'expired';

      await updateStatus({ id: record._id, status: newStatus }).unwrap();
      message.success('Status updated successfully');
      refetch();
    } catch (error) {
      message.error('Failed to update status');
      console.error('Failed to update status:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deletePromoCode(id).unwrap();
      message.success('Promo code deleted successfully');
      refetch();
    } catch (error) {
      message.error('Failed to delete promo code');
      console.error('Failed to delete promo code:', error);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingPromoCode(null);
    refetch();
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Table columns configuration
  const columns = [
    {
      title: 'SL',
      key: 'serial',
      width: 60,
      render: (_, __, index) => (currentPage - 1) * 10 + index + 1,
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Percentage Off',
      dataIndex: 'percentageOff',
      key: 'percentageOff',
      render: (value) => `${value}%`,
    },
    {
      title: 'Date',
      key: 'date',
      render: (_, record) => (
        <div>
          <div>Start Date: {formatDate(record.startDate)}</div>
          <div>End Date: {formatDate(record.endDate)}</div>
        </div>
      ),
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => (
        <div>
          <div>Start Time: {formatTime(record.startDate)}</div>
          <div>End Time: {formatTime(record.endDate)}</div>
        </div>
      ),
    },
    {
      title: 'Promo Code',
      dataIndex: 'promoCode',
      key: 'promoCode',
      render: (code) => (
        <Tag color="blue" style={{ fontFamily: 'monospace' }}>
          {code}
        </Tag>
      ),
    },
    {
      title: 'User Take',
      dataIndex: 'userTake',
      key: 'userTake',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'running' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Switch
            checked={record.status === 'running'}
            loading={updateStatusLoading}
            onChange={(checked) => handleStatusToggle(checked, record)}
            size="small"
          />
          <Popconfirm
            title="Delete Promo Code"
            description="Are you sure you want to delete this promo code?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              loading={deleteLoading}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const promoCodes = data?.data?.result || [];
  const meta = data?.data?.meta || {};

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Promo Code Management</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateNew}
          size="large"
          style={{backgroundColor: '#057199'}}
        >
          Create New Promo Code
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={promoCodes}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: meta.limit || 10,
          total: meta.total || 0,
          // showSizeChanger: false,
          // showQuickJumper: true,
          // showTotal: (total, range) => 
          //   `${range[0]}-${range[1]} of ${total} items`,
          onChange: (page) => setCurrentPage(page),
        }}
        scroll={{ x: 1200 }}
      />

      {/* Modal */}
      <PromoCodeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        editingPromoCode={editingPromoCode}
      />
    </div>
  );
};

export default PromoCodeManagement;