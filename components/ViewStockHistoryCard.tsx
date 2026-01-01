"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import { fetchAllStockHistory } from "../redux/slices/stockHistorySlice";
import "../app/global.css";
import { StockHistory } from "@/redux/apiUtils/stockHistoryApi";

// --- Card Component ---
interface CardProps {
  entry: StockHistory;
}

function ViewStockHistoryCard({ entry }: CardProps) {
  const note = entry.note?.trim() || "No additional note";
  const changedBy = entry.changedBy?.username || "System";
  const productName = entry.product?.name || "Unknown Product";

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md border border-gray-200 mb-4">
      <h3 className="font-bold text-lg mb-2">{productName}</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>
          <span className="font-medium">Changed By:</span> {changedBy}
        </p>
        <p>
          <span className="font-medium">Action:</span> {entry.action}
        </p>
        <p>
          <span className="font-medium">Previous Qty:</span> {entry.previousQuantity}
        </p>
        <p>
          <span className="font-medium">New Qty:</span> {entry.newQuantity}
        </p>
        <p className="col-span-2">
          <span className="font-medium">Note:</span> {note}
        </p>
        <p className="col-span-2 text-gray-500 text-xs">
          {new Date(entry.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

// --- Main Stock Page ---
export default function StockHistoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading, error } = useSelector(
    (state: RootState) => state.stockHistory
  );

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllStockHistory());
  }, [dispatch]);

  // Safe filter by product name
  const filteredHistory = history.filter((h) =>
    h.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalChanges = filteredHistory.length;
  const uniqueProducts = Array.from(
    new Set(filteredHistory.map((h) => h.product?.id))
  ).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      <h1 className="text-3xl font-bold mb-6">Stock History</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      {/* KPI Cards */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="flex-1 p-4 bg-white rounded-md shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Total Changes</p>
          <p className="text-2xl font-bold">{totalChanges}</p>
        </div>
        <div className="flex-1 p-4 bg-white rounded-md shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-500">Products Updated</p>
          <p className="text-2xl font-bold">{uniqueProducts}</p>
        </div>
      </div>

      {/* Status Messages */}
      {loading && <p className="text-gray-600">Loading stock history...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && filteredHistory.length === 0 && (
        <p className="text-gray-700">No stock history found.</p>
      )}

      {/* Stock History List */}
      <div>
        {filteredHistory.map((entry) => (
          <ViewStockHistoryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
