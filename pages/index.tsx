"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store/store";
import { fetchAllProducts } from "../redux/slices/productSlice";
import { fetchAllUsers } from "../redux/slices/userSlice";
import { fetchAllStockHistory } from "../redux/slices/stockHistorySlice";

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

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

import "../app/global.css";

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

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { allUsers, loading: usersLoading } = useSelector(
    (state: RootState) => state.user
  );
  const { products, loading: productsLoading } = useSelector(
    (state: RootState) => state.product
  );
  const { history: stockHistory, loading: historyLoading } = useSelector(
    (state: RootState) => state.stockHistory
  );

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardModal, setDashboardModal] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchAllUsers());
    dispatch(fetchAllStockHistory());
  }, [dispatch]);

  if (!mounted) return null;

  const lowStock = products?.filter((p) => p.quantity <= 5).length || 0;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-[var(--color-surface)]
          text-[var(--color-foreground)] border-r border-[var(--color-border)]
          shadow-lg flex flex-col transition-transform duration-300
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-[var(--color-background)]
              flex items-center justify-center font-black shadow-inner"
            >
              F
            </div>
            <span className="text-sm font-semibold">Forge IMS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const isActive = router.pathname === item.path;
              const Icon = item.icon;
              return (
                <li key={item.label}>
                  <Link
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-4 px-4 py-3 rounded-lg text-sm font-medium
                      transition-all
                      ${
                        isActive
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

      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg
          bg-[var(--color-accent)] text-[var(--color-background)] shadow-lg"
      >
        <FaBars />
      </button>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:ml-64">
        <div className="max-w-7xl w-full mx-auto flex flex-col gap-20 py-12 px-6">
          {/* Hero */}
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--color-foreground)]">
              Forge Inventory Management System
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-muted)] max-w-3xl mx-auto mb-8">
              Manage your inventory with speed, precision, and clarity.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                variant="primary"
                className="px-6 py-3 w-full sm:w-auto"
                onClick={() => setDashboardModal(true)}
              >
                Open Dashboard Preview
              </Button>
              <Button
                variant="secondary"
                className="px-6 py-3 w-full sm:w-auto"
              >
                Learn More
              </Button>
            </div>
          </section>

          {/* Features */}
          <section>
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
              Core Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Products & Stock",
                  description:
                    "Track products, manage stock levels, and receive low-stock alerts in real-time.",
                },
                {
                  title: "Suppliers & Orders",
                  description:
                    "Manage supplier details and monitor all orders seamlessly.",
                },
                {
                  title: "Analytics & Reports",
                  description:
                    "Dashboards, KPIs, and reports designed for clarity and speed.",
                },
              ].map((f) => (
                <Card
                  key={f.title}
                  className="p-6 rounded-lg shadow hover:shadow-lg"
                >
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    {f.description}
                  </p>
                </Card>
              ))}
            </div>
          </section>

          {/* Footer */}
          <footer className="py-8 text-center text-sm text-[var(--color-muted)]">
            © 2025 Forge IMS. All rights reserved.
          </footer>
        </div>

        {/* Dashboard modal */}
        {dashboardModal && (
          <>
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={() => setDashboardModal(false)}
            />
            <aside className="fixed top-0 right-0 h-full w-80 bg-[var(--color-card)] z-50 p-4 overflow-y-auto">
              <h4 className="text-lg font-bold mb-4">Dashboard Preview</h4>

              <div className="flex flex-col gap-2 mb-4">
                <Card className="flex justify-between p-2 text-sm">
                  <span>Products</span>
                  <span>
                    {productsLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      products?.length || 0
                    )}
                  </span>
                </Card>
                <Card className="flex justify-between p-2 text-sm">
                  <span>Users</span>
                  <span>
                    {usersLoading ? (
                      <Spinner size="sm" />
                    ) : (
                      allUsers?.length || 0
                    )}
                  </span>
                </Card>
                <Card className="flex justify-between p-2 text-sm">
                  <span>Low Stock</span>
                  <span className="text-red-500 font-semibold">
                    {productsLoading ? <Spinner size="sm" /> : lowStock}
                  </span>
                </Card>
              </div>

              <section>
                <h5 className="font-semibold mb-2 text-sm">
                  Recent Stock Updates
                </h5>
                {historyLoading ? (
                  <Spinner size="sm" />
                ) : stockHistory.length ? (
                  stockHistory
                    .slice(-5)
                    .reverse()
                    .map((h) => (
                      <Card key={h.id} className="p-2 text-sm mb-1">
                        <div className="flex justify-between">
                          <span>{h.product.name}</span>
                          <span className="text-[var(--color-primary)]">
                            {h.previousQuantity} → {h.newQuantity}
                          </span>
                        </div>
                      </Card>
                    ))
                ) : (
                  <p className="text-xs text-[var(--color-muted)]">
                    No stock updates
                  </p>
                )}
              </section>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
