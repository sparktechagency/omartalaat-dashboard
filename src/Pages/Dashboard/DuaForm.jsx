import React, { useState, useRef, useEffect } from "react";
import JoditEditor from "jodit-react";
import GradientButton from "../../components/common/GradiantButton";
import { Button, message, Modal } from "antd";
import {
  useGetSettingQuery,
  useUpdateSettingMutation,
} from "../../redux/apiSlices/setting";

const DuaForm = () => {
  const editor = useRef(null);
  const { data, isLoading: isLoadingSetting, isError } = useGetSettingQuery();
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

  const [duaFormContent, setDuaFormContent] = useState("");

  // Modal open state
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (data?.duaForm) {
      setDuaFormContent(data.duaForm);
    }
  }, [data]);

  // Show modal handler
  const showModal = () => {
    setIsModalOpen(true);
  };

  // Handle modal cancel
  const handleCancel = () => {
    // Reset content to original on cancel to discard changes
    setDuaFormContent(data?.duaForm || "");
    setIsModalOpen(false);
  };

  // Handle modal OK (save)
  const handleOk = async () => {
    try {
      await updateSetting({ duaForm: duaFormContent }).unwrap();
      message.success("Dua Form updated successfully!");
      setIsModalOpen(false);
    } catch (error) {
      message.error("Failed to update Dua Form.");
    }
  };

  if (isLoadingSetting) return <p>Loading Dua Form...</p>;
  if (isError) return <p>Failed to load Dua Form.</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Dua Form</h2>
        <GradientButton
          onClick={showModal}
          className="h-10 text-white w-60 bg-secondary"
        >
          Edit Dua Form
        </GradientButton>
      </div>

      <div className="p-6 rounded-lg bg-primary">
        <div className="p-6 mt-6 bg-white border rounded-lg saved-content">
          <div
            dangerouslySetInnerHTML={{ __html: duaFormContent }}
            className="prose max-w-none"
          />
        </div>
      </div>

      <Modal
        title="Update Terms and conditions"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width="65%"
        footer={[
          <Button
            key="cancel"
            onClick={handleCancel}
            className="py-5 mr-2 text-white bg-red-500"
            disabled={isUpdating}
          >
            Cancel
          </Button>,
          <GradientButton
            key="submit"
            onClick={handleOk}
            className="text-white bg-secondary"
            disabled={isUpdating}
          >
            {isUpdating ? "Updating..." : "Update Dua Form"}
          </GradientButton>,
        ]}
      >
        {isModalOpen && (
          <div className="mb-6">
            <JoditEditor
              ref={editor}
              value={duaFormContent}
              onChange={setDuaFormContent}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DuaForm;
