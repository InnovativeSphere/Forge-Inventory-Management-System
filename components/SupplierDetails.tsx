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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 fade-in p-2 sm:p-4">
      <div className="card w-full max-w-xs sm:max-w-xl p-4 sm:p-3 rounded-lg space-y-3 relative scale-in mx-2 sm:mx-4">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors text-sm sm:text-xs"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="space-y-0.5">
          <h2 className="text-lg sm:text-base font-semibold tracking-tight truncate">
            {supplier.name}
          </h2>
          {supplier.company && (
            <p className="text-xs sm:text-[10px] text-[var(--color-muted)] truncate">
              {supplier.company}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1 text-sm sm:text-xs leading-snug">
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
        <div className="pt-2 border-t border-[var(--color-border)] space-y-0.5 text-[var(--color-muted)] text-xs sm:text-[9px]">
          <p>Created: {new Date(supplier.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(supplier.updatedAt).toLocaleString()}</p>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-3">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm sm:text-xs interactive hover:shadow-[var(--shadow-soft)] transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
