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

    const action = isAdmin
      ? createUserByAdmin(formData)
      : registerUser(formData);

    const result = await dispatch(action as any);

    if (
      (isAdmin && createUserByAdmin.fulfilled.match(result)) ||
      (!isAdmin && registerUser.fulfilled.match(result))
    ) {
      setSuccessMessage(
        isAdmin
          ? "User created successfully! They can now log in."
          : "Account created! Please log in."
      );
      setFormData({
        username: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        profilePicture: "",
        theme: "light",
      });
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl p-6 sm:p-8 md:p-10 rounded-2xl slide-up">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            {isAdmin ? "Add New User" : "Create an Account"}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--color-muted)] max-w-lg">
            {isAdmin
              ? "Register a new staff user with the required access."
              : "Sign up to access the workspace and manage your operations."}
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5"
        >
          {[
            {
              name: "username",
              placeholder: "Username",
              icon: <FaUser />,
              span: 1,
            },
            {
              name: "name",
              placeholder: "Full name",
              icon: <FaIdBadge />,
              span: 1,
            },
            {
              name: "email",
              placeholder: "Email address",
              icon: <FaEnvelope />,
              span: 2,
              type: "email",
            },
            {
              name: "password",
              placeholder: "Password",
              icon: <FaLock />,
              span: 2,
              type: "password",
            },
            {
              name: "phone",
              placeholder: "Phone number (optional)",
              icon: <FaPhone />,
              span: 1,
            },
            {
              name: "profilePicture",
              placeholder: "Profile picture URL (optional)",
              icon: <FaImage />,
              span: 1,
            },
          ].map((field) => (
            <div
              key={field.name}
              className={`relative md:col-span-${field.span}`}
            >
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)]">
                {field.icon}
              </span>
              <input
                type={field.type || "text"}
                name={field.name}
                placeholder={field.placeholder}
                value={(formData as any)[field.name]}
                onChange={handleChange}
                required={field.name !== "phone" && field.name !== "profilePicture"}
                className="input pl-9 py-2.5 sm:py-3 text-sm rounded-lg transition focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          ))}

          {/* Theme */}
          <div className="relative md:col-span-2">
            <FaPalette className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-muted)] pointer-events-none" />
            <select
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              className="input pl-9 py-2.5 sm:py-3 text-sm rounded-lg"
            >
              <option value="light">Light Theme</option>
              <option value="dark">Dark Theme</option>
            </select>
          </div>

          {error && (
            <p className="md:col-span-2 text-xs sm:text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="md:col-span-2 mt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-lg interactive"
            >
              {loading ? <Spinner size="sm" /> : isAdmin ? "Create User" : "Sign Up"}
            </Button>
          </div>
        </form>

        {successMessage && (
          <p className="mt-5 text-xs sm:text-sm text-green-500 text-center">
            {successMessage}{" "}
            {!isAdmin && (
              <Link href="/login" className="underline">
                Go to Login
              </Link>
            )}
          </p>
        )}

        {!isAdmin && (
          <p className="mt-6 text-xs sm:text-sm text-center text-[var(--color-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="hover:underline">
              Log in
            </Link>
          </p>
        )}
      </Card>
    </main>
  );
}
