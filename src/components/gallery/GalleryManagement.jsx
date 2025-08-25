import React, { useState } from "react";
import { Button, Space, Modal, Dropdown, Menu, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import {
  useGetGalleryQuery,
  useCreateGalleryMutation,
  useUpdateGalleryMutation,
  useDeleteGalleryMutation,
  useUpdateStatusMutation,
} from "../../redux/apiSlices/galleryApi";
import Spinner from "../common/Spinner";
import { Filtering } from "../common/Svg";
import GradientButton from "../common/GradiantButton";
import GalleryForm from "./GalleryFormModal";
import GalleryTable from "./GalleryTable";
// import GalleryTable from "./GalleryTable";
// import GalleryForm from "./GalleryForm";
// import GalleryDetailsModal from "./GalleryDetailsModal";

const GalleryManagement = () => {
  const navigate = useNavigate();

  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingGallery, setEditingGallery] = useState(null);
  const [selectedGallery, setSelectedGallery] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch data using RTK Query
  const { data: galleryData, isLoading: galleryLoading } = useGetGalleryQuery();

  // API mutations
  const [createGallery] = useCreateGalleryMutation();
  const [updateGallery] = useUpdateGalleryMutation();
  const [deleteGallery] = useDeleteGalleryMutation();
  const [updateStatus] = useUpdateStatusMutation();

  // Extract the actual data from the API responses
  const gallery = galleryData?.data || [];

  const formattedGallery = gallery.map((item) => ({
    id: item._id,
    _id: item._id,
    description: item.description || "",
    image: item.image,
    createdAt: item.createdAt,
    status: item.status,
  }));

  const showModal = (record = null) => {
    setEditingGallery(record);
    setModalVisible(true);
  };

const handleGalleryFormSubmit = async (values, imageFile) => {
  try {
    console.log("=== DEBUG START ===");
    console.log("Values received:", values);
    console.log("Image file received:", imageFile);
    console.log("Editing gallery:", editingGallery);
    
    // First, let's check if we have the required data
    if (!values.description) {
      message.error("Description is required!");
      return;
    }
    
    if (!imageFile && (!editingGallery || !editingGallery.image)) {
      message.error("Please upload an image for the gallery item.");
      return;
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('data', JSON.stringify({ description: values.description.trim() }));
    
    // Add image if available
    if (imageFile) {
      // console.log("Adding image file:", imageFile.name, imageFile.type, imageFile.size);
      formData.append('image', imageFile);
    }
    
    // Debug: Log FormData contents
    console.log("=== FormData Contents ===");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: File(${value.name}, ${value.type}, ${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }
    console.log("=== FormData Contents End ===");
    
    if (editingGallery) {
      console.log("Updating gallery with ID:", editingGallery._id);
      const res = await updateGallery({
        id: editingGallery._id,
        data: formData,
      }).unwrap();
      console.log("Update response:", res);
      message.success("Gallery item updated successfully!");
    } else {
      console.log("Creating new gallery item");
      const res = await createGallery(formData).unwrap();
      console.log("Create response:", res);
      message.success("Gallery item created successfully!");
    }

    setModalVisible(false);
    setEditingGallery(null);
  } catch (error) {

    message.error(`Failed to save gallery item: ${error.data?.message || error.message || "Please try again."}`);
  }
};

  const handleCancel = () => {
    setModalVisible(false);
    setEditingGallery(null);
  };

  const showGalleryDetails = (record) => {
    setSelectedGallery(record);
    setDetailsModalVisible(true);
  };

  const handleDetailsModalClose = () => {
    setDetailsModalVisible(false);
    setSelectedGallery(null);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this gallery item?",
      content: "This action cannot be undone",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteGallery(id).unwrap();
          message.success("Gallery item deleted successfully!");
        } catch (error) {
          console.error("Error deleting gallery item:", error);
          message.error("Failed to delete gallery item. Please try again.");
        }
      },
    });
  };

  const handleStatusChange = (checked, record) => {
    Modal.confirm({
      title: `Are you sure you want to ${
        checked ? "activate" : "deactivate"
      } this gallery item?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await updateStatus({
            id: record._id,
            status: checked ? "active" : "inactive",
          }).unwrap();
          message.success(
            `Gallery item ${checked ? "activated" : "deactivated"} successfully!`
          );
        } catch (error) {
          console.error("Error updating gallery status:", error);
          message.error("Failed to update gallery status. Please try again.");
        }
      },
    });
  };

  const getFilteredGallery = () => {
    return formattedGallery.filter((item) => {
      const statusMatch =
        filterStatus === "all" ||
        item.status.toLowerCase() === filterStatus.toLowerCase();
      return statusMatch;
    });
  };

  const statusMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => setFilterStatus("all")}>
        All
      </Menu.Item>
      <Menu.Item key="active" onClick={() => setFilterStatus("active")}>
        Active
      </Menu.Item>
      <Menu.Item key="inactive" onClick={() => setFilterStatus("inactive")}>
        Inactive
      </Menu.Item>
    </Menu>
  );

  if (galleryLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  const filteredGallery = getFilteredGallery();

  return (
    <div className="p-4">
      <div>
        <div className="flex justify-end mb-4 items-center">
          {/* <div className="flex items-center">
            <Dropdown overlay={statusMenu} trigger={["click"]}>
              <Button
                className="mr-2 bg-[#057199] text-white py-5"
                style={{ border: "none" }}
              >
                <Space>
                  <Filtering className="no-hover-bg" />
                  {filterStatus === "all" ? "All Status" : filterStatus}
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div> */}
          <div>
            <GradientButton type="primary" onClick={() => showModal()}>
              Add New Gallery Item
            </GradientButton>
          </div>
        </div>

        <GalleryTable
          gallery={filteredGallery}
          onEdit={showModal}
          onView={showGalleryDetails}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      </div>

      {/* Add/Edit Gallery Modal */}
      <GalleryForm
        visible={modalVisible}
        onCancel={handleCancel}
        onSubmit={handleGalleryFormSubmit}
        initialValues={editingGallery}
      />

      {/* Gallery Details Modal */}
      {/* <GalleryDetailsModal
        visible={detailsModalVisible}
        onCancel={handleDetailsModalClose}
        gallery={selectedGallery}
      /> */}
    </div>
  );
};

export default GalleryManagement;