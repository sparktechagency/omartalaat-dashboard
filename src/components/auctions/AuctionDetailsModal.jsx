import React from "react";
import { Modal, Button, Tag, Image } from "antd";
import moment from "moment";
import { getImageUrl } from "../common/imageUrl";

const AuctionDetailsModal = ({ visible, onClose, auction }) => {
  if (!auction) return null;

  return (
    <Modal
      title="Auction Details"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
      width={700}
    >
      <div className="space-y-4">
        {(auction.productImage || auction.image) && (
          <div className="text-center">
            <Image
              src={getImageUrl(auction.productImage || auction.image)}
              alt={auction.name}
              className="max-w-full h-40 object-contain rounded-2xl"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-gray-600">Product Name:</label>
            <p className="text-gray-800">{auction.name}</p>
          </div>

          {/* <div>
            <label className="font-semibold text-gray-600">Starting Price:</label>
            <p className="text-green-600 font-semibold">
              ${auction.price?.toLocaleString()}
            </p>
          </div> */}

          <div>
            <label className="font-semibold text-gray-600">
              Highest Bidder:
            </label>
            <p className="text-gray-800">
              {auction.bidInfo?.userId.userName || "No bids yet"}
            </p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">
              Start Date & Time:
            </label>
            <p className="text-gray-800">
              {auction.startDate
                ? moment(auction.startDate).format("DD MMM YYYY HH:mm")
                : "N/A"}
            </p>
          </div>
          <div>
            <label className="font-semibold text-gray-600">
              Highest Bidder Email:
            </label>
            <p className="text-gray-800">
              {auction.bidInfo?.userId.email || "No bids yet"}
            </p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">
              End Date & Time:
            </label>
            <p className="text-gray-800">
              {auction.endDate
                ? moment(auction.endDate).format("DD MMM YYYY HH:mm")
                : "N/A"}
            </p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">
              Highest Bidder Amount:
            </label>
            <p className="text-gray-800">
              {auction.bidInfo?.amount || "No bids yet"}
            </p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">
              CS Aura Worth:
            </label>
            <p className="text-gray-800">{auction.csAuraWorth || "0"}</p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">Credit Worth:</label>
            <p className="text-gray-800">{auction.creditWorth || "0"}</p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">Credit Needs:</label>
            <p className="text-gray-800">{auction.creditNeeds || "0"}</p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">
              Winner Bid Amount:
            </label>
            <p className="text-blue-600 font-semibold">
              {auction.winningBid > 0
                ? `$${auction.winningBid.toLocaleString()}`
                : "Bid Running"}
            </p>
          </div>

          <div>
            <label className="font-semibold text-gray-600">Status:</label>
            <Tag
              color={
                auction.status === "active"
                  ? "green"
                  : auction.status === "completed"
                  ? "blue"
                  : "red"
              }
            >
              {auction.status}
            </Tag>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AuctionDetailsModal;
