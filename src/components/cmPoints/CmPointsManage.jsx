import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Menu,
  Dropdown,
  message,
  Tag,
} from "antd";
import { SearchOutlined, DownOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import GradientButton from "../common/GradiantButton";
import { Filtering } from "../common/Svg";
import moment from "moment";
import {
  useGetCmPointsQuery,
  useDeleteCmPointsMutation,
  useUpdateCmPointsStatusMutation,
} from "../../redux/apiSlices/CmPointsApi";
import Spinner from "../common/Spinner";
import CmPointsFormModal from "./CmPointsFormModal";
import CmPointsDetailsModal from "./CmPointsDetailsModal";

const CmPointsManage = () => {
  // State for modals
  const [isFormModalVisible, setIsFormModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [selectedCmPoint, setSelectedCmPoint] = useState(null);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // State for filters
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Query params for API
  const [searchParams, setSearchParams] = useState([
    { name: "page", value: currentPage },
    { name: "limit", value: pageSize },
  ]);

  // Fetch data using RTK Query
  const { data, isLoading, refetch } = useGetCmPointsQuery(searchParams);
  const [deleteCmPoints, { isLoading: isDeleting }] = useDeleteCmPointsMutation();
  const [updateCmPointsStatus, { isLoading: isUpdatingStatus }] = useUpdateCmPointsStatusMutation();

  // Update search params when pagination changes
  useEffect(() => {
    setSearchParams([
      { name: "page", value: currentPage },
      { name: "limit", value: pageSize },
    ]);
  }, [currentPage, pageSize]);

  // Modal handlers
  const showFormModal = (cmPoint = null) => {
    setSelectedCmPoint(cmPoint);
    setIsFormModalVisible(true);
  };

  const closeFormModal = () => {
    setIsFormModalVisible(false);
    setSelectedCmPoint(null);
  };

  const showDetailsModal = (cmPoint) => {
    setSelectedCmPoint(cmPoint);
    setIsDetailsModalVisible(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalVisible(false);
    setSelectedCmPoint(null);
  };

  // Handle form submission
  const handleFormSubmit = () => {
    refetch();
    closeFormModal();
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await deleteCmPoints(id).unwrap();
      message.success("CM Point deleted successfully");
      refetch();
    } catch (error) {
      message.error("Failed to delete CM Point");
    }
  };

  // Handle status change
  const handleStatusChange = async (id, currentStatus) => {
    try {
      await updateCmPointsStatus({
        id,
        isActive: !currentStatus,
      }).unwrap();
      message.success("Status updated successfully");
      refetch();
    } catch (error) {
      message.error("Failed to update status");
    }
  };

  // Handle table pagination
  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  // Filter handlers
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status.toLowerCase());
  };

//   const statusMenu = (
//     <Menu>
//       <Menu.Item key="all" onClick={() => handleStatusFilterChange("all")}>
//         All Status
//       </Menu.Item>
//       <Menu.Item key="active" onClick={() => handleStatusFilterChange("active")}>
//         Active
//       </Menu.Item>
//       <Menu.Item key="inactive" onClick={() => handleStatusFilterChange("inactive")}>
//         Inactive
//       </Menu.Item>
//     </Menu>
//   );

  // Table columns
  const columns = [
    {
      title: "SL",
      key: "id",
      width: 70,
      align: "center",
      render: (text, record, index) => {
        const actualIndex = (currentPage - 1) * pageSize + index + 1;
        return `# ${actualIndex}`;
      },
    },
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      align: "center",
      render: (month) => moment(month).format("MMMM YYYY"),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      align: "center",
    },
    {
      title: "No Membership Reward",
      key: "noMembership",
      align: "center",
      render: (_, record) => {
        const noMembershipReward = record.rewards.find(
          (reward) => reward.userType === "noMembership"
        );
        return noMembershipReward ? noMembershipReward.rewardAmount : "N/A";
      },
    },
    {
      title: "Advance Membership Reward",
      key: "advanceMembership",
      align: "center",
      render: (_, record) => {
        const advanceMembershipReward = record.rewards.find(
          (reward) => reward.userType === "advanceMembership"
        );
        return advanceMembershipReward ? advanceMembershipReward.rewardAmount : "N/A";
      },
    },
    {
      title: "Premium Membership Reward",
      key: "premiumMembership",
      align: "center",
      render: (_, record) => {
        const premiumMembershipReward = record.rewards.find(
          (reward) => reward.userType === "premiumMembership"
        );
        return premiumMembershipReward ? premiumMembershipReward.rewardAmount : "N/A";
      },
    },
    // {
    //   title: "Status",
    //   dataIndex: "isActive",
    //   key: "isActive",
    //   align: "center",
    //   render: (isActive) => (
    //     <Tag color={isActive ? "success" : "error"}>
    //       {isActive ? "Active" : "Inactive"}
    //     </Tag>
    //   ),
    //   filters: [
    //     { text: "Active", value: true },
    //     { text: "Inactive", value: false },
    //   ],
    //   onFilter: (value, record) => record.isActive === value,
    // },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) => moment(date).format("YYYY-MM-DD"),
    },
  {
  title: "Action",
  key: "action",
  align: "center",
  render: (_, record) => (
    <Space size="small">
      {/* Details Button (eye icon) */}
      <Button
        icon={<EyeOutlined />}
        onClick={() => showDetailsModal(record)}
      />

      {/* Edit Button (edit icon) */}
      <Button
        icon={<EditOutlined />} 
        onClick={() => showFormModal(record)}
      />

      {/* Delete Button (trash icon + danger color) */}
      <Button
        type="primary"
        danger
        icon={<DeleteOutlined className="fas fa-trash" />} 
        onClick={() => handleDelete(record._id)}
        loading={isDeleting}
      />
    </Space>
  ),
}

  ];

  // Filter data based on status filter
  const filteredData = data?.data?.filter((item) => {
    if (statusFilter === "all") return true;
    return statusFilter === "active" ? item.isActive : !item.isActive;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">CM Points Management</h1>
        <div className="flex items-center">
     

          <GradientButton
            type="primary"
            onClick={() => showFormModal()}
            className="py-5"
            icon={<PlusOutlined />}
          >
            Add New CM Point
          </GradientButton>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredData || []}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.meta?.total || 0,
       
        }}
        onChange={handleTableChange}
        rowKey="_id"
        bordered
        size="small"
        className="custom-table"
        scroll={{ x: "max-content" }}
      />

      {/* Form Modal */}
      <CmPointsFormModal
        visible={isFormModalVisible}
        onCancel={closeFormModal}
        onSuccess={handleFormSubmit}
        cmPoint={selectedCmPoint}
      />

      {/* Details Modal */}
      <CmPointsDetailsModal
        visible={isDetailsModalVisible}
        onCancel={closeDetailsModal}
        cmPoint={selectedCmPoint}
      />
    </div>
  );
};

export default CmPointsManage;