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

  // Redirect on successful login
  useEffect(() => {
    if (user && token) {
      router.replace("/dashboard"); // or "/" if _index.tsx is the landing page
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
    <main className="min-h-screen flex items-center justify-center px-6 py-16 bg-[var(--color-background)]">
      <Card className="w-full max-w-2xl p-10 rounded-3xl slide-up shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
            Welcome Back
          </h1>
          <p className="mt-3 text-sm text-[var(--color-muted)] max-w-lg">
            Log in to continue managing your workspace.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-base" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-12 py-4 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)] text-base" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full pl-12 py-4 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all duration-200"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="mt-4">
            <Button
              type="submit"
              size="md"
              variant="primary"
              disabled={loading}
              className="w-full interactive py-4 rounded-xl flex justify-center items-center gap-2"
            >
              {loading ? <Spinner size="sm" /> : "Log In"}
            </Button>
          </div>
        </form>

        <p className="mt-8 text-sm text-center text-[var(--color-muted)]">
          Don’t have an account?{" "}
          <Link
            href="/signup"
            className="text-[var(--color-primary)] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </Card>
    </main>
  );
}
