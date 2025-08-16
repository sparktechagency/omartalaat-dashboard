import { useState } from "react";
import { Pencil, Trash2, X, Plus, ChevronDown } from "lucide-react";
import JoditEditor from "jodit-react";
import { Modal, Dropdown, Menu, Button } from "antd"; // Import Modal from Ant Design

// Custom Filter Icon SVG component (copied from VideoManagement)
const FilteringIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    style={{ marginRight: "8px" }}
  >
    <path
      d="M0.75 4.2308H12.169C12.5131 5.79731 13.9121 6.97336 15.5805 6.97336C17.2488 6.97336 18.6478 5.79736 18.9919 4.2308H23.25C23.6642 4.2308 24 3.89498 24 3.4808C24 3.06661 23.6642 2.7308 23.25 2.7308H18.9915C18.6467 1.16508 17.2459 -0.0117188 15.5805 -0.0117188C13.9141 -0.0117188 12.5139 1.16489 12.1693 2.7308H0.75C0.335812 2.7308 0 3.06661 0 3.4808C0 3.89498 0.335812 4.2308 0.75 4.2308ZM13.588 3.48277L13.588 3.4747C13.5913 2.37937 14.4851 1.48833 15.5805 1.48833C16.6743 1.48833 17.5681 2.37816 17.5728 3.47297L17.573 3.48398C17.5712 4.58119 16.6781 5.47341 15.5805 5.47341C14.4833 5.47341 13.5904 4.58208 13.5879 3.48553L13.588 3.48277ZM23.25 19.769H18.9915C18.6467 18.2033 17.2459 17.0265 15.5805 17.0265C13.9141 17.0265 12.5139 18.2031 12.1693 19.769H23.25C23.6642 19.769 24 20.1047 24 20.519C24 20.9332 23.6642 21.269 23.25 21.269ZM15.5805 22.5115C14.4833 22.5115 13.5904 21.6202 13.5879 20.5237L13.588 20.5209L13.588 20.5129C13.5913 19.4175 14.4851 18.5265 15.5805 18.5265C16.6743 18.5265 17.5681 19.4163 17.5728 20.511L17.573 20.5221C17.5714 21.6194 16.6782 22.5115 15.5805 22.5115ZM23.25 11.2499H11.831C11.4869 9.68339 10.0879 8.50739 8.41955 8.50739C6.75117 8.50739 5.35223 9.68339 5.00808 11.2499H0.75C0.335812 11.2499 0 11.5857 0 11.9999C0 12.4141 0.335812 12.7499 0.75 12.7499H5.00845C5.35331 14.3156 6.75413 15.4924 8.41955 15.4924C10.0859 15.4924 11.4861 14.3158 11.8307 12.7499H23.25C23.6642 12.7499 24 12.4141 24 11.9999C24 11.5857 23.6642 11.2499 23.25 11.2499ZM10.412 11.9979L10.412 12.006C10.4087 13.1013 9.51492 13.9924 8.41955 13.9924C7.32572 13.9924 6.43191 13.1025 6.42717 12.0078L6.42703 11.9968C6.42867 10.8995 7.32188 10.0074 8.41955 10.0074C9.5167 10.0074 10.4096 10.8987 10.4121 11.9953L10.412 11.9979Z"
      fill="#fff"
    />
  </svg>
);

export default function AllSubscriptionManagement() {
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [subscriptionRules, setSubscriptionRules] = useState([
    "Price dropped! Save on your favorite items.",
    "Price dropped! Save on your favorite items.",
    "Price dropped! Save on your favorite items.",
    "Price dropped! Save on your favorite items.",
    "Price dropped! Save on your favorite items.",
    "Price dropped! Save on your favorite items.",
    "Price dropped! Save on your favorite items.",
  ]);
  const [currentRule, setCurrentRule] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingRuleIndex, setEditingRuleIndex] = useState(null);

  // For package editing
  const [subscriptionPlans, setSubscriptionPlans] = useState([
    {
      period: "1 Month",
      price: "$60.99",
      trialDays: 7,
      description:
        "Get more access to entire yoga with jen library of classes, meditations and courses.",
      type: "Web App",
    },
    {
      period: "6 Month",
      price: "$60.99",
      trialDays: 7,
      description:
        "Get more access to entire yoga with jen library of classes, meditations and courses.",
      type: "Application",
    },
    {
      period: "1 Years",
      price: "$100.99",
      trialDays: 7,
      description:
        "Get more access to entire yoga with jen library of classes, meditations and courses.",
      type: "Application",
    },
    {
      period: "1 Year",
      price: "$60.99",
      trialDays: 7,
      description:
        "Get more access to entire yoga with jen library of classes, meditations and courses.",
      type: "Web App",
    },
  ]);
  const [currentPackage, setCurrentPackage] = useState({
    period: "",
    price: "",
    trialDays: 0,
    description: "",
    type: "Web App",
  });
  const [editingPackageIndex, setEditingPackageIndex] = useState(null);
  const [selectedType, setSelectedType] = useState("Web App");

  // Rule functions
  const addSubscriptionRule = () => {
    if (isEditing && editingRuleIndex !== null) {
      // Update existing rule
      const updatedRules = [...subscriptionRules];
      updatedRules[editingRuleIndex] = currentRule;
      setSubscriptionRules(updatedRules);
    } else {
      // Add new rule
      setSubscriptionRules([
        ...subscriptionRules,
        currentRule || "Price dropped! Save on your favorite items.",
      ]);
    }
    setShowRuleModal(false);
    setCurrentRule(""); // Clear the rule after adding
    setIsEditing(false); // Reset editing flag
    setEditingRuleIndex(null); // Reset index
  };

  const editSubscriptionRule = (index) => {
    setCurrentRule(subscriptionRules[index]);
    setIsEditing(true);
    setEditingRuleIndex(index);
    setShowRuleModal(true); // Open modal to edit the rule
  };

  const handleDeleteRule = (index) => {
    Modal.confirm({
      title: "Are you sure you want to delete this subscription rule?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        // Proceed with deletion if confirmed
        deleteSubscriptionRule(index);
      },
    });
  };

  const deleteSubscriptionRule = (index) => {
    const updatedRules = subscriptionRules.filter((_, i) => i !== index);
    setSubscriptionRules(updatedRules);
  };

  const handleRuleChange = (newContent) => {
    setCurrentRule(newContent); // Update the current rule content
  };

  // Package functions
  const openPackageModal = (index = null) => {
    if (index !== null) {
      // Edit existing
      setCurrentPackage({ ...subscriptionPlans[index] });
      setEditingPackageIndex(index);
    } else {
      // Add new
      setCurrentPackage({
        period: "",
        price: "",
        trialDays: 0,
        description: "",
        type: "Web App",
      });
      setEditingPackageIndex(null);
    }
    setShowPackageModal(true);
  };

  const savePackage = () => {
    if (editingPackageIndex !== null) {
      // Update existing package
      const updatedPlans = [...subscriptionPlans];
      updatedPlans[editingPackageIndex] = currentPackage;
      setSubscriptionPlans(updatedPlans);
    } else {
      // Add new package
      setSubscriptionPlans([...subscriptionPlans, currentPackage]);
    }
    setShowPackageModal(false);
    setCurrentPackage({
      period: "",
      price: "",
      trialDays: 0,
      description: "",
      type: "Web App",
    });
    setEditingPackageIndex(null);
  };

  const handlePackageChange = (e) => {
    const { name, value } = e.target;
    setCurrentPackage((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Filter packages based on selected type
  const filteredPlans =
    selectedType === "All"
      ? subscriptionPlans
      : subscriptionPlans.filter((plan) => plan.type === selectedType);

  const joditConfig = {
    readonly: false,
    toolbar: true,
    width: "100%",
    height: 200,
  };

  // Filter menu items
  const typeFilterMenu = (
    <Menu>
      <Menu.Item key="all" onClick={() => setSelectedType("All")}>
        All Types
      </Menu.Item>
      <Menu.Item key="webapp" onClick={() => setSelectedType("Web App")}>
        Web App
      </Menu.Item>
      <Menu.Item
        key="application"
        onClick={() => setSelectedType("Application")}
      >
        Application
      </Menu.Item>
    </Menu>
  );

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
              <div className="flex items-center">
                <FilteringIcon />
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
      <div className="grid grid-cols-4 gap-16 mb-8">
        {filteredPlans.map((plan, index) => {
          // Find the actual index in the original array
          const originalIndex = subscriptionPlans.findIndex((p) => p === plan);
          return (
            <div
              key={originalIndex}
              className="relative flex-1 p-10 border rounded-lg min-w-64"
            >
              {/* Type Label - Rotated and positioned at top left */}
              <div
                className="absolute top-0 px-3 py-1 text-xs text-black bg-gray-100 rounded-md -left-8"
                style={{
                  transform: "rotate(-50deg)",
                  transformOrigin: "top right",
                }}
              >
                {plan.type}
              </div>

              <button
                className="absolute top-4 right-4"
                onClick={() => openPackageModal(originalIndex)}
              >
                <Pencil size={18} />
              </button>
              <div className="mb-3 text-sm text-center">For {plan.period}</div>
              <div className="mb-3 text-6xl font-bold text-center">
                {plan.price}
              </div>
              <div className="mb-2 text-xs text-center">
                {plan.trialDays}-Days Free Trial
              </div>
              <p className="mb-8 text-xs text-center">{plan.description}</p>
              <button className="w-full py-2 text-white bg-red-500 rounded-md">
                Subscribe
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Rules Button */}
      <div className="flex justify-end mb-4">
        <button
          className="flex items-center px-4 py-2 text-white bg-red-500 rounded-md"
          onClick={() => {
            setShowRuleModal(true);
            setIsEditing(false);
            setCurrentRule("");
          }}
        >
          Add Subscription Rules
        </button>
      </div>

      {/* Subscription Rules List */}
      <div className="mb-8 border-t-8 border-red-500 rounded-lg">
        <h2 className="p-2 text-lg text-white bg-red-500">
          Subscription Rules
        </h2>
        <div className="bg-white">
          {subscriptionRules.map((rule, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border-b"
            >
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 mr-3 text-xs bg-gray-100 rounded-full">
                  {index + 1}
                </span>
                <span dangerouslySetInnerHTML={{ __html: rule }}></span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => editSubscriptionRule(index)}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => handleDeleteRule(index)}>
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Subscription Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl overflow-hidden bg-white rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-2xl font-bold text-red-500">
                {isEditing
                  ? "Edit Subscription Rule"
                  : "Add New Subscription Rule"}
              </h2>
              <button onClick={() => setShowRuleModal(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 min-h-64">
              {/* Jodit Editor */}
              <JoditEditor
                value={currentRule}
                config={joditConfig}
                onChange={handleRuleChange}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4">
              <button
                className="w-full py-3 font-medium text-white bg-red-500 rounded-md"
                onClick={addSubscriptionRule}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Subscription Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl overflow-hidden bg-white rounded-lg shadow-lg">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-2xl font-bold text-red-500">
                {editingPackageIndex !== null
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
                {/* Period */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Period
                  </label>
                  <input
                    type="text"
                    name="period"
                    value={currentPackage.period}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 1 Month, 6 Month, 1 Year"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={currentPackage.price}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. $60.99"
                  />
                </div>

                {/* Trial Days */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Free Trial Days
                  </label>
                  <input
                    type="number"
                    name="trialDays"
                    value={currentPackage.trialDays}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="e.g. 7"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    name="type"
                    value={currentPackage.type}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Web App">Web App</option>
                    <option value="Application">Application</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={currentPackage.description}
                    onChange={handlePackageChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="4"
                    placeholder="Enter package description"
                  ></textarea>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4">
              <button
                className="w-full py-3 font-medium text-white bg-red-500 rounded-md"
                onClick={savePackage}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
