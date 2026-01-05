"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className=" bg-[var(--color-background)] border-t border-white/5">
      {/* This container matches your main page width */}
      <div className="max-w-7xl mx-auto px-6 mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

          {/* Left */}
          <div className="space-y-2 text-center md:text-left">
            <p className="text-sm font-semibold text-[var(--color-foreground)]">
              Forge Inventory System
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Built to track reality, not guesses.
            </p>
          </div>

          {/* Center */}
          <div className="flex justify-center gap-6 text-sm">
            <Link
              href="/dashboard"
              className="relative text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-0 after:bg-[var(--color-primary)] hover:after:w-full after:transition-all"
            >
              Dashboard
            </Link>
            <Link
              href="/products"
              className="relative text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-0 after:bg-[var(--color-primary)] hover:after:w-full after:transition-all"
            >
              Products
            </Link>
            <Link
              href="/stock-history"
              className="relative text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors after:absolute after:-bottom-1 after:left-0 after:h-[1px] after:w-0 after:bg-[var(--color-primary)] hover:after:w-full after:transition-all"
            >
              Reports
            </Link>
          </div>

          {/* Right */}
          <div className="text-center md:text-right">
            <p className="text-xs text-[var(--color-muted)]">
              © {new Date().getFullYear()}
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Forged with discipline, not shortcuts.
            </p>
          </div>

        </div>

        {/* Subtle accent bar */}
        <div className="mt-8 h-[2px] w-full bg-gradient-to-r from-transparent via-[var(--color-primary)]/40 to-transparent" />
      </div>
    </footer>
  );
}
