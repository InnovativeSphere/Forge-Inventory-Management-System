"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import { fetchAllStockHistory } from "../redux/slices/stockHistorySlice";
import { fetchCurrentUser } from "../redux/slices/userSlice";
import { StockHistory } from "../redux/apiUtils/stockHistoryApi";

import { Card } from "../components/Card";
import { Spinner } from "../components/Spinner";

import "../app/global.css";

/* -------------------------------- CARD -------------------------------- */

interface CardProps {
  entry: StockHistory;
  currentUser: { username: string } | null;
}

function ViewStockHistoryCard({ entry, currentUser }: CardProps) {
  const note = entry.note?.trim() || "No additional note";
  const changedBy =
    entry.changedBy?.username || currentUser?.username || "System";
  const productName = entry.product?.name || "Unknown Product";

  return (
    <Card className="p-4 rounded-xl space-y-3 border border-[var(--color-border)]">
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-base text-[var(--color-foreground)]">
          {productName}
        </h3>
        <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent)/15] text-[var(--color-accent)]">
          {entry.action}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <p className="text-[var(--color-muted)]">
          Changed by
          <span className="block text-[var(--color-foreground)] font-medium">
            {changedBy}
          </span>
        </p>

        <p className="text-[var(--color-muted)]">
          Quantity
          <span className="block text-[var(--color-foreground)] font-medium">
            {entry.previousQuantity} → {entry.newQuantity}
          </span>
        </p>

        <p className="col-span-2 text-[var(--color-muted)]">
          Note
          <span className="block text-[var(--color-foreground)]">{note}</span>
        </p>
      </div>

      {/* Footer */}
      <p className="text-xs text-[var(--color-muted)]">
        {new Date(entry.createdAt).toLocaleString()}
      </p>
    </Card>
  );
}

/* ------------------------------ MAIN PAGE ------------------------------ */

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

  const filteredHistory = useMemo(() => {
    return history.filter((h) =>
      h.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [history, searchTerm]);

  const totalChanges = filteredHistory.length;
  const uniqueProducts = new Set(filteredHistory.map((h) => h.product?.id))
    .size;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 fade-in">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
          Stock History
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Complete log of all inventory changes
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full sm:max-w-sm
            px-3 py-2 rounded-lg
            bg-[var(--color-surface)]
            border border-[var(--color-border)]
            focus:outline-none
            focus:border-[var(--color-accent)]
          "
        />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-5 rounded-xl">
          <p className="text-sm text-[var(--color-muted)]">Total Changes</p>
          <p className="text-3xl font-bold">{totalChanges}</p>
        </Card>

        <Card className="p-5 rounded-xl">
          <p className="text-sm text-[var(--color-muted)]">Products Updated</p>
          <p className="text-3xl font-bold">{uniqueProducts}</p>
        </Card>
      </div>

      {/* States */}
      {loading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}

      {error && (
        <Card className="p-4 border border-red-500/30 text-red-500">
          {error}
        </Card>
      )}

      {!loading && filteredHistory.length === 0 && (
        <p className="text-center text-[var(--color-muted)]">
          No stock history found.
        </p>
      )}

      {/* History List */}
      <div className="space-y-4">
        {filteredHistory.map((entry) => (
          <ViewStockHistoryCard
            key={entry.id}
            entry={entry}
            currentUser={currentUser}
          />
        ))}
      </div>
    </div>
  );
}
