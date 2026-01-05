"use client";

import { FormEvent, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RootState, AppDispatch } from "../redux/store/store";
import { loginUser } from "../redux/slices/userSlice";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "../app/global.css";

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { loading, error, user, token } = useSelector(
    (state: RootState) => state.user
  );

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user && token) {
      router.replace("/dashboard");
    }
  }, [user, token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--color-background)]">
      <Card className="w-full max-w-md sm:max-w-lg p-6 sm:p-8 md:p-10 rounded-2xl slide-up shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
            Welcome Back
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[var(--color-muted)] max-w-md">
            Log in to continue managing your workspace.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-[var(--color-muted)]" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="input pl-9 py-2.5 sm:py-3 text-sm rounded-lg transition focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-[var(--color-muted)]" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="input pl-9 py-2.5 sm:py-3 text-sm rounded-lg transition focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          {error && (
            <p className="text-xs sm:text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="mt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-2.5 sm:py-3 rounded-lg interactive flex justify-center items-center"
            >
              {loading ? <Spinner size="sm" /> : "Log In"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-xs sm:text-sm text-center text-[var(--color-muted)]">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="hover:underline text-[var(--color-primary)]"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </main>
  );
}
