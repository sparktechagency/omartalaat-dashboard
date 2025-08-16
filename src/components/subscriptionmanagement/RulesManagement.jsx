import { useState } from "react";
import { Pencil, Trash2, X, Plus } from "lucide-react";
import JoditEditor from "jodit-react";
import { Modal } from "antd";
import {
  useGetSubscriptionRulesQuery,
  useCreateSubscriptionRuleMutation,
  useUpdateSubscriptionRuleMutation,
  useDeleteSubscriptionRuleMutation,
} from "../../redux/apiSlices/subscriptionManagementApi";
import Spinner from "../common/Spinner";

export default function SubscriptionRulesManagement() {
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [currentRule, setCurrentRule] = useState("");
  const [subscriptionType, setSubscriptionType] = useState("app");
  const [isEditing, setIsEditing] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [originalRule, setOriginalRule] = useState(""); // Store original rule for comparison
  const [originalSubscriptionType, setOriginalSubscriptionType] = useState("app"); // Store original type

  // RTK Query hooks
  const { data: subscriptionRules = [], isLoading: isLoadingRules } =
    useGetSubscriptionRulesQuery();
  const [createRule, { isLoading: isCreating }] =
    useCreateSubscriptionRuleMutation();
  const [updateRule, { isLoading: isUpdating }] =
    useUpdateSubscriptionRuleMutation();
  const [deleteRule, { isLoading: isDeleting }] =
    useDeleteSubscriptionRuleMutation();

  // Function to check if save button should be disabled
  const isSaveDisabled = () => {
    // If creating new rule, disable if currentRule is empty or only whitespace
    if (!isEditing) {
      return !currentRule || currentRule.trim() === "" || isCreating;
    }
    
    // If editing, disable if no changes made or currentRule is empty
    const hasChanges = currentRule !== originalRule || subscriptionType !== originalSubscriptionType;
    const isRuleEmpty = !currentRule || currentRule.trim() === "";
    
    return !hasChanges || isRuleEmpty || isUpdating;
  };

  // Rule functions
  const addSubscriptionRule = async () => {
    try {
      if (isEditing && editingRuleId !== null) {
        // Update existing rule
        await updateRule({
          id: editingRuleId,
          rule: currentRule,
          subscriptionType,
        });
      } else {
        // Add new rule
        await createRule({
          rule: currentRule || "Price dropped! Save on your favorite items.",
          subscriptionType,
        });
      }
      setShowRuleModal(false);
      setCurrentRule(""); // Clear the rule after adding
      setIsEditing(false); // Reset editing flag
      setEditingRuleId(null); // Reset ID
      setOriginalRule(""); // Reset original rule
      setOriginalSubscriptionType("app"); // Reset original type
    } catch (error) {
      console.error("Error saving rule:", error);
      // Handle error - could show an error message to the user
    }
  };

  const editSubscriptionRule = (rule) => {
    setCurrentRule(rule.rule);
    setSubscriptionType(rule.subscriptionType);
    setOriginalRule(rule.rule); // Store original rule for comparison
    setOriginalSubscriptionType(rule.subscriptionType); // Store original type
    setIsEditing(true);
    setEditingRuleId(rule.id);
    setShowRuleModal(true); // Open modal to edit the rule
  };

  const handleDeleteRule = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this subscription rule?",
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          // Proceed with deletion if confirmed
          await deleteRule(id);
        } catch (error) {
          console.error("Error deleting rule:", error);
          // Handle error
        }
      },
    });
  };

  const handleRuleChange = (newContent) => {
    setCurrentRule(newContent); // Update the current rule content
  };

  const handleTypeChange = (e) => {
    setSubscriptionType(e.target.value);
  };

  const joditConfig = {
    readonly: false,
    toolbar: true,
    width: "100%",
    height: 200,
  };

  if (isLoadingRules) {
    return <Spinner />;
  }
  return (
    <div className="mb-8">
      {/* Add Subscription Rules Button */}
      <div className="flex justify-end mb-4">
        <button
          className="flex items-center px-4 py-2 text-white bg-red-500 rounded-md"
          onClick={() => {
            setShowRuleModal(true);
            setIsEditing(false);
            setCurrentRule("");
            setSubscriptionType("app");
            setOriginalRule("");
            setOriginalSubscriptionType("app");
          }}
        >
          <Plus size={18} className="mr-2" />
          Add Subscription Rules
        </button>
      </div>

      {/* Subscription Rules List */}
      <div className="mb-8 border-t-8 border-red-500 rounded-lg">
        <h2 className="p-2 text-lg text-white bg-red-500">
          Subscription Rules
        </h2>
        <div className="bg-white">
          {subscriptionRules.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No subscription rules found. Add a new rule to get started.
            </div>
          ) : (
            subscriptionRules.map((rule, index) => (
              <div
                key={rule.id || index}
                className="flex items-center justify-between p-3 border-b"
              >
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 mr-3 text-xs bg-gray-100 rounded-full">
                    {index + 1}
                  </span>
                  <div>
                    <span
                      dangerouslySetInnerHTML={{ __html: rule.rule }}
                    ></span>
                    <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded-md">
                      {rule.subscriptionType}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => editSubscriptionRule(rule)}
                    disabled={isUpdating}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
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
            <div className="p-4">
              {/* Rule Editor */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Rule Content
                </label>
                <JoditEditor
                  value={currentRule}
                  config={joditConfig}
                  onChange={handleRuleChange}
                />
              </div>

              {/* Subscription Type */}
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium">
                  Subscription Type
                </label>
                <select
                  value={subscriptionType}
                  onChange={handleTypeChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="app">App</option>
                  <option value="web">Web</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4">
              <button
                className="w-full py-3 font-medium text-white bg-red-500 rounded-md disabled:bg-red-300 disabled:cursor-not-allowed"
                onClick={addSubscriptionRule}
                disabled={isSaveDisabled()}
              >
                {isCreating || isUpdating ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}