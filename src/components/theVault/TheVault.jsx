import React, { useState } from 'react'
import { Card, Row, Col, Button, Modal, Form, Input, Popconfirm, message, Typography, Space, Spin } from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import { useGetTheVaultQuery, useCreateTheVaultMutation, useDeleteTheVaultMutation } from '../../redux/apiSlices/theVaultApi'
import moment from 'moment'

const { Title, Text } = Typography;

const TheVault = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // RTK Query hooks
  const { data: vaultData, isLoading, refetch } = useGetTheVaultQuery();
  const [createTheVault, { isLoading: isCreating }] = useCreateTheVaultMutation();
  const [deleteTheVault, { isLoading: isDeleting }] = useDeleteTheVaultMutation();
  
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCreate = async (values) => {
    try {
      await createTheVault(values).unwrap();
      message.success('OTP added successfully');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to add OTP');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTheVault(id).unwrap();
      message.success('OTP deleted successfully');
    } catch (error) {
      message.error('Failed to delete OTP');
    }
  };

  const formatDate = (dateString) => {
    return moment(dateString).format('MMMM D, YYYY');
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <Title level={4}>The Vault</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
          style={{
            background: '#057199',

            borderColor: 'transparent'
          }}
        >
          Add New OTP
        </Button>
      </div>

{isLoading ? (
  <div style={{ textAlign: 'center', padding: '50px' }}>
    <Spin size="large" />
  </div>
) : (
  vaultData?.data?.length > 0 ? (
    <Row gutter={[16, 16]}>
      {vaultData?.data?.map((item) => (
        <Col xs={24} sm={12} md={8} lg={6} key={item._id}>
          <Card 
            hoverable 
            style={{ borderRadius: '8px' }}
            actions={[
              <Popconfirm
                title="Are you sure you want to delete this OTP?"
                onConfirm={() => handleDelete(item._id)}
                okText="Yes"
                cancelText="No"
                okButtonProps={{ loading: isDeleting }}
              >
                <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
              </Popconfirm>,
            ]}
          >
            <div style={{ padding: '8px' }}>
              <Space direction="vertical" size="small">
                <Text strong>OTP: {item.otp}</Text>
                <Text type="secondary">Created: {formatDate(item.createdAt)}</Text>
              </Space>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  ) : (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Text type="secondary" style={{ fontSize: '16px' }}>
        No OTP entries found. Click "Add New OTP" to create one.
      </Text>
    </div>
  ))}


      <Modal
        title="Add New OTP"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
          <Form.Item
            name="otp"
            label="OTP"
            rules={[{ required: true, message: 'Please enter OTP' }]}
          >
            <Input placeholder="Enter OTP" />
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={isCreating}
              style={{
                background: '#057199',

                borderColor: 'transparent',
                width: '100%'
              }}
            >
              Add OTP
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TheVault