// VideoUploader.js - Handles video upload functionality
import React, { useState } from "react";
import { Button, Upload, message, Progress } from "antd";
import {
  CloudUploadOutlined,
  LoadingOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import {
  uploadToBunny,
  getVideoDuration,
  handleBunnyError,
} from "./bunnyUtilities";

/**
 * VideoUploader component for handling video uploads to Bunny.net
 *
 * @param {Object} props
 * @param {Function} props.onUploadSuccess - Callback when upload completes successfully
 * @param {Function} props.onUploadFail - Callback when upload fails
 * @param {string} props.initialUrl - Initial video URL (for edit mode)
 * @param {boolean} props.disabled - Whether the uploader is disabled
 * @param {string} props.accept - File types to accept (e.g., "video/*")
 * @param {string} props.folder - Folder to upload to on Bunny.net
 */
const VideoUploader = ({
  onUploadSuccess,
  onUploadFail,
  initialUrl = "",
  disabled = false,
  accept = "video/*",
  folder = "videos",
}) => {
  // State management
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(!!initialUrl);

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const previewURL = URL.createObjectURL(selectedFile);
      setPreview(previewURL);
      setUploadComplete(false);
    }
  };

  // Start the upload process
  const handleUpload = async () => {
    if (!file) {
      message.error("Please select a file first");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // Create an upload progress tracker
      const progressTracker = (percent) => {
        setProgress(Math.round(percent));
      };

      // Upload to Bunny.net with progress tracking
      const uploadedUrl = await uploadToBunny(file, folder, progressTracker);

      // If it's a video, get its duration
      let duration = null;
      if (accept.includes("video")) {
        duration = await getVideoDuration(file);
      }

      // Call the success callback with file info
      onUploadSuccess(uploadedUrl, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        duration,
      });

      message.success("Upload successful!");
      setUploadComplete(true);
      setProgress(100);
    } catch (error) {
      const errorMessage = handleBunnyError(error);
      message.error(errorMessage);
      if (onUploadFail) onUploadFail(error);
    } finally {
      setUploading(false);
    }
  };

  // Reset the uploader state
  const handleReset = (e) => {
    e.stopPropagation();
    URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(initialUrl || "");
    setProgress(0);
    setUploadComplete(!!initialUrl);
  };

  // Render the upload button or preview
  const renderContent = () => {
    if (preview) {
      return (
        <div className="relative w-full h-full">
          {accept.includes("video") ? (
            <video
              src={preview}
              controls
              className="w-full h-full object-cover rounded"
            />
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-contain rounded"
            />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center text-white">
              <LoadingOutlined style={{ fontSize: 24 }} />
              <div className="mt-2">Uploading...</div>
              <Progress
                percent={progress}
                status="active"
                className="w-3/4 mt-2"
                strokeColor="#ff4d4f"
              />
            </div>
          )}

          {uploadComplete && !uploading && (
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <CheckCircleFilled style={{ fontSize: 16 }} />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <CloudUploadOutlined style={{ fontSize: 40 }} />
        <div className="mt-2">
          Click to {accept.includes("video") ? "Upload Video" : "Upload File"}
        </div>
      </div>
    );
  };

  return (
    <div className="video-uploader">
      <div
        className="relative border-2 border-dashed rounded-md cursor-pointer h-64 overflow-hidden"
        style={{ borderColor: "#d9d9d9" }}
      >
        {/* Hidden file input for better control */}
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={disabled || uploading}
        />

        {/* Content area (preview or upload icon) */}
        <div className="flex items-center justify-center h-full">
          {renderContent()}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end mt-2 space-x-2">
        {file && !uploadComplete && (
          <Button
            type="primary"
            onClick={handleUpload}
            loading={uploading}
            disabled={disabled || uploading || uploadComplete}
            danger
          >
            {uploading ? "Uploading..." : "Start Upload"}
          </Button>
        )}

        {preview && (
          <Button onClick={handleReset} disabled={disabled || uploading}>
            {file ? "Cancel" : "Remove"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;
