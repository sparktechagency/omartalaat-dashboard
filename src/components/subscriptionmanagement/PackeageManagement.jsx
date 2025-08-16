import { useState } from "react";
import { Pencil, X, Plus, ChevronDown } from "lucide-react";
import { Dropdown, Menu, Button, Modal } from "antd";
import {
  useGetSubscriptionPackagesQuery,
  useCreateSubscriptionPackageMutation,
  useUpdateSubscriptionPackageMutation,
  useDeleteSubscriptionPackageMutation,
} from "../../redux/apiSlices/subscriptionManagementApi";
import Spinner from "../common/Spinner";
import { Filtering } from "../common/Svg";

// Duration options that match the API's expected enum values
const DURATION_OPTIONS = [
  { value: "1 month", label: "1 Month" },
  { value: "3 months", label: "3 Months" },
  { value: "6 months", label: "6 Months" },
  { value: "1 year", label: "1 Year" },
];

// Payment type options that match the API's expected enum values
const PAYMENT_TYPE_OPTIONS = [
  { value: "Yearly", label: "Yearly" },
  { value: "Monthly", label: "Monthly" },
];

// Membership types that can see discounts
const MEMBERSHIP_OPTIONS = [
  { value: "all", label: "All Users" },
  { value: "premium", label: "Premium Members" },
  { value: "gold", label: "Gold Members" },
  { value: "platinum", label: "Platinum Members" },
  { value: "vip", label: "VIP Members" },
];

export default function SubscriptionPackagesManagement() {
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [selectedType, setSelectedType] = useState("app");
  const [currentPackage, setCurrentPackage] = useState({
    title: "",
    description: "",
    price: "",
    duration: "1 month",
    paymentType: "Yearly",
    subscriptionType: "web",
    // New discount fields
    discountPercentage: "",
    discountVisibleTo: "all",
  });
  const [editingPackageId, setEditingPackageId] = useState(null);

  // RTK Query hooks
  const { data: subscriptionPackages = [], isLoading: isLoadingPackages } =
    useGetSubscriptionPackagesQuery();
  const [createPackage, { isLoading: isCreating }] =
    useCreateSubscriptionPackageMutation();
  const [updatePackage, { isLoading: isUpdating }] =
    useUpdateSubscriptionPackageMutation();
  const [deletePackage] = useDeleteSubscriptionPackageMutation();

  console.log(subscriptionPackages);

  // Form validation function
  const isFormValid = () => {
    const requiredFields = [
      "title",
      "description",
      "price",
      "duration",
      "paymentType",
      "subscriptionType",
    ];

    // Check if all required fields have values
    for (let field of requiredFields) {
      if (
        !currentPackage[field] ||
        currentPackage[field].toString().trim() === ""
      ) {
        return false;
      }
    }

    // Check if price is a valid positive number
    const price = Number(currentPackage.price);
    if (isNaN(price) || price <= 0) {
      return false;
    }

    // Check if discount percentage is valid (if provided)
    if (currentPackage.discountPercentage !== "") {
      const discount = Number(currentPackage.discountPercentage);
      if (isNaN(discount) || discount < 0 || discount > 100) {
        return false;
      }
    }

    return true;
  };

  // Package functions
  const openPackageModal = (packageObj = null) => {
    if (packageObj) {
      // Edit existing - normalize data to match API expectations
      const normalizedDuration =
        packageObj.duration?.toLowerCase() || "1 month";

      setCurrentPackage({
        title: packageObj.title,
        description: packageObj.description,
        price: packageObj.price,
        duration: normalizedDuration,
        paymentType:
          packageObj.paymentType === "One-time"
            ? "Yearly"
            : packageObj.paymentType,
        subscriptionType: packageObj.subscriptionType,
        // Handle discount fields with defaults
        discountPercentage: packageObj.discountPercentage || "",
        discountVisibleTo: packageObj.discountVisibleTo || "all",
      });
      setEditingPackageId(packageObj._id || packageObj.id);
    } else {
      // Add new
      setCurrentPackage({
        title: "",
        description: "",
        price: "",
        duration: "1 month",
        paymentType: "Yearly",
        subscriptionType: "web",
        discountPercentage: "",
        discountVisibleTo: "all",
      });
      setEditingPackageId(null);
    }
    setShowPackageModal(true);
  };

  const savePackage = async () => {
    // Double check form validity before saving
    if (!isFormValid()) {
      Modal.error({
        title: "Form Validation Error",
        content: "Please fill in all required fields with valid values.",
      });
      return;
    }

    try {
      // Format package data - send original price and discount percentage to backend
      const formattedPackage = {
        ...currentPackage,
        price: Number(currentPackage.price),
        discount: currentPackage.discountPercentage
          ? parseInt(currentPackage.discountPercentage, 10)
          : 0,
      };

      if (editingPackageId !== null) {
        // Update existing package
        await updatePackage({
          id: editingPackageId,
          ...formattedPackage,
        });
      } else {
        // Add new package
        await createPackage(formattedPackage);
      }
      setShowPackageModal(false);
      setCurrentPackage({
        title: "",
        description: "",
        price: "",
        duration: "1 month",
        paymentType: "Yearly",
        subscriptionType: "web",
        discount: "",
        discountVisibleTo: "all",
      });
      setEditingPackageId(null);
    } catch (error) {
      console.error("Error saving package:", error);
      Modal.error({
        title: "Error saving package",
        content: error.message || "Please check all fields and try again.",
      });
    }
  };

  const handlePackageChange = (e) => {
    const { name, value } = e.target;
    setCurrentPackage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const confirmDeletePackage = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this subscription package?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await deletePackage(id);
        } catch (error) {
          console.error("Error deleting package:", error);
          Modal.error({
            title: "Error deleting package",
            content:
              error.message || "An error occurred while deleting the package.",
          });
        }
      },
    });
  };

  // Filter packages based on selected type
  const filteredPackages =
    selectedType === "All"
      ? subscriptionPackages
      : subscriptionPackages.filter(
          (pkg) => pkg.subscriptionType === selectedType.toLowerCase()
        );

  // Filter menu items
  const typeFilterMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => setSelectedType("All")}>
        All Types
      </Menu.Item>
      <Menu.Item key="web" onClick={() => setSelectedType("Web")}>
        Web
      </Menu.Item>
      <Menu.Item key="app" onClick={() => setSelectedType("App")}>
        App
      </Menu.Item>
    </Menu>
  );

  if (isLoadingPackages) {
    return <Spinner />;
  }

  return (
    <div className="">
      {/* Type Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Dropdown overlay={typeFilterMenu} trigger={["click"]}>
            <Button
              className="py-5 mr-2 text-white bg-red-600 hover:text-black"
              style={{ border: "none" }}
            >
              <div className="flex items-center gap-4">
                <Filtering />
                <span>
                  {selectedType === "All" ? "All Types" : selectedType}
                </span>
                <ChevronDown className="ml-2" size={14} />
              </div>
            </Button>
          </Dropdown>
        </div>

        {/* Add Package Button */}
        <button
          className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 rounded-md"
          onClick={() => openPackageModal()}
        >
          <Plus size={18} />
          Add Subscription Package
        </button>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        
        {filteredPackages.length === 0 ? (
          <div className="p-4 col-span-full text-center text-gray-500">
            No subscription packages found. Add a new package to get started.
          </div>
        ) : (
          filteredPackages.map((pkg) => {
            const hasDiscount = pkg.discount > 0;

            return (
              <div
                key={pkg.id || pkg._id}
                className="relative flex-1 p-10 border rounded-lg min-w-64"
              >
                {/* Type Label - Rotated and positioned at top left */}
                <div
                  className="absolute top-0 px-3 py-1 text-xs text-black bg-gray-100 rounded-md -left-5"
                  style={{
                    transform: "rotate(-50deg)",
                    transformOrigin: "top right",
                  }}
                >
                  {pkg.subscriptionType}
                </div>

                {/* Discount Badge */}
                {hasDiscount && (
                  <div className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-red-500 rounded-full">
                    {pkg.discount}% OFF
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    className="p-1 mr-2"
                    onClick={() => openPackageModal(pkg)}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    className="p-1 text-red-500"
                    onClick={() => confirmDeletePackage(pkg.id || pkg._id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>

                <div className="mb-3 text-sm text-center">{pkg.title}</div>

                {/* Updated Price Display */}
                <div className="mb-3 text-center">
                  {hasDiscount ? (
                    <div>
                      {/* Original Price with strikethrough */}
                      <div className="text-2xl font-bold text-gray-400 line-through mb-1">
                        ${pkg.originalPrice}
                      </div>
                      {/* Discounted Price */}
                      <div className="text-5xl font-bold text-red-600">
                        ${pkg.price}
                      </div>
                      {/* Savings amount */}
                      {/* <div className="text-sm text-green-600 mt-1">
                        Save ${pkg.originalPrice - pkg.price}
                      </div> */}
                    </div>
                  ) : (
                    <div className="text-6xl font-bold">${pkg.price}</div>
                  )}
                </div>

                <div className="mb-2 text-xs text-center">
                  {DURATION_OPTIONS.find(
                    (opt) => opt.value === pkg.duration?.toLowerCase()
                  )?.label || pkg.duration}{" "}
                  - {pkg.paymentType}
                </div>

                {/* Membership Visibility - Updated to use discount field */}
                {/* {hasDiscount && pkg.discountVisibleTo !== "all" && (
                  <div className="mb-2 text-xs text-center text-orange-600">
                    Discount for{" "}
                    {
                      MEMBERSHIP_OPTIONS.find(
                        (opt) => opt.value === pkg.discountVisibleTo
                      )?.label
                    }{" "}
                    only
                  </div>
                )} */}

                <p className="mb-8 text-xs text-center">{pkg.description}</p>
                <button className="w-full py-2 text-white bg-red-500 rounded-md">
                  Subscribe
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Subscription Package Modal */}
      {showPackageModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowPackageModal(false)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-2xl font-bold text-red-500">
                {editingPackageId !== null
                  ? "Edit Subscription Package"
                  : "Add New Subscription Package"}
              </h2>
              <button onClick={() => setShowPackageModal(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <form className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={currentPackage.title}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g. Basic Plan, Premium Plan"
                    required
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="duration"
                    value={currentPackage.duration}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    {DURATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Original Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={currentPackage.price}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g. 60.99"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Discount Section */}
                <div className="p-4 border rounded-md bg-gray-50">
                  <h3 className="mb-3 text-lg font-semibold text-gray-700">
                    Discount Settings
                  </h3>

                  {/* Discount Percentage */}
                  <div className="mb-3">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      name="discountPercentage"
                      value={currentPackage.discountPercentage}
                      onChange={handlePackageChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="e.g. 20 (for 20% off)"
                      min="0"
                      max="100"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Enter 0 for no discount, or any number from 1-100 for
                      percentage off. Backend will calculate the discounted
                      price.
                    </p>
                  </div>
                </div>

                {/* Payment Type */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Payment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="paymentType"
                    value={currentPackage.paymentType}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    {PAYMENT_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subscription Type */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Subscription Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="subscriptionType"
                    value={currentPackage.subscriptionType}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    required
                  >
                    <option value="web">Web</option>
                    <option value="app">App</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={currentPackage.description}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    rows="4"
                    placeholder="Enter package description"
                    required
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4">
              <button
                className={`w-full py-3 font-medium text-white rounded-md transition-colors ${
                  !isFormValid() || isCreating || isUpdating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
                onClick={savePackage}
                disabled={!isFormValid() || isCreating || isUpdating}
              >
                {isCreating || isUpdating ? "Saving..." : "Save"}
              </button>

              {/* Validation message */}
              {!isFormValid() && (
                <p className="mt-2 text-sm text-red-600 text-center">
                  Please fill in all required fields with valid values
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
