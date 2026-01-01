"use client";

import { FormEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import type { RootState, AppDispatch } from "../redux/store/store";
import { registerUser, createUserByAdmin } from "../redux/slices/userSlice";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import {
  FaUser,
  FaIdBadge,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaImage,
  FaPalette,
} from "react-icons/fa";
import "../app/global.css";

export default function SignupPage() {
  const dispatch = useDispatch<AppDispatch>();

  const { user, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  const isAdmin = user?.role === "admin";

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    profilePicture: "",
    theme: "light",
  });

  const [successMessage, setSuccessMessage] = useState("");

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

    if (isAdmin) {
      const resultAction = await dispatch(createUserByAdmin(formData));
      if (createUserByAdmin.fulfilled.match(resultAction)) {
        setSuccessMessage("User created successfully! They can now log in.");
      }
    } else {
      const resultAction = await dispatch(registerUser(formData));
      if (registerUser.fulfilled.match(resultAction)) {
        setSuccessMessage("Account created! Please log in.");
      }
    }

    setFormData({
      username: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      profilePicture: "",
      theme: "light",
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-16">
      <Card className="w-full max-w-2xl p-10 rounded-3xl slide-up">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
            {isAdmin ? "Add New User" : "Create an Account"}
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)] max-w-lg">
            {isAdmin
              ? "Register a new staff user with the required access."
              : "Sign up to access the workspace and manage your operations."}
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div className="relative md:col-span-1">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm" />
            <input
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
              className="input pl-11 py-4 rounded-xl"
            />
          </div>

          {/* Full Name */}
          <div className="relative md:col-span-1">
            <FaIdBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm" />
            <input
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input pl-11 py-4 rounded-xl"
            />
          </div>

          {/* Email */}
          <div className="relative md:col-span-2">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="input pl-11 py-4 rounded-xl"
            />
          </div>

          {/* Password */}
          <div className="relative md:col-span-2">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="input pl-11 py-4 rounded-xl"
            />
          </div>

          {/* Phone */}
          <div className="relative md:col-span-1">
            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm" />
            <input
              name="phone"
              placeholder="Phone number (optional)"
              value={formData.phone}
              onChange={handleChange}
              className="input pl-11 py-4 rounded-xl"
            />
          </div>

          {/* Profile Picture */}
          <div className="relative md:col-span-1">
            <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm" />
            <input
              name="profilePicture"
              placeholder="Profile picture URL (optional)"
              value={formData.profilePicture}
              onChange={handleChange}
              className="input pl-11 py-4 rounded-xl"
            />
          </div>

          {/* Theme */}
          <div className="relative md:col-span-2">
            <FaPalette className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-sm pointer-events-none" />
            <select
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              className="input pl-11 py-4 rounded-xl"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
          </div>

          {error && (
            <p className="md:col-span-2 text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="md:col-span-2 mt-4">
            <Button
              type="submit"
              size="md"
              variant="primary"
              disabled={loading}
              className="w-full interactive py-4 rounded-xl"
            >
              {loading ? (
                <Spinner size="sm" />
              ) : isAdmin ? (
                "Create User"
              ) : (
                "Sign Up"
              )}
            </Button>
          </div>
        </form>

        {successMessage && (
          <p className="mt-6 text-sm text-green-500 text-center">
            {successMessage}{" "}
            {!isAdmin && (
              <Link
                href="/login"
                className="text-[var(--color-primary)] underline"
              >
                Go to Login
              </Link>
            )}
          </p>
        )}

        {!isAdmin && (
          <p className="mt-8 text-sm text-center text-[var(--color-muted)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[var(--color-primary)] hover:underline"
            >
              Log in
            </Link>
          </p>
        )}
      </Card>
    </main>
  );
}
