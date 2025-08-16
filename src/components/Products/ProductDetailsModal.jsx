import React from 'react';
import { Modal, Button, Tag } from 'antd';
import { getImageUrl } from '../common/imageUrl';

const ProductDetailsModal = ({ visible, product, onCancel }) => {
  if (!product) return null;

  // Determine membership type for display
  const getMembershipType = () => {
    if (product.premiumMembership) return 'Premium Membership';
    if (product.advanceMembership) return 'Advanced Membership';
    if (product.normalMembership) return 'Normal Membership';
    return 'No Membership';
  };

  return (
    <Modal
      title="Product Details"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Close
        </Button>,
      ]}
      width={600}
    >
      <div className="grid grid-cols-1 gap-4">
        <div className="flex justify-center mb-4">
          {product.images && product.images.length > 0 && (
            <img
               src={getImageUrl(product?.images[0])}
              alt={product.name}
              className="max-h-64 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold">Name:</p>
            <p>{product.name}</p>
          </div>
          
          <div>
            <p className="font-bold">SKU:</p>
            <p>{product.sku}</p>
          </div>
          
          <div>
            <p className="font-bold">Category:</p>
            <p>{product.categories}</p>
          </div>
          
          <div>
            <p className="font-bold">Price:</p>
            <p>${product.price}</p>
          </div>
          
          <div>
            <p className="font-bold">Stock:</p>
            <p>{product.stock}</p>
          </div>
          
          <div>
            <p className="font-bold">Free Shipping Threshold:</p>
            <p>${product.highestPriceForFreeShipping}</p>
          </div>
          
          <div>
            <p className="font-bold">Credit Needs:</p>
            <p>{product.creditNeeds}</p>
          </div>
          
          <div>
            <p className="font-bold">CS Aura Earn:</p>
            <p>{product.csAuraEarn}</p>
          </div>
          
          <div>
            <p className="font-bold">Credit Earn:</p>
            <p>{product.creditEarn}</p>
          </div>
          
          <div>
            <p className="font-bold">Membership Type:</p>
            <Tag color="blue">{getMembershipType()}</Tag>
          </div>
          
          <div>
            <p className="font-bold">Status:</p>
            <Tag color={product.status === 'active' ? 'green' : 'red'}>
              {product.status.toUpperCase()}
            </Tag>
          </div>
          
          <div>
            <p className="font-bold">Stock Status:</p>
            <Tag color={product.isStock ? 'green' : 'red'}>
              {product.isStock ? 'In Stock' : 'Out of Stock'}
            </Tag>
          </div>
        </div>
        
        <div>
          <p className="font-bold">Description:</p>
          <p className="text-gray-600">{product.description}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailsModal;