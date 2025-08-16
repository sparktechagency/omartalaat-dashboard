import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Space,
  Input,
  Menu,
  Dropdown,
  message,
  Modal,
} from "antd";
import { SearchOutlined, DownOutlined, PlusOutlined } from "@ant-design/icons";
// import {
//   useGetAllUsersQuery,
//   useUpdateUserStatusMutation,
// } from "../../redux/apiSlices/userSlice.js";
// import UserDetailsModal from "./UserDetailsModal";
// import GradientButton from "../common/GradiantButton";
import { Filtering, FilteringIcon } from "../common/Svg";
import moment from "moment";
import { useGetAllUsersQuery, useUpdateUserStatusMutation } from "../../redux/apiSlices/userSlice";
import Spinner from "../common/Spinner";
import UserDetailsModal from "./UserDetailsModal";
import GradientButton from "../common/GradiantButton";
// import Spinner from "../common/Spinner.jsx";

const UserManagementTable = () => {
  const [searchText, setSearchText] = useState(""); 
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Use RTK Query hooks
  const [queryParams, setQueryParams] = useState([]);
  const { data, isLoading, refetch } = useGetAllUsersQuery(queryParams);
  const [updateUserStatus, { isLoading: isUpdating }] =
    useUpdateUserStatusMutation();


  useEffect(() => {
    const params = [];

    if (statusFilter !== "All") {
      params.push({ name: "status", value: statusFilter });
    }

    params.push({ name: "limit", value: pageSize });
    params.push({ name: "page", value: currentPage });

    if (searchText) {
      params.push({ name: "searchTerm", value: searchText }); 
    }

    setQueryParams(params);
  }, [statusFilter, planFilter, searchText, pageSize, currentPage]);

  const handleSearch = (e) => {
    setSearchText(e.target.value); 
    setCurrentPage(1); // Reset to first page on new search
  };

  const showUserDetails = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  // Function to toggle user status between Active and Block with confirmation
 const toggleUserStatus = async (userId, currentStatus) => {
  Modal.confirm({
    title: "Are you sure?",
    content: `Do you want to change the user status to ${
      currentStatus === "active" ? "blocked" : "active"
    }?`,
    okText: "Yes",
    cancelText: "No",

    // ✅ Button style customization
    okButtonProps: {
      style: {
        backgroundColor: currentStatus === "active" ? "#057199" : "#52c41a", 
        // borderColor: currentStatus === "active" ? "#ff4d4f" : "#52c41a",
        color: "#fff",
      },
    },
    cancelButtonProps: {
      style: {
        backgroundColor: "#d9d9d9",
        borderColor: "#d9d9d9",
        color: "#000",
      },
    },

    onOk: async () => {
      try {
        await updateUserStatus({
          userId,
          status: currentStatus === "active" ? "blocked" : "active",
        }).unwrap();
        message.success(
          `User status updated successfully to ${
            currentStatus === "active" ? "blocked" : "active"
          }`
        );
        refetch();
      } catch (error) {
        message.error(`Failed to update status: ${error.message}`);
      }
    },
    onCancel() {},
  });
};


  const columns = [
    {
      title: "SL",
      dataIndex: "sl",
      key: "sl",
      width: 60,
      align: "center",
      render: (_, __, index) => ((currentPage - 1) * pageSize) + index + 1,
    },
    {
      title: "User Name",
      dataIndex: "userName",
      key: "userName",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
      align: "center",
      render: (text) => (
        <span>{text && text.length > 14 ? `${text.slice(0, 14)}...` : text || "N/A"}</span>
      ),
    },
    
    {
      title: "Joining Date",
      dataIndex: "joinDate",
      key: "joinDate",
      render: (text) => <span>{moment(text).format("L")} </span>,
    },
    {
      title: "Subscription",
      dataIndex: "isSubscribed",
      key: "isSubscribed",
      align: "center",
      render: (text) => <span>{text ? "yes" : "No"} </span>,
    },
 
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (status) => (
        <span
          style={{
            color: status === "active" ? "#52c41a " : "#f5222d",
            fontWeight: status === "active" ? "bold" : "normal",
          }}
        >
          {status}
        </span>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <GradientButton
            type="primary"
            danger
            onClick={() => showUserDetails(record)}
          >
            View Details
          </GradientButton>
          <button
            type="primary"
            onClick={() => toggleUserStatus(record._id, record.status)}
            style={{
              background: record.status === "active" ? "#69CDFF" : "#d9363e",
              // borderColor: record.status === "active" ? "#d9363e" : "#3f8600",
            }}
            className="h-10 px-4 py-2 rounded-md text-white"
            disabled={isUpdating} 
          >
            {isUpdating
              ? "Updating..."
              : record.status === "active"
              ? "blocked"
              : "active"}
          </button>
        </Space>
      ),
    },
  ];

  const statusMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => setStatusFilter("All")}>
        All Status
      </Menu.Item>
      <Menu.Item key="active" onClick={() => setStatusFilter("active")}>
        Active
      </Menu.Item>
      <Menu.Item key="blocked" onClick={() => setStatusFilter("blocked")}>
        Blocked
      </Menu.Item>
    </Menu>
  );




  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div className="flex justify-between mb-6 items-center">
        <Input
          placeholder="Search by user name or email"
          // prefix={<SearchOutlined />}
          style={{ width: 300, height: 40 }}
          onChange={handleSearch}
        />

        <div className="flex gap-4">
          <Space size="small" className="flex gap-4">
            <Dropdown overlay={statusMenu}>
              <Button
                className="mr-2 bg-[#057199] py-5 text-white hover:text-black hover:icon-black"

                style={{ border: "none" }}
              >
                <Space>
                  <Filtering className="filtering-icon" />
                  <span className="filter-text">
                    {statusFilter === "All" ? "All Status" : statusFilter}
                  </span>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>

            {/* <Dropdown overlay={planMenu}>
              <Button
                className="mr-2 bg-red-600 py-5 text-white hover:text-black hover:icon-black"
                style={{ border: "none" }}
              >
                <Space>
                  <Filtering className="filtering-icon" />
                  <span className="filter-text">
                    {planFilter === "All" ? "All Plans" : planFilter}
                  </span>
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown> */}
          </Space>
        </div>
      </div>

      <div className="border-2 rounded-lg">
        <Table
          columns={columns}
          dataSource={data?.users || []}
          loading={isLoading}
          pagination={{
            pageSize: pageSize,
            total: data?.pagination?.total || 0,
            current: currentPage,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            // showSizeChanger: true,
            // pageSizeOptions: ['10', '20', '50', '100'],
          }}
          size="middle"
          rowKey="_id"
          className="custom-table"
        />
      </div>

      {selectedUser && (
        <UserDetailsModal
          visible={isModalVisible}
          onClose={handleModalClose}
          userDetails={selectedUser.userDetails || selectedUser}
        />
      )}
    </div>
  );
};

export default UserManagementTable;
