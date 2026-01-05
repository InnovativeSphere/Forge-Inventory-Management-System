"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
import AuthGuard from "../components/AuthGuard";
import "../app/global.css";

type FilterType = "all" | "admin" | "staff" | "active";

function UserManagementContent() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    allUsers = [],
    loading,
    error,
  } = useSelector((state: RootState) => state.user);

  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editCache, setEditCache] = useState<any>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    dispatch(fetchAllUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    let users = [...allUsers];

    if (filter === "admin") users = users.filter((u) => u.role === "admin");
    if (filter === "staff") users = users.filter((u) => u.role === "staff");
    if (filter === "active") users = users.filter((u) => u.isActive);

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
    if (updateUserByAdmin.fulfilled.match(result)) cancelEdit();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("This user will be permanently deleted. Continue?")) return;
    setActionLoading(id);
    await dispatch(deleteUserByAdmin(id));
    setActionLoading(null);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold">User Management</h1>

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
      <Card className="p-3 sm:p-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input w-full pl-8 text-sm"
          />
        </div>
      </Card>

      {error && <p className="text-sm text-[var(--color-accent)]">{error}</p>}

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredUsers.map((user: any) => {
            const isEditing = editingUserId === user._id;

            return (
              <Card
                key={user._id}
                className="p-4 sm:p-5 space-y-4 transition hover:shadow-md hover:border-[var(--color-accent)]"
              >
                {/* Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[var(--color-border)] object-cover"
                  />

                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        className="input w-full text-sm mb-1"
                        value={editCache.name}
                        onChange={(e) =>
                          setEditCache({ ...editCache, name: e.target.value })
                        }
                      />
                    ) : (
                      <p className="font-medium text-sm sm:text-base truncate">
                        {user.name}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-[var(--color-muted)] truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-muted)]">Role</span>
                    {isEditing ? (
                      <select
                        className="input py-1 text-xs"
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

                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-muted)]">Status</span>
                    <span
                      className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full border ${
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

export default function UserManagementPage() {
  return (
    <AuthGuard>
      <UserManagementContent />
    </AuthGuard>
  );
}
