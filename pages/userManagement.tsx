"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
} from "../redux/slices/userSlice";
import type { RootState, AppDispatch } from "../redux/store/store";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

import { FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import '../app/global.css'

type FilterType = "all" | "admin" | "staff" | "active";

export default function UserManagementPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { allUsers = [], loading, error } = useSelector(
    (state: RootState) => state.user
  );

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editCache, setEditCache] = useState<any>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    let users = [...allUsers];

    switch (filter) {
      case "admin":
        users = users.filter((u) => u.role === "admin");
        break;
      case "staff":
        users = users.filter((u) => u.role === "staff");
        break;
      case "active":
        users = users.filter((u) => u.isActive === true);
        break;
    }

    const q = search.toLowerCase().trim();
    if (!q) return users;

    return users.filter((u) =>
      [u.name, u.email].some((v) => v?.toLowerCase().includes(q))
    );
  }, [allUsers, filter, search]);

  const startEdit = (user: any) => {
    setEditingUserId(user._id);
    setEditCache({ ...user });
  };

  const cancelEdit = () => {
    setEditingUserId(null);
    setEditCache({});
  };

  const saveEdit = async () => {
    if (!editingUserId) return;

    setActionLoading(editingUserId);
    const result = await dispatch(
      updateUserByAdmin({ id: editingUserId, data: editCache })
    );
    setActionLoading(null);

    if (updateUserByAdmin.fulfilled.match(result)) {
      cancelEdit();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("This user will be permanently deleted. Continue?")) return;

    setActionLoading(id);
    await dispatch(deleteUserByAdmin(id));
    setActionLoading(null);
  };

  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold">User Management</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", value: "all" },
            { label: "Admins", value: "admin" },
            { label: "Staff", value: "staff" },
            { label: "Active", value: "active" },
          ].map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={filter === f.value ? "primary" : "secondary"}
              onClick={() => setFilter(f.value as FilterType)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input w-full pl-8"
          />
        </div>
      </Card>

      {error && (
        <p className="text-sm text-[var(--color-accent)]">{error}</p>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">
          No users match the current filter.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredUsers.map((user: any) => {
            const isEditing = editingUserId === user._id;

            return (
              <Card
                key={user._id}
                className="p-5 space-y-4 interactive"
              >
                {/* Header */}
                <div className="flex items-center gap-4">
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-12 h-12 rounded-full border border-[var(--color-border)] object-cover"
                  />

                  <div className="flex-1">
                    {isEditing ? (
                      <input
                        className="input w-full mb-1"
                        value={editCache.name}
                        onChange={(e) =>
                          setEditCache({ ...editCache, name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium">{user.name}</p>
                    )}

                    <p className="text-sm text-[var(--color-muted)]">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Role</span>
                    {isEditing ? (
                      <select
                        className="input py-1"
                        value={editCache.role}
                        onChange={(e) =>
                          setEditCache({ ...editCache, role: e.target.value })
                        }
                      >
                        <option value="admin">Admin</option>
                        <option value="staff">Staff</option>
                      </select>
                    ) : (
                      <span className="capitalize">{user.role}</span>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[var(--color-muted)]">Status</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        user.isActive
                          ? "border-[var(--color-accent)] text-[var(--color-accent)]"
                          : "border-[var(--color-border)] text-[var(--color-muted)]"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        onClick={saveEdit}
                        disabled={actionLoading === user._id}
                      >
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" onClick={cancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => startEdit(user)}
                      >
                        <FaEdit className="inline mr-1 text-xs" />
                        Edit
                      </Button>

                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleDelete(user._id)}
                        disabled={actionLoading === user._id}
                      >
                        <FaTrash className="inline mr-1 text-xs" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
