import React from "react";
import { Card, Statistic, Row, Col, Spin } from 'antd';
import {
  DollarOutlined,
  ShoppingOutlined,
  CarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useGetOrderAnalysisQuery } from "../../redux/apiSlices/orderManagement";

const OrderCard = () => {
  const { data: analysisData, isLoading } = useGetOrderAnalysisQuery();
  const analysis = analysisData?.data;

  const cardData = [
    {
      title: "Total Orders",
      value: analysis?.totalOrders || 0,
      icon: <ShoppingOutlined style={{ color: '#1890ff' }} />,
      color: '#1890ff',
    },
    {
      title: "Processing",
      value: analysis?.processing || 0,
      icon: <DollarOutlined style={{ color: '#faad14' }} />,
      color: '#faad14',
    },
    {
      title: "Shipping",
      value: analysis?.shipping || 0,
      icon: <CarOutlined style={{ color: '#ff4d4f' }} />,
      color: '#ff4d4f',
    },
    {
      title: "Delivered",
      value: analysis?.delivered || 0,
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      color: '#52c41a',
    },
  ];

  if (isLoading) {
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <Col xs={24} sm={12} lg={6} key={i}>
            <Card>
              <Spin />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {cardData.map((data, index) => (
        <Col xs={24} sm={12} lg={6} key={index}>
          <Card hoverable>
            <Statistic
              title={data.title}
              value={data.value}
              prefix={data.icon}
              valueStyle={{ color: data.color }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default OrderCard;
