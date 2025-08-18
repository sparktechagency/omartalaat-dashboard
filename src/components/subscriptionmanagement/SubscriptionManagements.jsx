

import { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Space,
  Popconfirm,
  message,
  Card,
  Typography,
  Select,
  Tooltip,
  Tag,
  Pagination,
  Row,
  Col,
  Avatar,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  DollarOutlined,
  CalendarOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import {
  useGetAllSubscriptionPackageQuery,
  useCreateSubscriptionPackageMutation,
  useUpdateSubscriptionPackageMutation,
  useDeleteSubscriptionPackageMutation,
} from "../../redux/apiSlices/subscripionPackageApi";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const SubscriptionManagements = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentPackage, setCurrentPackage] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // API hooks
  const { data: packagesResponse, isLoading, refetch } = useGetAllSubscriptionPackageQuery(filters);
  const [createPackage, { isLoading: isCreating }] = useCreateSubscriptionPackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdateSubscriptionPackageMutation();
  const [deletePackage, { isLoading: isDeleting }] = useDeleteSubscriptionPackageMutation();

  const packages = packagesResponse?.data || [];
  const meta = packagesResponse?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 };

  // Handle create package
  const handleCreatePackage = async (values) => {
    try {
      await createPackage(values).unwrap();
      message.success("Package created successfully");
      setIsModalVisible(false);
      form.resetFields();
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to create package");
    }
  };

  // Handle update package
  const handleUpdatePackage = async (values) => {
    try {
      await updatePackage({
        id: currentPackage._id,
        data: values,
      }).unwrap();
      message.success("Package updated successfully");
      setIsEditModalVisible(false);
      editForm.resetFields();
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to update package");
    }
  };

  // Handle delete package
  const handleDeletePackage = async (id) => {
    try {
      await deletePackage(id).unwrap();
      message.success("Package deleted successfully");
      refetch();
    } catch (error) {
      message.error(error?.data?.message || "Failed to delete package");
    }
  };

  // Handle edit button click
  const handleEditClick = (record) => {
    setCurrentPackage(record);
    editForm.setFieldsValue({
      title: record.title,
      price: record.price,
      description: record.description,
      duration: record.duration,
      paymentType: record.paymentType,
      subscriptionType: record.subscriptionType,
      status: record.status,
    });
    setIsEditModalVisible(true);
  };

  // Handle search
  const handleSearch = () => {
    const newFilters = [];
    if (searchText) {
      newFilters.push({ name: "search", value: searchText });
    }
    setFilters(newFilters);
    setPagination({ ...pagination, current: 1 });
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setPagination({ current: page, pageSize });
    const newFilters = [...filters];
    const pageIndex = newFilters.findIndex((filter) => filter.name === "page");
    if (pageIndex !== -1) {
      newFilters[pageIndex] = { name: "page", value: page };
    } else {
      newFilters.push({ name: "page", value: page });
    }
    
    const limitIndex = newFilters.findIndex((filter) => filter.name === "limit");
    if (limitIndex !== -1) {
      newFilters[limitIndex] = { name: "limit", value: pageSize };
    } else {
      newFilters.push({ name: "limit", value: pageSize });
    }
    
    setFilters(newFilters);
  };

  return (
    <div className="p-4">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <Title level={4}>Subscription Package Management</Title>
          <Space>
     
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalVisible(true)}
              style={{height: 40, background: '#057199'}}



            >
              Add Package
            </Button>
          </Space>
        </div>

        {/* Card View instead of Table */}
        <Row gutter={[16, 16]} className="mt-4">
          {isLoading ? (
            <Col span={24} className="text-center">
              <div>Loading...</div>
            </Col>
          ) : packages.length === 0 ? (
            <Col span={24} className="text-center">
              <div>No subscription packages found</div>
            </Col>
          ) : (
            packages.map((pkg) => (
              <Col xs={24} sm={12} md={8} lg={6} key={pkg._id}>
                <Card
                  hoverable
                  className="h-full"
                  actions={[
                    <Tooltip title="Edit" key="edit">
                      <EditOutlined onClick={() => handleEditClick(pkg)} />
                    </Tooltip>,
                    <Popconfirm
                      title="Are you sure you want to delete this package?"
                      onConfirm={() => handleDeletePackage(pkg._id)}
                      okText="Yes"
                      cancelText="No"
                      key="delete"
                    >
                      <DeleteOutlined />
                    </Popconfirm>,
                  ]}
                >
                  <div className="text-center mb-3">
                    <Tag color={pkg.status === "active" ? "green" : "red"} className="mb-2">
                      {pkg.status?.toUpperCase()}
                    </Tag>
                    <Title level={4} className="mb-0">{pkg.title}</Title>
                    <div className="flex justify-center items-center my-2">
                      <DollarOutlined className="mr-1" />
                      <Text strong>${pkg.price}/mth</Text>
                    </div>
                  </div>
                  
                  <Paragraph ellipsis={{ rows: 2 }} className="text-center mb-3">
                    {pkg.description}
                  </Paragraph>
                  
                  <div className="flex justify-between items-center mb-2">
                    <Text><CalendarOutlined className="mr-1" /> Duration:</Text>
                    <Text strong>{pkg.duration}</Text>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <Text><CreditCardOutlined className="mr-1" /> Payment:</Text>
                    <Text strong>{pkg.paymentType}</Text>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Text>Created:</Text>
                    <Text>{new Date(pkg.createdAt).toLocaleDateString()}</Text>
                  </div>
                </Card>
              </Col>
            ))
          )}
        </Row>
        
        {/* <div className="mt-4 flex justify-end">
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={meta.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total) => `Total ${total} items`}
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
          />
        </div> */}
      </Card>

      {/* Create Package Modal */}
      <Modal
        title="Create New Package"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePackage}>
          <Form.Item
            name="title"
            label="Package Title"
            rules={[{ required: true, message: "Please enter package title" }]}
          >
            <Select placeholder="Select package title">
              <Option value="advance Membership">Advanced Membership</Option>
              <Option value="premium Membership">Premium Membership</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) => `$ ${value}`}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              placeholder="Enter price"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration"
            rules={[{ required: true, message: "Please enter duration" }]}
          >
            <Select placeholder="Select duration">
              <Option value="1 month">1 Month</Option>
              <Option value="3 months">3 Months</Option>
              <Option value="6 months">6 Months</Option>
              <Option value="1 years">12 Years</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="paymentType"
            label="Payment Type"
            rules={[{ required: true, message: "Please select payment type" }]}
            initialValue="Monthly"
          >
            <Select placeholder="Select payment type">
              <Option value="Monthly">Monthly</Option>
              <Option value="Yearly">Yearly</Option>
              <Option value="One-time">One-time</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isCreating} style={{background: '#057199'}}>

                  Create
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Package Modal - Updated to match Create Modal */}
      <Modal
        title="Edit Package"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdatePackage}>
          <Form.Item
            name="title"
            label="Package Title"
            rules={[{ required: true, message: "Please enter package title" }]}
          >
            <Select placeholder="Select package title">
              <Option value="Advanced Membership">Advanced Membership</Option>
              <Option value="Premium Membership">Premium Membership</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: "Please enter price" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) => `$ ${value}`}
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              placeholder="Enter price"
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration"
            rules={[{ required: true, message: "Please enter duration" }]}
          >
            <Select placeholder="Select duration">
              <Option value="1 month">1 Month</Option>
              <Option value="3 months">3 Months</Option>
              <Option value="6 months">6 Months</Option>
              <Option value="1 years">12 Years</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="paymentType"
            label="Payment Type"
            rules={[{ required: true, message: "Please select payment type" }]}
          >
            <Select placeholder="Select payment type">
              <Option value="Monthly">Monthly</Option>
              <Option value="Yearly">Yearly</Option>
              <Option value="One-time">One-time</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end">
              <Space>
                <Button onClick={() => setIsEditModalVisible(false)}>Cancel</Button>
                <Button type="primary" htmlType="submit" loading={isUpdating} style={{background: '#057199'}}>

                  Update
                </Button>
              </Space>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SubscriptionManagements;
