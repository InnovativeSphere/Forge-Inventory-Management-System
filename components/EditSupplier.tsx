"use client";

import React, { useState, useEffect } from "react";
import { Supplier } from "../redux/apiUtils/supplierApi";

interface Props {
  supplier: Supplier | null;
  onClose: () => void;
  onSave: (updated: Partial<Supplier>) => void;
  isLoading?: boolean;
}

export default function EditSupplier({
  supplier,
  onClose,
  onSave,
  isLoading = false,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (supplier) {
      setForm({
        name: supplier.name || "",
        company: supplier.company || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
      });
    }
  }, [supplier]);

  if (!supplier) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 fade-in p-4">
      <div className="card w-full max-w-md p-6 rounded-xl space-y-4 relative scale-in">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header */}
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight">Edit Supplier</h2>
          <p className="text-sm text-[var(--color-muted)]">Update supplier information</p>
        </div>

        {/* Form */}
        <div className="space-y-2">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="Company" name="company" value={form.company} onChange={handleChange} />
          <Input label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Textarea label="Address" name="address" value={form.address} onChange={handleChange} rows={2} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-sm border border-[var(--color-border)] bg-[var(--color-surface)] interactive"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 rounded-md text-sm text-white bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] interactive"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small, compact reusable inputs ---------- */

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-[var(--color-muted)]">{label}</label>
      <input
        {...props}
        className="w-full px-2 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
    </div>
  );
}

function Textarea({
  label,
  rows = 2,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-[var(--color-muted)]">{label}</label>
      <textarea
        {...props}
        rows={rows}
        className="w-full px-2 py-1.5 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
      />
    </div>
  );
}
