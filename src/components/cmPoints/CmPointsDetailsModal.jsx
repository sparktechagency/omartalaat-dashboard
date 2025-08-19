import React from "react";
import { Modal, Button, Descriptions, Tag } from "antd";
import moment from "moment";

const CmPointsDetailsModal = ({ visible, onCancel, cmPoint }) => {
  if (!cmPoint) return null;

  return (
    <Modal
      title="CM Point Details"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
      ]}
      width={700}
    >
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="Month">
          {moment(cmPoint.month).format("MMMM YYYY")}
        </Descriptions.Item>
        <Descriptions.Item label="Category">{cmPoint.category}</Descriptions.Item>
        <Descriptions.Item label="Status">
          <Tag color={cmPoint.isActive ? "success" : "error"}>
            {cmPoint.isActive ? "Active" : "Inactive"}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {moment(cmPoint.createdAt).format("YYYY-MM-DD HH:mm:ss")}
        </Descriptions.Item>
        <Descriptions.Item label="Updated At">
          {moment(cmPoint.updatedAt).format("YYYY-MM-DD HH:mm:ss")}
        </Descriptions.Item>
      </Descriptions>

      <h3 className="mt-4 mb-2 font-bold">Rewards</h3>
      <Descriptions bordered column={1} size="small">
        {cmPoint.rewards.map((reward) => (
          <Descriptions.Item 
            key={reward._id} 
            label={`${reward.userType.charAt(0).toUpperCase() + reward.userType.slice(1)} Reward`}
          >
            <div className="flex flex-col">
              <span>Reward Amount: {reward.rewardAmount}</span>
              <span>Minimum Purchase Required: {reward.minPurchaseRequired}</span>
            </div>
          </Descriptions.Item>
        ))}
      </Descriptions>
    </Modal>
  );
};

export default CmPointsDetailsModal;