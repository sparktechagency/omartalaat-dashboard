// import { useState, useCallback, useMemo } from "react";

// export const useVideoFormLogic = ({
//   form,
//   currentVideo,
//   categories,
//   subCategories,
//   onCategoryChange,
//   equipmentTags,
//   setEquipmentTags,
//   isAdding,
//   isUpdating,
// }) => {
//   const [thumbnailPath, setThumbnailPath] = useState("");
//   const [videoPath, setVideoPath] = useState("");
//   const [thumbnailPreview, setThumbnailPreview] = useState("");
//   const [videoPreview, setVideoPreview] = useState("");
//   const [videoDuration, setVideoDuration] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//   const [thumbnailFile, setThumbnailFile] = useState(null);
//   const [videoFile, setVideoFile] = useState(null);

//   // Memoized computed values to prevent unnecessary re-renders
//   const isProcessing = useMemo(() => {
//     return isAdding || isUpdating || submitting;
//   }, [isAdding, isUpdating, submitting]);

//   const isEditMode = useMemo(() => {
//     return !!currentVideo?._id;
//   }, [currentVideo?._id]);

//   // Cleanup function to prevent memory leaks
//   const cleanupResources = useCallback(() => {
//     if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
//       URL.revokeObjectURL(thumbnailPreview);
//     }
//     if (videoPreview && videoPreview.startsWith("blob:")) {
//       URL.revokeObjectURL(videoPreview);
//     }
//   }, [thumbnailPreview, videoPreview]);

//   // Initialize form with existing data or reset for new video
//   const initializeForm = useCallback(
//     (video) => {
//       if (video) {
//         // Find the category ID based on the category name
//         const categoryObj = categories.find(
//           (cat) => cat.name === video.category
//         );
//         const categoryId = categoryObj?._id;

//         // Set form values for edit mode
//         form.setFieldsValue({
//           title: video.title,
//           category: categoryId,
//           duration: video.duration || "",
//           description: video.description || "",
//         });

//         // Set preview URLs for existing media
//         setThumbnailPreview(video.thumbnailUrl || "");
//         setVideoPreview(video.videoUrl || "");
//         setVideoDuration(video.duration || "");
//         setThumbnailPath(video.thumbnailUrl || "");
//         setVideoPath("");

//         // Clear file references for edit mode
//         setThumbnailFile(null);
//         setVideoFile(null);

//         return categoryId;
//       } else {
//         // Reset form for new video
//         form.resetFields();
//         setThumbnailPreview("");
//         setVideoPreview("");
//         setVideoDuration("");
//         setThumbnailPath("");
//         setVideoPath("");
//         setThumbnailFile(null);
//         setVideoFile(null);
//         return null;
//       }
//     },
//     [form, categories]
//   );

//   // Handle adding equipment tags - Prevent form submission
//   const handleAddTag = useCallback(
//     (tag) => {
//       if (tag && !equipmentTags.includes(tag)) {
//         setEquipmentTags([...equipmentTags, tag]);
//       }
//     },
//     [equipmentTags, setEquipmentTags]
//   );

//   // Handle tag input key events - Prevent form submission on Enter
//   const handleTagInputKeyDown = useCallback(
//     (e) => {
//       if (e.key === "Enter") {
//         e.preventDefault();
//         e.stopPropagation();
//         const value = e.target.value.trim();
//         if (value) {
//           handleAddTag(value);
//           e.target.value = "";
//         }
//       }
//     },
//     [handleAddTag]
//   );

//   // Handle tag input blur event
//   const handleTagInputBlur = useCallback(
//     (e) => {
//       const value = e.target.value.trim();
//       if (value) {
//         handleAddTag(value);
//         e.target.value = "";
//       }
//     },
//     [handleAddTag]
//   );

//   // Handle thumbnail file selection
//   const handleThumbnailChange = useCallback(
//     (info) => {
//       if (info.file) {
//         // Store the file for form submission
//         setThumbnailFile(info.file);

//         // Clean up previous blob URL if exists
//         if (thumbnailPreview && thumbnailPreview.startsWith("blob:")) {
//           URL.revokeObjectURL(thumbnailPreview);
//         }

//         // Create a preview URL for the image
//         const previewURL = URL.createObjectURL(info.file);
//         setThumbnailPreview(previewURL);
//         setThumbnailPath(info.file.name);
//       }
//     },
//     [thumbnailPreview]
//   );

//   // Handle video file selection
//   const handleVideoChange = useCallback(
//     (info) => {
//       if (info.file) {
//         // Store the file for form submission
//         setVideoFile(info.file);

//         // Clean up previous blob URL if exists
//         if (videoPreview && videoPreview.startsWith("blob:")) {
//           URL.revokeObjectURL(videoPreview);
//         }

//         // Create a preview URL for the video
//         const previewURL = URL.createObjectURL(info.file);
//         setVideoPreview(previewURL);
//         setVideoPath(info.file.name);

//         // Get video duration asynchronously to prevent blocking
//         const video = document.createElement("video");
//         video.preload = "metadata";
//         video.onloadedmetadata = () => {
//           try {
//             const duration = Math.floor(video.duration);
//             const minutes = Math.floor(duration / 60);
//             const seconds = duration % 60;
//             const formattedDuration = `${minutes}:${
//               seconds < 10 ? "0" + seconds : seconds
//             }`;
//             setVideoDuration(formattedDuration);

//             // Update form field without causing re-render
//             requestAnimationFrame(() => {
//               form.setFieldsValue({ duration: formattedDuration });
//             });
//           } catch (error) {
//             console.warn("Could not extract video duration:", error);
//           }
//         };
//         video.onerror = () => {
//           console.warn("Could not load video metadata");
//         };
//         video.src = previewURL;
//       }
//     },
//     [videoPreview, form]
//   );

//   return {
//     // State values
//     thumbnailPath,
//     videoPath,
//     thumbnailPreview,
//     videoPreview,
//     videoDuration,
//     submitting,
//     thumbnailFile,
//     videoFile,

//     // Computed values
//     isProcessing,
//     isEditMode,

//     // Handler functions
//     handleThumbnailChange,
//     handleVideoChange,
//     handleAddTag,
//     handleTagInputKeyDown,
//     handleTagInputBlur,
//     setSubmitting,
//     initializeForm,
//     cleanupResources,
//   };
// };
