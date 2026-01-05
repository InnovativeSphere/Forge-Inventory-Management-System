"use client";

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
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import { useState } from "react";

const navItems = [
  { label: "Home", icon: FaHome, path: "/" },
  { label: "Dashboard", icon: FaChartBar, path: "/dashboard" },
  { label: "Products", icon: FaBoxOpen, path: "/products" },
  { label: "Suppliers", icon: FaUsers, path: "/suppliers" },
  { label: "Stock History", icon: FaChartBar, path: "/stock-history" },
  { label: "Sales", icon: FaMoneyBill, path: "/sales" },
  { label: "Categories", icon: FaBookmark, path: "/categories" },
  { label: "User Management", icon: FaUsers, path: "/userManagement" },
  { label: "Register", icon: FaUser, path: "/signup" },
  { label: "Profile", icon: FaUser, path: "/profile" },
];

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const sidebarWidth = sidebarOpen ? 256 : 64; // px

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[var(--color-surface)]/95 backdrop-blur-md border-r border-[var(--color-border)] shadow-lg flex flex-col transition-all duration-300 z-50`}
        style={{ width: sidebarWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--color-border)]">
          <div
            className={`flex items-center gap-3 transition-all duration-300 ${
              sidebarOpen ? "opacity-100" : "opacity-0 overflow-hidden"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-[var(--color-background)] flex items-center justify-center font-black">
              F
            </div>
            <span className="text-sm font-semibold tracking-wide">
              Forge IMS
            </span>
          </div>

          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            className="text-[var(--color-muted)] hover:text-[var(--color-accent)] transition"
          >
            {sidebarOpen ? <FaAngleLeft /> : <FaAngleRight />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col gap-1 px-1">
            {navItems.map(({ label, icon: Icon, path }) => {
              const isActive = router.pathname === path;
              return (
                <li key={label}>
                  <Link
                    href={path}
                    className={`flex items-center gap-4 px-3 py-3 rounded-lg text-sm font-medium transition-all
                      ${
                        isActive
                          ? "bg-[var(--color-accent)] text-white"
                          : "text-(--color-muted) hover:bg-[var(--color-accent)]/20 hover:text-white"
                      }`}
                  >
                    <Icon
                      className={`text-lg ${
                        isActive ? "text-white" : "text-[var(--color-accent)]"
                      }`}
                    />
                    {sidebarOpen && <span className={`text-xs ${
                        isActive ? "text-white" : "text-[var(--color-accent)]"
                      }`}>{label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className="flex-1 transition-all duration-300 relative"
        style={{ marginLeft: sidebarWidth, zIndex: 0 }}
      >
        {children}
      </main>
    </div>
  );
}
