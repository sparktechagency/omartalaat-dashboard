import React, { useState, useEffect } from "react";
import { Upload, X, Edit, Trash2, Plus, Camera } from "lucide-react";

const PageForm = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("/api/placeholder/400/300");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        setFormData({
          type: initialValues.type || "",
          title: initialValues.title || "",
          description: initialValues.description || "",
        });
        if (initialValues.image) {
          setPreviewUrl(initialValues.image);
        } else {
          setPreviewUrl("/api/placeholder/400/300");
        }
      } else {
        setFormData({ type: "", title: "", description: "" });
        setPreviewUrl("/api/placeholder/400/300");
        setImageFile(null);
      }
      setErrors({});
    }
  }, [visible, initialValues]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setPreviewUrl("/api/placeholder/400/300");
    setImageFile(null);
    const fileInput = document.getElementById("image-upload");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = "Please select page type";
    if (!formData.title) newErrors.title = "Please enter page title";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateForm()) {
      onSubmit(formData, imageFile);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialValues ? "Edit Page" : "Add New Page"}
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400  hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            {/* Page Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange("type", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.type ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select page type</option>
                <option value="login">Login Page</option>
                <option value="register">Register Page</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1">{errors.type}</p>
              )}
            </div>

            {/* Page Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Enter page title"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter page description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Image
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                {previewUrl && (
                  <div className="mb-4">
                    <img
                      src={previewUrl}
                      alt="Page preview"
                      className="w-full rounded-lg shadow-sm"
                      style={{ maxHeight: "250px", objectFit: "cover" }}
                    />
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <label className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md cursor-pointer flex items-center space-x-2 transition-colors">
                    <Upload size={16} />
                    <span>Select Image</span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={resetImage}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleFormSubmit}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
          >
            Save Data
          </button>
        </div>
      </div>
    </div>
  );
};

const PageManagement = () => {
  const [pages, setPages] = useState([
    {
      id: 1,
      type: "login",
      title: "Login Page Design",
      description: "Modern login page with gradient background",
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      type: "register",
      title: "Register Page Design",
      description: "Clean registration form with validation",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  const showModal = (page = null) => {
    setEditingPage(page);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingPage(null);
  };

  const handleSubmit = (values, imageFile) => {
    let imageUrl = editingPage?.image || "/api/placeholder/400/300";

    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    }

    const pageData = {
      ...values,
      image: imageUrl,
      id: editingPage ? editingPage.id : Date.now(),
      createdAt: editingPage ? editingPage.createdAt : new Date().toISOString(),
    };

    if (editingPage) {
      setPages(
        pages.map((page) => (page.id === editingPage.id ? pageData : page))
      );
    } else {
      setPages([...pages, pageData]);
    }

    setIsModalVisible(false);
    setEditingPage(null);
  };

  const handleDelete = (id) => {
    setPages(pages.filter((page) => page.id !== id));
  };

  const getTypeColor = (type) => {
    return type === "login"
      ? "bg-blue-100 text-blue-800"
      : "bg-green-100 text-green-800";
  };

  const getTypeIcon = (type) => {
    return type === "login" ? "🔐" : "📝";
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Page Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your login and register page designs
            </p>
          </div>
          <button
            onClick={() => showModal()}
            className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus size={20} />
            <span>Add New Page</span>
          </button>
        </div>

        {/* Stats Cards */}
        

        {/* Pages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden"
            >
              <div className="relative">
                <img
                  alt={page.title}
                  src={page.image}
                  className="h-48 w-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(
                      page.type
                    )}`}
                  >
                    {getTypeIcon(page.type)}{" "}
                    {page.type.charAt(0).toUpperCase() + page.type.slice(1)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3
                  className="font-semibold text-gray-900 mb-2 truncate"
                  title={page.title}
                >
                  {page.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {page.description || "No description available"}
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  Created: {new Date(page.createdAt).toLocaleDateString()}
                </p>

                <div className="flex justify-between">
                  <button
                    onClick={() => showModal(page)}
                    className="flex items-center space-x-1 text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="flex items-center space-x-1 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {pages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No pages yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first login or register page design
            </p>
            <button
              onClick={() => showModal()}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus size={20} />
              <span>Add Your First Page</span>
            </button>
          </div>
        )}
      </div>

      <PageForm
        visible={isModalVisible}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        initialValues={editingPage}
      />
    </div>
  );
};

export default PageManagement;
