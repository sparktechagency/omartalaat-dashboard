import React, { useState } from 'react';
import { Table, Button, Tag, Card, Typography, Space, Pagination } from 'antd';
import { EyeOutlined, DollarOutlined } from '@ant-design/icons';
import { useGetAllTotalEarningQuery, useGetSingleTotalEarningQuery } from '../../redux/apiSlices/totalEarningApi';
import OrderDetailsModal from './OrderDetailsModal';

const { Title, Text } = Typography;

const TotalEarning = () => {
    const { data, isLoading } = useGetAllTotalEarningQuery();
    const allTotalEarning = data?.data;
    const pagination = data?.meta;
    
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    console.log(allTotalEarning);

    const { data: singleTotalEarning } = useGetSingleTotalEarningQuery();
    
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
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'processing': return 'processing';
            case 'completed': return 'success';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'Date',
            dataIndex: 'createdAt',
            key: 'date',
            render: (date) => formatDate(date),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Order Number',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (orderId) => <Text strong>{orderId}</Text>,
        },
        {
            title: 'User Name',
            dataIndex: 'userName',
            key: 'userName',
            render: (userName) => userName  || 'N/A',

        },
        // {
        //     title: 'Product SKU',
        //     key: 'productSku',
        //     render: (_, record) => (
        //         <Space direction="vertical" size="small">
        //             {record.products?.slice(0, 2).map((product, index) => (
        //                 <Text key={index} type="secondary">{product.productId.sku}</Text>
        //             ))}
        //             {record.products?.length > 2 && (
        //                 <Text type="secondary">+{record.products.length - 2} more</Text>
        //             )}
        //         </Space>
        //     ),
        // },
        {
            title: 'Delivery Location',
            dataIndex: 'shippingAddress',
            key: 'deliveryLocation',
            ellipsis: true,
        },
        {
            title: 'Offer',
            dataIndex: 'offer',
            key: 'offer',
            render: (offer) => offer === 'No' ? <Tag>No</Tag> : <Tag color="green">{offer}</Tag>,
        },
        // {
        //     title: 'Order Item & Qty',
        //     key: 'orderItemQty',
        //     render: (_, record) => (
        //         <Space direction="vertical" size="small">
        //             {record.products?.slice(0, 2).map((product, index) => (
        //                 <Text key={index} type="secondary">
        //                     {product.productId.name.substring(0, 20)}... x{product.quantity}
        //                 </Text>
        //             ))}
        //             {record.products?.length > 2 && (
        //                 <Text type="secondary">+{record.products.length - 2} more items</Text>
        //             )}
        //         </Space>
        //     ),
        // },
        {
            title: 'Total Price',
            dataIndex: 'finalAmount',
            key: 'totalPrice',
            render: (amount) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(amount)}
                </Text>
            ),
            sorter: (a, b) => a.finalAmount - b.finalAmount,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Tag>
            ),
            filters: [
                { text: 'Processing', value: 'processing' },
                { text: 'Completed', value: 'completed' },
                { text: 'Cancelled', value: 'cancelled' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Action',
            key: 'action',
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
        <div style={{ padding: '24px' }}>
            <Card>
                <div style={{ marginBottom: '24px' }}>
                    <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                        <DollarOutlined style={{ marginRight: '8px' }} />
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
                        current: pagination?.page || 1,
                        pageSize: pagination?.limit || 10,
                        total: pagination?.total || 0,
                       
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