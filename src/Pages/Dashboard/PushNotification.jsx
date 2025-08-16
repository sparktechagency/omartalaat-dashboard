import React, { useEffect, useState } from "react";
import {
  MdDelete,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdModeEditOutline,
  MdSend,
  MdClose,
} from "react-icons/md";
import { useGetSendPushNotificationQuery } from "../../redux/apiSlices/pushNotification";

// Mock notification data
const notificationData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Subscribers ${i + 1}`,
  email: `subscribers${i + 1}@gmail.com`,
  phone: `+23191633389${i + 1}`,
  address: `Address ${i + 1}, City`,
  image: `https://img.freepik.com/free-photo/portrait-handsome-young-man-with-arms-crossed-holding-white-headphone-around-his-neck_23-2148096439.jpg?semt=ais_hybrid`,
}));

// Simple Modal Component
const NotificationModal = ({ isOpen, onClose }) => {
  const [communicationType, setCommunicationType] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const { data } = useGetSendPushNotificationQuery()
  console.log(data)
  console.log("push notification page")

  if (!isOpen) return null;

  const handleSend = () => {
    console.log({ communicationType, title, message });
    alert("Notification sent successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Send Notification</h2>
          <button onClick={onClose}>
            <MdClose className="text-2xl" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2">Communication Type:</label>
            <select
              className="w-full border p-2 rounded"
              value={communicationType}
              onChange={(e) => setCommunicationType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="Push">Push Notification</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Title:</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
            />
          </div>

          <div>
            <label className="block mb-2">Message:</label>
            <textarea
              className="w-full border p-2 rounded h-24"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
            />
          </div>

          <button
            onClick={handleSend}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple Update Modal
const UpdateModal = ({ isOpen, onClose, onSave, userData }) => {
  const [formData, setFormData] = useState(userData || {});

  useEffect(() => {
    setFormData(userData || {});
  }, [userData]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Update User</h2>
          <button onClick={onClose}>
            <MdClose className="text-2xl" />
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={formData.name || ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Name"
          />
          <input
            type="email"
            className="w-full border p-2 rounded"
            value={formData.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="Email"
          />
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={formData.phone || ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="Phone"
          />
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Address"
          />

          <button
            onClick={handleSave}
            className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

const Category = () => {
  const [communicationType, setCommunicationType] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Reduced for better display
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState(notificationData);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsUpdateModalOpen(true);
  };

  const handleUpdate = (updatedUserData) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === updatedUserData.id ? updatedUserData : notification
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      setNotifications(
        notifications.filter((notification) => notification.id !== id)
      );
      alert("Notification has been deleted.");
    }
  };

  const handleSendNotification = () => {
    if (!communicationType || !title || !message) {
      alert("Please fill all fields");
      return;
    }

    alert("Notification sent successfully!");
    setCommunicationType("");
    setTitle("");
    setMessage("");
  };

  const filteredSubscribers = notifications.filter((subscriber) => {
    const matchesSearch =
      subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterOption === "All") return matchesSearch;
    if (filterOption === "Email") return matchesSearch && subscriber.email;
    if (filterOption === "Phone") return matchesSearch && subscriber.phone;
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const displayedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="h-screen flex gap-4 p-4">
      {/* Left Side - Notification Form (1/2 screen) */}
      <div className="w-1/2 bg-white border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Send Notification
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">
              Communication Type:
            </label>
            <select
              className="w-full border p-3 rounded-md focus:outline-none focus:border-blue-500"
              value={communicationType}
              onChange={(e) => setCommunicationType(e.target.value)}
            >
              <option value="">Select Communication Type</option>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="Push">Push Notification</option>
              <option value="All">All Channels</option>
            </select>
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Notification Title:
            </label>
            <input
              type="text"
              className="w-full border p-3 rounded-md focus:outline-none focus:border-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Message:</label>
            <textarea
              className="w-full border p-3 rounded-md h-32 focus:outline-none focus:border-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your notification message here..."
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSendNotification}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              <MdSend className="text-xl" />
              Send Notification
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600"
            >
              Send via Modal
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-medium mb-2">Quick Stats:</h3>
          <p className="text-sm text-gray-600">
            Total Subscribers: {notifications.length}
          </p>
          <p className="text-sm text-gray-600">
            Filtered Results: {filteredSubscribers.length}
          </p>
        </div>
      </div>

      {/* Right Side - Subscribers Table (1/2 screen) */}
      <div className="w-1/2 bg-white border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Subscribers List
        </h2>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search subscribers..."
            className="flex-1 border p-2 rounded-md focus:outline-none focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="border p-2 rounded-md focus:outline-none focus:border-blue-500"
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-auto" style={{ height: "calc(100% - 200px)" }}>
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-gray-100">
              <tr className="border-b">
                <th className="p-2 text-left">#</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedSubscribers.map((notification, index) => (
                <tr key={notification.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={notification.image}
                        alt={notification.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="truncate">{notification.name}</span>
                    </div>
                  </td>
                  <td className="p-2 truncate">{notification.email}</td>
                  <td className="p-2">{notification.phone}</td>
                  <td className="p-2">
                    <div className="flex gap-1">
                      <button
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                        onClick={() => handleEdit(notification)}
                      >
                        <MdModeEditOutline className="text-sm" />
                      </button>
                      <button
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <MdDelete className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-gray-300 px-2 py-1 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            <MdKeyboardArrowLeft className="text-xl" />
          </button>

          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }

            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1 rounded text-sm ${
                  currentPage === pageNum
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="bg-gray-300 px-2 py-1 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            <MdKeyboardArrowRight className="text-xl" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {isUpdateModalOpen && selectedUser && (
        <UpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSave={handleUpdate}
          userData={selectedUser}
        />
      )}
    </div>
  );
};

export default Category;
