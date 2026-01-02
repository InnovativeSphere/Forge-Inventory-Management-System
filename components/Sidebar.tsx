"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  FaHome,
  FaBoxOpen,
  FaUsers,
  FaChartBar,
  FaMoneyBill,
  FaBookmark,
  FaUser,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import "../app/global.css";

interface SidebarProps {
  className?: string;
}

const navItems = [
  { label: "Dashboard", icon: FaHome, path: "/dashboard" },
  { label: "Products", icon: FaBoxOpen, path: "/products" },
  { label: "Suppliers", icon: FaUsers, path: "/suppliers" },
  { label: "Stock History", icon: FaChartBar, path: "/stock-history" },
  { label: "Sales", icon: FaMoneyBill, path: "/sales" },
  { label: "Categories", icon: FaBookmark, path: "/categories" },
  { label: "User Management", icon: FaUsers, path: "/userManagement" },
  { label: "Register", icon: FaUser, path: "/signup" },
  { label: "Profile", icon: FaUser, path: "/profile" },
];

export default function Sidebar({ className = "" }: SidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-[var(--color-accent)] text-[var(--color-background)] shadow-lg"
      >
        <FaBars />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64
          bg-[var(--color-surface)]
          text-[var(--color-foreground)]
          border-r border-[var(--color-border)]
          shadow-lg
          flex flex-col
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex-shrink-0
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-[var(--color-background)]
              flex items-center justify-center font-black shadow-inner">
              F
            </div>
            <span className="text-sm font-semibold">Forge IMS</span>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <FaTimes />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const isActive = router.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.label}>
                  <Link
                    href={item.path}
                    onClick={() => setOpen(false)} // close on mobile
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium
                      transition-all
                      ${isActive
                        ? "bg-[var(--color-accent)] text-[var(--color-background)]"
                        : "text-[var(--color-muted)] hover:bg-[var(--color-accent)/20] hover:text-[var(--color-foreground)]"
                      }
                    `}
                  >
                    <Icon
                      className={`text-lg ${
                        isActive
                          ? "text-[var(--color-background)]"
                          : "text-[var(--color-accent)]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-[var(--color-border)]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-lg
              text-sm text-[var(--color-muted)]
              hover:bg-[var(--color-accent)] hover:text-[var(--color-background)]
              transition"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
