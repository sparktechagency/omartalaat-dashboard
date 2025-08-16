import React, { useState } from "react";
import {
  Table,
  Button,
  Input,
  Space,
  Tag,
  Switch,
  Modal,
  Form,
  InputNumber,
  DatePicker,
  TimePicker,
  Select,
  Dropdown,
  Menu,
  message,
  Upload,
  Image,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  DownOutlined,
  PictureOutlined,
  DeleteFilled,
} from "@ant-design/icons";
import moment from "moment";
import Spinner from "../common/Spinner";
import {
  useGetAuctionsQuery,
  useUpdateAuctionStatusMutation,
  useDeleteAuctionMutation,
} from "../../redux/apiSlices/auctionsApi";
import GradientButton from "../common/GradiantButton";
import { Filtering } from "../common/Svg";
import AuctionFormModal from "./AuctionFormModal";
import AuctionDetailsModal from "./AuctionDetailsModal";
import { getImageUrl } from "../common/imageUrl";

const { RangePicker } = DatePicker;

const AuctionManagement = () => {
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [selectedAuction, setSelectedAuction] = useState(null);

  // API hooks
  const {
    data: auctionsData,
    isLoading: isLoadingAuctions,
    refetch,
  } = useGetAuctionsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchText,
    status: statusFilter !== "all" ? statusFilter : undefined,
    startDate: dateRange?.[0]?.format("YYYY-MM-DD"),
    endDate: dateRange?.[1]?.format("YYYY-MM-DD"),
  });
  const [updateAuctionStatus] = useUpdateAuctionStatusMutation();
  const [deleteAuction] = useDeleteAuctionMutation();

  // Process auctions data
  const auctions = auctionsData?.data?.result || [];
  const paginationData = auctionsData?.data?.pagination || {
    total: 0,
    page: 1,
    limit: 3,
  };

  // Modal handlers
  const showFormModal = (auction = null) => {
    setEditingAuction(auction);
    setIsFormModalVisible(true);
  };

  const closeFormModal = () => {
    setIsFormModalVisible(false);
    setEditingAuction(null);
  };

  const showDetailsModal = (auction) => {
    setSelectedAuction(auction);
    setIsDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setSelectedAuction(null);
  };

  // Delete auction handler
  const handleDeleteAuction = (auctionId) => {
    Modal.confirm({
      title: "Are you sure you want to delete this auction?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deleteAuction(auctionId).unwrap();
          message.success("Auction deleted successfully");
          refetch();
        } catch {
          message.error("Failed to delete auction");
        }
      },
    });
  };

  // Status change handler
  const handleStatusChange = (checked, record) => {
    const newStatus = checked ? "active" : "inactive";
    Modal.confirm({
      title: `Change auction status to ${newStatus}?`,
      content: "This will update the auction status.",
      okText: "Yes, Update",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await updateAuctionStatus({
            auctionId: record._id || record.id,
            status: newStatus,
          }).unwrap();
          message.success(`Auction status updated to ${newStatus}`);
          refetch();
        } catch {
          message.error("Failed to update auction status");
        }
      },
    });
  };

  // Pagination handler
  const handleTableChange = (paginationConfig) => {
    setCurrentPage(paginationConfig.current);
    setPageSize(paginationConfig.pageSize);
  };

  // Search handler
  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Filter handlers
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setDateRange(null);
    setCurrentPage(1);
  };

  // Filter menus
  const statusMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => handleStatusFilter("all")}>
        All Status
      </Menu.Item>
      <Menu.Item key="active" onClick={() => handleStatusFilter("active")}>
        Active
      </Menu.Item>
      <Menu.Item key="inactive" onClick={() => handleStatusFilter("inactive")}>
        Inactive
      </Menu.Item>
      <Menu.Item key="completed" onClick={() => handleStatusFilter("completed")}>
        Completed
      </Menu.Item>
    </Menu>
  );

  // Table columns
  const columns = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center gap-3">
          {(record.productImage || record.image) && (
            <img
              src={getImageUrl(record.productImage || record.image)}
              alt={text}
              className="w-12 h-12 object-cover rounded"
            />
          )}
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    // {
    //   title: "Auction Price",
    //   dataIndex: "price",
    //   key: "auctionPrice",
    //   render: (price) => (
    //     <span className="font-semibold text-green-600">
    //       ${price?.toLocaleString() || "0"}
    //     </span>
    //   ),
    // },
    {
      title: "Start Date & Time",
      key: "startDateTime",
      render: (_, record) => (
        <div>
          <div className="text-sm">
            {record.startDate ? moment(record.startDate).format("DD MMM YYYY HH:mm") : "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "End Date & Time",
      key: "endDateTime",
      render: (_, record) => (
        <div>
          <div className="text-sm">
            {record.endDate ? moment(record.endDate).format("DD MMM YYYY HH:mm") : "N/A"}
          </div>
        </div>
      ),
    },
    // {
    //   title: "CS Aura Worth",
    //   dataIndex: "csAuraWorth",
    //   key: "csAuraWorth",
    //   render: (worth) => worth || "0",
    // },
    // {
    //   title: "Credit Worth",
    //   dataIndex: "creditWorth",
    //   key: "creditWorth",
    //   render: (worth) => worth || "0",
    // },
    // {
    //   title: "Credit Needs",
    //   dataIndex: "creditNeeds",
    //   key: "creditNeeds",
    //   render: (needs) => needs || "0",
    // },
    {
      title: "Highest Bidder",
      dataIndex: ["bidInfo","userId", "userName"],

      key: "winningBid",
      render: (bidder) => bidder || "No bids yet",
    },
    {
      title: "Highest Amount",
      dataIndex: ["bidInfo", "amount"],
      key: "winningBid",
      render: (amount) => (
        <span className="font-semibold text-blue-600">
          ${amount?.toLocaleString() || "0"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={status === "active"}
            onChange={(checked) => handleStatusChange(checked, record)}
            size="small"
          />
          <Tag
            color={
              status === "active"
                ? "green"
                : status === "completed"
                ? "blue"
                : "red"
            }
          >
            {status}
          </Tag>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showDetailsModal(record)}
          />
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showFormModal(record)}
          />
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteAuction(record._id || record.id)}
          />
        </Space>
      ),
    },
  ];

  if (isLoadingAuctions) {
    return <Spinner />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Auction Management</h1>
        <GradientButton onClick={() => showFormModal()}>
          <PlusOutlined /> Create New Auction
        </GradientButton>
      </div>

      {/* Filters */}
      {/* <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Input
            placeholder="Search by product name or bidder"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={handleSearch}
          />

          <Dropdown overlay={statusMenu} trigger={["click"]}>
            <Button className="flex items-center gap-2">
              <Filtering />
              Status: {statusFilter === "all" ? "All" : statusFilter}
              <DownOutlined />
            </Button>
          </Dropdown>

          <RangePicker
            placeholder={["Start Date", "End Date"]}
            value={dateRange}
            onChange={handleDateRangeChange}
            style={{ width: 250 }}
          />

          {(searchText || statusFilter !== "all" || dateRange) && (
            <Button onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div> */}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table
          columns={columns}
          dataSource={auctions}
          rowKey={(record) => record._id || record.id}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: paginationData.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          loading={isLoadingAuctions}
          scroll={{ x: 1500 }}
        />
      </div>

      {/* Form Modal */}
      <AuctionFormModal
        visible={isFormModalVisible}
        onClose={closeFormModal}
        editingAuction={editingAuction}
        onSuccess={() => {
          refetch();
          closeFormModal();
        }}
      />

      {/* Details Modal */}
      <AuctionDetailsModal
        visible={isDetailsModalVisible}
        onClose={closeDetailsModal}
        auction={selectedAuction}
      />
    </div>
  );
};

export default AuctionManagement;