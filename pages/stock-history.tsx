"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import { fetchAllStockHistory } from "../redux/slices/stockHistorySlice";
import { fetchCurrentUser } from "../redux/slices/userSlice";
import { StockHistory } from "../redux/apiUtils/stockHistoryApi";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

import "../app/global.css";

// --- Card Component ---
interface CardProps {
  entry: StockHistory;
  currentUser: { username: string } | null;
}

function ViewStockHistoryCard({ entry, currentUser }: CardProps) {
  const note = entry.note?.trim() || "No additional note";
  const changedBy = entry.changedBy?.username || currentUser?.username || "System";
  const productName = entry.product?.name || "Unknown Product";

  return (
    <Card className="px-4 py-3 mb-3 space-y-2">
      <h3 className="font-semibold text-lg">{productName}</h3>
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
        <p className="col-span-2 text-xs text-[var(--color-muted)]">
          {new Date(entry.createdAt).toLocaleString()}
        </p>
      </div>
    </Card>
  );
}

// --- Main Stock Page ---
export default function StockHistoryPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { history, loading, error } = useSelector(
    (state: RootState) => state.stockHistory
  );
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchCurrentUser({}));
    dispatch(fetchAllStockHistory());
  }, [dispatch]);

  const filteredHistory = useMemo(
    () =>
      history.filter((h) =>
        h.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [history, searchTerm]
  );

  const totalChanges = filteredHistory.length;
  const uniqueProducts = Array.from(new Set(filteredHistory.map((h) => h.product?.id))).length;

  return (
    <div className="p-6 max-w-6xl mx-auto fade-in space-y-6">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Stock History</h1>
        <p className="text-sm text-[var(--color-muted)]">
          View all product stock changes
        </p>
      </div>

      {/* SEARCH */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input w-full border border-[var(--color-border)] focus:border-[var(--color-accent)] pl-3 py-2"
        />
      </div>

      {/* KPI CARDS */}
      <div className="flex gap-4 flex-wrap">
        <Card className="flex-1 p-4">
          <p className="text-sm text-[var(--color-muted)]">Total Changes</p>
          <p className="text-2xl font-bold">{totalChanges}</p>
        </Card>
        <Card className="flex-1 p-4">
          <p className="text-sm text-[var(--color-muted)]">Products Updated</p>
          <p className="text-2xl font-bold">{totalChanges}</p>
        </Card>
      </div>

      {/* STATUS / LOADER */}
      {loading && (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && filteredHistory.length === 0 && (
        <p className="text-gray-700">No stock history found.</p>
      )}

      {/* STOCK HISTORY LIST */}
      <div className="space-y-2">
        {filteredHistory.map((entry) => (
          <ViewStockHistoryCard key={entry.id} entry={entry} currentUser={currentUser} />
        ))}
      </div>
    </div>
  );
}
