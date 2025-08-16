import React, { useState, useEffect } from "react";
import { Table, Input, Card, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useGetAllContactsQuery } from "../../redux/apiSlices/contactusApi";
import dayjs from "dayjs";

const { Title } = Typography;

const ContactManagementTable = () => {
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState([]);

  // API hook
  const { data: contactsData, isLoading } = useGetAllContactsQuery(filters);

  // Update filters when search or pagination changes
  useEffect(() => {
    const newFilters = [
      { name: "page", value: currentPage },
      { name: "limit", value: pageSize },
    ];

    if (searchText) {
      newFilters.push({ name: "searchTerm", value: searchText });
    }

    setFilters(newFilters);
  }, [currentPage, pageSize, searchText]);

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <strong>{text}</strong>,
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
      render: (email) => (
        <a href={`mailto:${email}`} >
          {email}
        </a>
      ),
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      align: "center",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      width: 500,
      align: "center",
    },

    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (date) => (
        <div>
          <div>{dayjs(date).format("DD MMM YYYY")}</div>
          {/* <small className="text-gray-500">
            {dayjs(date).format("HH:mm A")}
          </small> */}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between ">
        <Title level={2}>Contact Management</Title>

        {/* Search Only */}
        <div className="mb-4" >
          <Input
            placeholder="Search by name, email, or subject"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
                      onSearch={handleSearch}
                      className="w-96 border"
          />
        </div>
      </div>

      {/* Simple Table */}
      <div className="border-2 rounded-lg">
        <Table
          columns={columns}
          dataSource={contactsData?.contacts || []}
          rowKey="_id"
          loading={isLoading}
          size="medium"
          className="custom-table"
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: contactsData?.meta?.total || 0,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
           
          }}
        />
      </div>
    </div>
  );
};

export default ContactManagementTable;
