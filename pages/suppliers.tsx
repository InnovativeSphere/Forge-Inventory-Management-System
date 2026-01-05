"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";

import {
  fetchAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  searchSuppliers,
} from "../redux/slices/supplierSlice";

import { Supplier, SupplierPayload } from "../redux/apiUtils/supplierApi";

import SupplierDetails from "../components/SupplierDetails";
import EditSupplier from "../components/EditSupplier";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

import { FaSearch, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import AuthGuard from "../components/AuthGuard";
import { createPortal } from "react-dom";
import "../app/global.css";

function SupplierPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const { suppliers, loading } = useSelector(
    (state: RootState) => state.supplier
  );

  const normalizedSuppliers = useMemo(
    () =>
      suppliers.map((s: any) => ({
        ...s,
        id: s.id ?? s._id,
      })),
    [suppliers]
  );

  const [form, setForm] = useState<SupplierPayload>({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
  });

  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const hasFetched = useRef(false);
  useEffect(() => {
    if (!hasFetched.current) {
      dispatch(fetchAllSuppliers() as any);
      hasFetched.current = true;
    }
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const isFormEmpty =
    !form.name && !form.company && !form.email && !form.phone && !form.address;

  const handleCreate = async () => {
    if (isFormEmpty) return;
    await dispatch(createSupplier(form) as any);
    setForm({ name: "", company: "", email: "", phone: "", address: "" });
    dispatch(fetchAllSuppliers() as any);
  };

  const handleUpdate = async (updated: Partial<Supplier>) => {
    if (!editSupplier) return;
    await dispatch(
      updateSupplier({ id: editSupplier.id, payload: updated }) as any
    );
    setEditSupplier(null);
    dispatch(fetchAllSuppliers() as any);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(deleteSupplier(deleteId) as any);
    setDeleteId(null);
    dispatch(fetchAllSuppliers() as any);
  };

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      if (!query) dispatch(fetchAllSuppliers() as any);
      else dispatch(searchSuppliers(query) as any);
    },
    [dispatch]
  );

  // Portal helper to render modals over everything
  const ModalPortal = ({ children }: { children: React.ReactNode }) => {
    if (typeof window === "undefined") return null;
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
        {children}
      </div>,
      document.body
    );
  };

  return (
    <div className="max-w-6xl p-4 mx-auto sm:px-6 py-6 space-y-6 fade-in">
      {/* HEADER */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Supplier Management
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Create, edit, and manage suppliers
        </p>
      </div>

      {/* CREATE FORM */}
      <Card className="card p-4 sm:p-5 space-y-4">
        <h2 className="text-base sm:text-lg font-semibold">Add Supplier</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Supplier name"
            className="input"
          />
          <input
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Company"
            className="input"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="input"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="input"
          />
        </div>

        <input
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address"
          className="input w-full"
        />

        <Button variant="primary" onClick={handleCreate} disabled={isFormEmpty}>
          Create Supplier
        </Button>
      </Card>

      {/* SEARCH */}
      <Card className="card p-3 max-w-md">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-accent)] text-sm" />
          <input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search suppliers..."
            className="input pl-10 py-2"
          />
        </div>
      </Card>

      {/* SUPPLIER LIST */}
      <div className="space-y-3">
        {loading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {!loading &&
          normalizedSuppliers.map((sup) => (
            <Card
              key={sup.id}
              className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:shadow-[var(--shadow-lift)]"
            >
              <div>
                <p className="font-semibold">{sup.name}</p>
                {sup.company && (
                  <p className="text-sm text-[var(--color-muted)]">
                    {sup.company}
                  </p>
                )}
              </div>

              <div className="flex gap-4 text-[var(--color-accent)]">
                <button
                  onClick={() => setSelectedSupplier(sup)}
                  className="p-1"
                >
                  <FaEye />
                </button>
                <button onClick={() => setEditSupplier(sup)} className="p-1">
                  <FaEdit />
                </button>
                <button
                  onClick={() => setDeleteId(sup.id)}
                  className="p-1 text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            </Card>
          ))}
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <ModalPortal>
          <div className="bg-black/40 backdrop-blur-sm w-full max-w-sm sm:max-w-md p-4 rounded-lg">
            <Card className="p-5 space-y-3">
              <p className="font-semibold text-lg">Delete supplier?</p>
              <p className="text-sm text-[var(--color-muted)]">
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setDeleteId(null)}>
                  Cancel
                </Button>
                <Button
                  className="bg-red-400 hover:bg-red-500"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        </ModalPortal>
      )}

      {/* SUPPLIER DETAILS MODAL */}
      {selectedSupplier && (
        <ModalPortal>
          <SupplierDetails
            supplier={selectedSupplier}
            onClose={() => setSelectedSupplier(null)}
          />
        </ModalPortal>
      )}

      {/* EDIT SUPPLIER MODAL */}
      {editSupplier && (
        <ModalPortal>
          <EditSupplier
            supplier={editSupplier}
            onClose={() => setEditSupplier(null)}
            onSave={handleUpdate}
          />
        </ModalPortal>
      )}
    </div>
  );
}

export default function SupplierPage() {
  return (
    <AuthGuard>
      <SupplierPageContent />
    </AuthGuard>
  );
}
