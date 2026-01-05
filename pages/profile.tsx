"use client";

import { useEffect, useState, FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCurrentUser,
  updateProfile,
  deleteUserByAdmin,
  logoutUser,
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
import AuthGuard from "../components/AuthGuard";
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
    if (!user && token) dispatch(fetchCurrentUser({ token }));
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

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const result = await dispatch(updateProfile({ updateData: formData }));

    setModal({
      open: true,
      type: updateProfile.fulfilled.match(result) ? "success" : "error",
      message: updateProfile.fulfilled.match(result)
        ? "Profile updated successfully."
        : error || "Failed to update profile.",
    });
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) return;
    const result = await dispatch(deleteUserByAdmin(user._id));

    setModal({
      open: true,
      type: deleteUserByAdmin.fulfilled.match(result) ? "success" : "error",
      message: deleteUserByAdmin.fulfilled.match(result)
        ? "Account deleted successfully."
        : "Failed to delete account.",
    });

    if (deleteUserByAdmin.fulfilled.match(result)) {
      setTimeout(() => router.replace("/login"), 1500);
    }
  };

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) router.replace("/login");
    else {
      setModal({
        open: true,
        type: "error",
        message: "Logout failed",
      });
    }
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <AuthGuard>
      <main className="min-h-screen bg-[var(--color-background)] px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <Card className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 p-4 sm:p-6 rounded-2xl hover:shadow-md transition">
            {formData.profilePicture ? (
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 border-[var(--color-accent)] object-cover"
              />
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 border-[var(--color-accent)] flex items-center justify-center text-2xl sm:text-3xl font-bold text-[var(--color-accent)]">
                {avatarLetter}
              </div>
            )}

            <div className="text-center sm:text-left">
              <h2 className="text-lg sm:text-2xl font-bold">
                {user?.name}
              </h2>
              <p className="text-sm text-[var(--color-muted)] capitalize">
                {user?.role ?? "Staff"}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Theme: {user?.theme}
              </p>
            </div>
          </Card>

          {/* Profile Form */}
          <Card className="p-4 sm:p-8 rounded-2xl">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6" onSubmit={handleSubmit}>
              {[
                { name: "username", icon: FaUser, placeholder: "Username" },
                { name: "name", icon: FaUser, placeholder: "Full Name" },
                { name: "email", icon: FaEnvelope, placeholder: "Email", type: "email" },
                { name: "phone", icon: FaPhone, placeholder: "Phone Number" },
                { name: "profilePicture", icon: FaImage, placeholder: "Profile Picture URL" },
              ].map(({ name, icon: Icon, placeholder, type }) => (
                <div key={name} className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]" />
                  <input
                    name={name}
                    type={type ?? "text"}
                    value={(formData as any)[name]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="input pl-9 py-3 sm:py-4 rounded-xl text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="text-xs text-[var(--color-muted)] mb-1 block">
                  Theme
                </label>
                <select
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="input py-3 sm:py-4 rounded-xl text-sm"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              {/* Password */}
              <div className="md:col-span-2">
                <Button
                  type="button"
                  onClick={() => setShowPasswordCard((v) => !v)}
                  className="w-full py-3 rounded-xl"
                >
                  {showPasswordCard ? "Hide Security Settings" : "Change Password"}
                </Button>

                {showPasswordCard && (
                  <div className="relative mt-3">
                    <FaKey className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]" />
                    <input
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="New Password"
                      className="input pl-9 py-3 rounded-xl text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl"
                >
                  {loading ? <Spinner size="sm" /> : "Update Profile"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-500/30 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-red-500 mb-3">
              Danger Zone
            </h3>
            <Button
              variant="secondary"
              className="w-full text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() =>
                setModal({
                  open: true,
                  type: "confirm-delete",
                  message:
                    "This will permanently delete your account. This action cannot be undone.",
                })
              }
            >
              Delete Account
            </Button>
          </Card>

          {/* Logout */}
          <Card className="p-4 rounded-xl">
            <Button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              Logout
            </Button>
          </Card>
        </div>

        {/* Modal */}
        {modal.open && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-[var(--color-card)] p-6 rounded-xl max-w-sm w-full text-center space-y-4">
              <p className="text-sm">{modal.message}</p>
              {modal.type === "confirm-delete" ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleDeleteAccount}
                    className="flex-1 bg-red-500"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setModal({ ...modal, open: false })}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setModal({ ...modal, open: false })}
                  className="w-full"
                >
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </main>
    </AuthGuard>
  );
}
