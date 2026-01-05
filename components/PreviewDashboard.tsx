"use client";

import { useSelector } from "react-redux";
import type { RootState } from "../redux/store/store";

import { Card } from "./Card";
import { Spinner } from "./Spinner";
import {
  FaBoxOpen,
  FaUsers,
  FaExclamationTriangle,
  FaTimes,
} from "react-icons/fa";
import AuthGuard from "./AuthGuard";

type DashboardPreviewProps = {
  onClose: () => void;
};

export default function DashboardPreview({ onClose }: DashboardPreviewProps) {
  // Redux slices (READ ONLY)
  const { products = [], loading: productsLoading } = useSelector(
    (state: RootState) => state.product
  );

  const { allUsers = [], loading: usersLoading } = useSelector(
    (state: RootState) => state.user
  );

  const { history = [], loading: historyLoading } = useSelector(
    (state: RootState) => state.stockHistory
  );

  const lowStock = products.filter((p) => p.quantity <= 5).length;

  return (
    <AuthGuard>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Sidebar Preview */}
        <aside className="relative w-80 h-full bg-[var(--color-card)] p-4 overflow-y-auto z-50">
          {/* Close Button */}
          <div className="flex justify-end mb-3">
            <button
              onClick={onClose}
              className="text-[var(--color-muted)] hover:text-red-500 transition text-lg"
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          <h4 className="text-base font-bold mb-4">Dashboard Preview</h4>

          {/* Stats */}
          <div className="flex flex-col gap-3 mb-5 text-xs">
            <Card className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <FaBoxOpen className="text-[var(--color-accent)]" />
                <span>Products</span>
              </div>
              <span>
                {productsLoading ? <Spinner size="sm" /> : products.length}
              </span>
            </Card>

            <Card className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <FaUsers className="text-[var(--color-accent)]" />
                <span>Users</span>
              </div>
              <span>
                {usersLoading ? <Spinner size="sm" /> : allUsers.length}
              </span>
            </Card>

            <Card className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                <span>Low Stock</span>
              </div>
              <span className="text-red-500 font-semibold">
                {productsLoading ? <Spinner size="sm" /> : lowStock}
              </span>
            </Card>
          </div>

          {/* Recent Stock History */}
          <section className="mt-2 text-xs">
            <h5 className="font-semibold mb-2">Recent Stock Updates</h5>

            {historyLoading ? (
              <div className="py-2">
                <Spinner size="sm" />
              </div>
            ) : history.length ? (
              history
                .slice(-5)
                .reverse()
                .map((h) => (
                  <Card
                    key={h.id}
                    className="p-2 mb-2 flex justify-between items-center"
                  >
                    <span className="truncate max-w-[65%]">
                      {h.product?.name}
                    </span>
                    <span className="text-[var(--color-primary)] whitespace-nowrap">
                      {h.previousQuantity} → {h.newQuantity}
                    </span>
                  </Card>
                ))
            ) : (
              <p className="text-[var(--color-muted)]">No stock updates</p>
            )}
          </section>
        </aside>
      </div>
    </AuthGuard>
  );
}
