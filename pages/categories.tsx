"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import {
  fetchAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../redux/slices/categorySlice";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import '../app/global.css'

type FormState = {
  name: string;
  description: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  name: "",
  description: "",
  isActive: true,
};

export default function CategoryManager() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.category
  );

  const normalizedCategories = useMemo(
    () =>
      categories.map((c: any) => ({
        ...c,
        id: c.id ?? c._id,
      })),
    [categories]
  );

  const [createForm, setCreateForm] = useState<FormState>(emptyForm);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);

  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(fetchAllCategories({}) as any);
  }, [dispatch]);

  const filteredCategories = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return normalizedCategories;

    return normalizedCategories.filter((c) =>
      [c.name, c.description].some((v) =>
        v?.toLowerCase().includes(q)
      )
    );
  }, [search, normalizedCategories]);

  const handleCreateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setCreateForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setEditForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreate = async () => {
    await dispatch(createCategory({ payload: createForm }) as any);
    setCreateForm(emptyForm);
    dispatch(fetchAllCategories({}) as any);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    await dispatch(updateCategory({ _id: editId, payload: editForm }) as any);
    setEditId(null);
    setEditForm(emptyForm);
    dispatch(fetchAllCategories({}) as any);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await dispatch(deleteCategory({ _id: deleteId }) as any);
    setDeleteId(null);
    dispatch(fetchAllCategories({}) as any);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 fade-in">
      <h1 className="text-2xl font-semibold">Category Management</h1>

      {/* CREATE */}
      <Card className="p-5 space-y-4">
        <h2 className="text-base font-medium">Add Category</h2>

        {error && (
          <p className="text-sm text-[var(--color-accent)]">{error}</p>
        )}

        <input
          name="name"
          value={createForm.name}
          onChange={handleCreateChange}
          placeholder="Category name"
          className="input w-full"
        />

        <textarea
          name="description"
          value={createForm.description}
          onChange={handleCreateChange}
          placeholder="Description"
          className="input w-full min-h-[80px]"
        />

        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          <input
            type="checkbox"
            name="isActive"
            checked={createForm.isActive}
            onChange={handleCreateChange}
          />
          Active
        </label>

        <div className="pt-2">
          <Button size="sm" onClick={handleCreate} disabled={loading}>
            {loading ? <Spinner size="sm" /> : "Create Category"}
          </Button>
        </div>
      </Card>

      {/* SEARCH */}
      <Card className="p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories..."
            className="input w-full pl-8"
          />
        </div>
      </Card>

      {/* LIST */}
      <div className="space-y-3">
        {loading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {!loading &&
          filteredCategories.map((cat) => (
            <Card
              key={cat.id}
              className="p-4 flex justify-between items-start interactive"
            >
              <div className="space-y-1">
                <p className="font-medium">{cat.name}</p>

                {cat.description && (
                  <p className="text-sm text-[var(--color-muted)]">
                    {cat.description}
                  </p>
                )}

                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded-full border ${
                    cat.isActive
                      ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  {cat.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditId(cat.id);
                    setEditForm({
                      name: cat.name,
                      description: cat.description ?? "",
                      isActive: cat.isActive,
                    });
                  }}
                >
                  <FaEdit className="inline mr-1 text-xs" />
                  Edit
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setDeleteId(cat.id)}
                >
                  <FaTrash className="inline mr-1 text-xs" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
      </div>

      {/* EDIT MODAL */}
      {editId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-5 space-y-4 scale-in">
            <h2 className="text-base font-medium">Edit Category</h2>

            <input
              name="name"
              value={editForm.name}
              onChange={handleEditChange}
              className="input w-full"
            />

            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              className="input w-full min-h-[80px]"
            />

            <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
              <input
                type="checkbox"
                name="isActive"
                checked={editForm.isActive}
                onChange={handleEditChange}
              />
              Active
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleUpdate}>
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <Card className="p-5 space-y-4 scale-in">
            <p className="font-medium">Delete this category?</p>

            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
