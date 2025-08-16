import React from "react";
import { Space } from 'antd';
import OrderCard from "./OrderCard";
import OrderManagementTable from "./OrderManagementTable";

const OrderManagementContainer = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Analysis Cards */}
        <OrderCard />
        
        {/* Orders Table */}
        <OrderManagementTable />
      </Space>
    </div>
  );
};

export default OrderManagementContainer;
