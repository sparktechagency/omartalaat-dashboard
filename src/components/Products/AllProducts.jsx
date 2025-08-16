import React, { useState } from 'react';
import { Table, Button, Space, Pagination, message, Popconfirm, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useDeleteProductMutation, useGetAllProductsQuery, useUpdateProductStatusMutation } from '../../redux/apiSlices/productsApi';
import ProductModal from './ProductModal';
import ProductDetailsModal from './ProductDetailsModal';

const AllProducts = () => {
  // State management
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParams, setSearchParams] = useState([]);

  // RTK Query hooks
  const { data, isLoading, refetch } = useGetAllProductsQuery(searchParams);
  const products = data?.data || [];
  const meta = data?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 };
  
  const [updateProductStatus, { isLoading: updateStatusLoading }] = useUpdateProductStatusMutation();
  const [deleteProduct, { isLoading: deleteLoading }] = useDeleteProductMutation();

  // Handle pagination change
  const handlePageChange = (page, pageSize) => {
    setCurrentPage(page);
    setPageSize(pageSize);
    setSearchParams([
      { name: 'page', value: page },
      { name: 'limit', value: pageSize }
    ]);
  };

  // Handle modal visibility
  const showModal = (product = null) => {
    setEditingProduct(product);
    setIsModalVisible(true);
  };

  const showViewModal = (product) => {
    setViewingProduct(product);
    setIsViewModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setIsViewModalVisible(false);
    setEditingProduct(null);
    setViewingProduct(null);
  };

  // Handle status toggle
  const handleStatusToggle = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateProductStatus({ id, status: newStatus }).unwrap();
      message.success(`Product status changed to ${newStatus}`);
      refetch();
    } catch (error) {
      console.error('Error toggling status:', error);
      message.error('Failed to update status');
    }
  };

  // Handle product deletion
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id).unwrap();
      message.success('Product deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting product:', error);
      message.error('Failed to delete product');
    }
  };

  // Handle successful product save
  const handleProductSaved = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
    refetch();
  };

  // Table columns
  const columns = [
    {
      title: '#',
      dataIndex: 'index',
      key: 'index',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Product Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Product SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'Product Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price}`,
    },
    {
      title: 'Product Available',
      dataIndex: 'stock',
      key: 'isStock'
    },
    {
      title: 'Product Categories',
      dataIndex: 'categories',
      key: 'categories',
    },
    {
      title: 'Free Shipping Price',
      dataIndex: 'highestPriceForFreeShipping',
      key: 'highestPriceForFreeShipping',
      render: (price) => `$${price}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => showViewModal(record)}
          />
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="primary" 
              danger 
              icon={<DeleteOutlined />} 
              size="small"
              loading={deleteLoading}
            />
          </Popconfirm>
          <Switch
            checked={record.status === 'active'}
            onChange={() => handleStatusToggle(record._id, record.status)}
            loading={updateStatusLoading}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add New Product
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={products.map(product => ({ ...product, key: product._id }))}
        loading={isLoading}
        pagination={false}
        bordered
        scroll={{ x: 1300 }}
      />
      
      <div className="mt-4 flex justify-end">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={meta.total}
          onChange={handlePageChange}
          showSizeChanger
          showTotal={(total) => `Total ${total} items`}
        />
      </div>

      {/* Add/Edit Product Modal */}
      <ProductModal
        visible={isModalVisible}
        editingProduct={editingProduct}
        onCancel={handleCancel}
        onSuccess={handleProductSaved}
      />

      {/* View Product Modal */}
      <ProductDetailsModal
        visible={isViewModalVisible}
        product={viewingProduct}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AllProducts;