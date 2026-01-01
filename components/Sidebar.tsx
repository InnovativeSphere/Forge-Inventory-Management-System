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
  FaSignOutAlt,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <aside
      className={`
        flex flex-col h-screen w-64
        bg-[var(--color-surface)]
        text-[var(--color-foreground)]
        border-r border-[var(--color-border)]
        shadow-lg
        ${className}
      `}
    >
      {/* Brand */}
      <div className="flex flex-col items-center py-8 border-b border-[var(--color-border)]">
        <div
          className="
            w-14 h-14 rounded-full mb-2 flex items-center justify-center
            bg-[var(--color-accent)] text-[var(--color-background)]
            font-black text-xl select-none
            shadow-inner
          "
        >
          F
        </div>
        <span className="text-sm font-semibold tracking-wide text-[var(--color-foreground)]">
          Forge IMS
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = router.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.label}>
                <Link
                  href={item.path}
                  className={`
                    group flex items-center gap-4 px-6 py-3 text-sm font-medium rounded-lg
                    transition-all duration-200
                    ${isActive
                      ? "bg-[var(--color-accent)] text-[var(--color-background)] shadow-[inset_0_0_10px_rgba(0,0,0,0.15)]"
                      : "text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-accent)/20] hover:shadow-[0_2px_10px_rgba(0,0,0,0.08)]"
                    }
                  `}
                >
                  <Icon
                    className={`
                      text-lg
                      ${isActive ? "text-[var(--color-background)]" : "text-[var(--color-accent)] group-hover:text-[var(--color-foreground)]"}
                      transition-colors duration-200
                    `}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-4 py-6 border-t border-[var(--color-border)]">
        <button
          onClick={handleLogout}
          className="
            flex items-center gap-4 px-4 py-2
            text-sm text-[var(--color-muted)]
            hover:text-[var(--color-background)]
            hover:bg-[var(--color-accent)]
            hover:shadow-md
            transition-all duration-150 interactive w-full rounded-lg
          "
        >
          <FaSignOutAlt className="text-base" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
