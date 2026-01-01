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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 fade-in">
      <div className="card w-full max-w-lg p-8 rounded-xl space-y-6 relative scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {supplier.name}
          </h2>
          {supplier.company && (
            <p className="text-sm text-[var(--color-muted)]">
              {supplier.company}
            </p>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3 text-sm leading-relaxed">
          {supplier.email && (
            <p>
              <span className="font-medium text-[var(--color-muted)]">
                Email:
              </span>{" "}
              {supplier.email}
            </p>
          )}
          {supplier.phone && (
            <p>
              <span className="font-medium text-[var(--color-muted)]">
                Phone:
              </span>{" "}
              {supplier.phone}
            </p>
          )}
          {supplier.address && (
            <p>
              <span className="font-medium text-[var(--color-muted)]">
                Address:
              </span>{" "}
              {supplier.address}
            </p>
          )}
        </div>

        {/* Meta */}
        <div className="pt-4 border-t border-[var(--color-border)] space-y-2 text-xs text-[var(--color-muted)]">
          <p>
            Created:{" "}
            {new Date(supplier.createdAt).toLocaleString()}
          </p>
          <p>
            Updated:{" "}
            {new Date(supplier.updatedAt).toLocaleString()}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-sm interactive hover:shadow-[var(--shadow-soft)]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
