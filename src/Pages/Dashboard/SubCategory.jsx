import React, { useState } from "react";
import { CiExport } from "react-icons/ci";

const invoiceData = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  date: `2025-02-${String(i + 1).padStart(2, "0")}`,
  name: `Insert Customer name here ${i + 1}`,
  invoice: `Invoice Number -${1000 + i + 1}`,
  amount: (Math.random() * 500 + 100).toFixed(2),
  status: ["Paid", "Pending", "Overdue"][i % 3],
  image:
    "https://img.freepik.com/free-photo/horizontal-portrait-smiling-happy-young-pleasant-looking-female-wears-denim-shirt-stylish-glasses-with-straight-blonde-hair-expresses-positiveness-poses_176420-13176.jpg?t=st=1738490190~exp=1738493790~hmac=b46cc36bc7e142f100004fb36314caa6d6f130ca212ab54356fd31b979663135&w=1380",
}));

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const InvoiceTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState("February");
  const itemsPerPage = 10;

  const totalPages = Math.ceil(invoiceData.length / itemsPerPage);
  const displayedInvoices = invoiceData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4">
      <div className="flex gap-6 px-2 rounded-md text-[#5C5C5C]  justify-end items-center mb-4">
        <select
          className="border p-2 rounded bg-white"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
        <button className="  px-4 py-2 bg-white text-[#5C5C5C] flex items-center gap-1 border-[#C0C0C0] border-2 rounded">
          <CiExport />
          Export
        </button>
      </div>
      <table className="w-full border-collapse shadow-lg rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-300 text-left">
            <th className="p-2 text-center">
           
              <input type="checkbox" />
            </th>
            <th className="p-2 text-center">
              
              Date
            </th>
            <th className="p-2 text-center">
             
              Name
            </th>
            <th className="p-2 text-center">
             
              Invoice
            </th>
            <th className="p-2 text-center">
             
              Amount
            </th>
            <th className="p-2 text-center">
            
              Status
            </th>
            <th className="p-2 text-center">
             
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {displayedInvoices.map((invoice) => (
            <tr
              key={invoice.id}
              className="border-b border-gray-300 text-center"
            >
              <td className="p-2">
                <input type="checkbox" />
              </td>
              <td className="p-2">{invoice.date}</td>
              <td className="flex items-center gap-2 p-2 justify-start">
                <img
                  src={invoice.image}
                  alt={invoice.name}
                  className="w-10 h-10 rounded-full"
                />
                <p>{invoice.name}</p>
              </td>
              <td className="p-2">{invoice.invoice}</td>
              <td className="p-2">${invoice.amount}</td>
              <td
                className={`p-2 font-semibold ${
                  invoice.status === "Paid"
                    ? "text-green-500"
                    : invoice.status === "Pending"
                    ? "text-yellow-500"
                    : "text-red-500"
                }`}
              >
                {invoice.status}
              </td>
              <td className="p-2 flex gap-2 justify-center">
                <button className="bg-yellow-400 text-white px-2 py-1 rounded">
                  👁
                </button>
                <button className="bg-red-500 text-white px-2 py-1 rounded">
                  🗑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
        >
          ◀
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1 ? "bg-blue-500 text-white" : "bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default InvoiceTable;
