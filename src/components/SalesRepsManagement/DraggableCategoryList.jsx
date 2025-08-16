import React, { useState } from 'react';
import { Button } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import DraggableCategoryCard from './DraggableCategoryCard';

const DraggableCategoryList = ({
  categories,
  onReorder,
  onEdit,
  onView,
  onDelete,
  onStatusChange,
  onViewVideos,
  hasChanges,
  onUpdateOrder,
}) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);

  const handleDragStart = (e, category) => {
    setDraggedItem(category);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, category) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverItem(category);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = (e, targetCategory) => {
    e.preventDefault();

    if (!draggedItem || draggedItem._id === targetCategory._id) {
      return;
    }

    const draggedIndex = categories.findIndex((c) => c._id === draggedItem._id);
    const targetIndex = categories.findIndex((c) => c._id === targetCategory._id);

    const newCategories = [...categories];
    const [removed] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(targetIndex, 0, removed);

    // Update serial numbers based on new order
    const reorderedCategories = newCategories.map((category, index) => ({
      ...category,
      serial: index + 1,
    }));

    onReorder(reorderedCategories);
  };

  return (
    <div className="draggable-category-list">
      {/* Update Order Button */}
      {hasChanges && (
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={onUpdateOrder}
            style={{
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
              borderRadius: "8px",
              fontWeight: "600",
            }}
          >
            Update Drag and Drop Order
          </Button>
        </div>
      )}

      {categories.map((category, index) => (
        <div
          key={category._id}
          draggable
          onDragStart={(e) => handleDragStart(e, category)}
          onDragOver={(e) => handleDragOver(e, category)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, category)}
          className={`drag-item ${
            dragOverItem?._id === category._id ? "drag-over" : ""
          }`}
          style={{
            transition: "all 0.2s ease",
          }}
        >
          <DraggableCategoryCard
            category={category}
            onEdit={onEdit}
            onView={onView}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onViewVideos={onViewVideos}
            isDragging={draggedItem?._id === category._id}
            serialNumber={index + 1}
            dragHandleProps={{
              onMouseDown: (e) => e.preventDefault(),
            }}
          />
        </div>
      ))}

      <style jsx>{`
        .drag-item {
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .drag-over {
          border-top: 3px solid #1890ff;
          padding-top: 8px;
          margin-top: 8px;
        }

        .category-card:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }

        .drag-handle:hover {
          color: #1890ff;
          background: rgba(24, 144, 255, 0.1);
          border-radius: 4px;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .dragging {
          z-index: 1000;
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default DraggableCategoryList; 