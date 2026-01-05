"use client";

import React from "react";
import { Supplier } from "../redux/apiUtils/supplierApi";

interface Props {
  supplier: Supplier | null;
  onClose: () => void;
}

export default function SupplierDetails({ supplier, onClose }: Props) {
  if (!supplier) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center px-4 sm:px-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-[var(--color-surface)] rounded-lg shadow-2xl border border-[var(--color-border)] flex flex-col max-h-[85vh] overflow-hidden p-4 sm:p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-foreground)] truncate">
              {supplier.name}
            </h2>
            {supplier.company && (
              <p className="text-xs sm:text-sm text-[var(--color-muted)] truncate">
                {supplier.company}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors text-lg sm:text-xl"
          >
            ×
          </button>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto space-y-2 text-sm sm:text-base">
          {supplier.email && (
            <p>
              <span className="font-medium text-[var(--color-muted)]">Email:</span>{" "}
              {supplier.email}
            </p>
          )}
          {supplier.phone && (
            <p>
              <span className="font-medium text-[var(--color-muted)]">Phone:</span>{" "}
              {supplier.phone}
            </p>
          )}
          {supplier.address && (
            <p>
              <span className="font-medium text-[var(--color-muted)]">Address:</span>{" "}
              {supplier.address}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="pt-2 border-t border-[var(--color-border)] text-[var(--color-muted)] text-xs sm:text-[10px] space-y-0.5">
          <p>Created: {new Date(supplier.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(supplier.updatedAt).toLocaleString()}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm sm:text-xs hover:shadow-lg transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
