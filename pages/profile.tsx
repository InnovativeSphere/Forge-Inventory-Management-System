"use client";

import { useEffect, useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCurrentUser,
  updateProfile,
  deleteUserByAdmin,
} from "../redux/slices/userSlice";
import type { RootState, AppDispatch } from "../redux/store/store";
import { useRouter } from "next/navigation";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaImage,
  FaKey,
} from "react-icons/fa";
import "../app/global.css";

type ModalState = {
  open: boolean;
  type: "success" | "error" | "confirm-delete";
  message: string;
};

export default function ProfilePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { user, token, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    phone: "",
    profilePicture: "",
    password: "",
    theme: "light",
  });

  const [showPasswordCard, setShowPasswordCard] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    open: false,
    type: "success",
    message: "",
  });

  useEffect(() => {
    if (!user && token) {
      dispatch(fetchCurrentUser({ token }));
    }

    if (user) {
      setFormData({
        username: user.username || "",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profilePicture: user.profilePicture || "",
        password: "",
        theme: user.theme || "light",
      });
    }
  }, [user, token, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const result = await dispatch(updateProfile({ updateData: formData }));

    if (updateProfile.fulfilled.match(result)) {
      setModal({
        open: true,
        type: "success",
        message: "Profile updated successfully.",
      });
    } else {
      setModal({
        open: true,
        type: "error",
        message: error || "Failed to update profile.",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) return;

    const result = await dispatch(deleteUserByAdmin(user._id));

    if (deleteUserByAdmin.fulfilled.match(result)) {
      setModal({
        open: true,
        type: "success",
        message: "Account deleted successfully.",
      });

      setTimeout(() => {
        router.replace("/login");
      }, 1500);
    } else {
      setModal({
        open: true,
        type: "error",
        message: "Failed to delete account.",
      });
    }
  };

  const firstLetterAvatar = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <main className="min-h-screen bg-[var(--color-background)] p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Profile Header */}
        <Card className="flex items-center gap-6 p-6 rounded-3xl shadow-lg">
          {formData.profilePicture ? (
            <img
              src={formData.profilePicture}
              alt="Profile"
              className="w-28 h-28 rounded-full border-2 border-[var(--color-accent)] object-cover"
            />
          ) : (
            <div className="w-28 h-28 rounded-full border-2 border-[var(--color-accent)] flex items-center justify-center text-3xl font-bold text-[var(--color-accent)]">
              {firstLetterAvatar}
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
              {user?.name}
            </h2>
            <p className="text-[var(--color-muted)]">{user?.role ?? "Staff"}</p>
            <p className="text-sm text-[var(--color-muted)] mt-1">
              Theme: {user?.theme}
            </p>
          </div>
        </Card>

        {/* Profile Form */}
        <Card className="p-8 rounded-3xl shadow-lg">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Username */}
            <div className="flex flex-col relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                className="input pl-11 py-4 rounded-xl"
              />
            </div>

            {/* Full Name */}
            <div className="flex flex-col relative">
              <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="input pl-11 py-4 rounded-xl"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="input pl-11 py-4 rounded-xl"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col relative">
              <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="input pl-11 py-4 rounded-xl"
              />
            </div>

            {/* Profile Picture */}
            <div className="flex flex-col relative">
              <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                name="profilePicture"
                value={formData.profilePicture}
                onChange={handleChange}
                placeholder="Profile Picture URL"
                className="input pl-11 py-4 rounded-xl"
              />
            </div>

            {/* Theme */}
            <div className="flex flex-col">
              <label className="text-[var(--color-muted)] mb-1">Theme</label>
              <select
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                className="input py-4 rounded-xl"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            {/* Password */}
            <div className="col-span-1 md:col-span-2">
              <button
                type="button"
                onClick={() => setShowPasswordCard((v) => !v)}
                className="w-full px-4 py-4 rounded-xl bg-[var(--color-accent)] text-white font-semibold hover:brightness-110 transition"
              >
                {showPasswordCard ? "Hide Security Settings" : "Change Password"}
              </button>

              {showPasswordCard && (
                <div className="relative mt-4">
                  <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    placeholder="New Password"
                    className="input pl-11 py-4 rounded-xl"
                  />
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="col-span-1 md:col-span-2">
              <Button
                type="submit"
                size="md"
                variant="primary"
                disabled={loading}
                className="w-full py-4 rounded-xl"
              >
                {loading ? <Spinner size="sm" /> : "Update Profile"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-[var(--color-card)] border border-red-500/30 p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-red-500 mb-3">Danger Zone</h3>
          <Button
            onClick={() =>
              setModal({
                open: true,
                type: "confirm-delete",
                message:
                  "This will permanently delete your account. This action cannot be undone.",
              })
            }
            variant="secondary"
            className="text-red-500 hover:bg-red-100 w-full"
          >
            Delete Account
          </Button>
        </Card>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--color-card)] p-6 rounded-xl max-w-sm w-full text-center">
            <p className="text-[var(--color-foreground)] mb-4">
              {modal.message}
            </p>

            {modal.type === "confirm-delete" ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleDeleteAccount}
                  variant="primary"
                  className="flex-1 py-3 rounded-xl"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setModal({ ...modal, open: false })}
                  variant="secondary"
                  className="flex-1 py-3 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setModal({ ...modal, open: false })}
                variant="primary"
                className="w-full py-3 rounded-xl"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
