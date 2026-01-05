"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store/store";
import { fetchCurrentUser, fetchAllUsers } from "../redux/slices/userSlice";
import { fetchAllProducts, } from "../redux/slices/productSlice";
import { fetchAllSalesThunk } from "../redux/slices/salesSlice";
import { fetchAllStockHistory } from "../redux/slices/stockHistorySlice";

import { Card } from "../components/Card";
import {
  FaBoxOpen,
  FaUsers,
  FaMoneyBill,
  FaClipboardList,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import AuthGuard from "../components/AuthGuard";
import "../app/global.css";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, allUsers } = useSelector(
    (state: RootState) => state.user
  );
  const { products } = useSelector((state: RootState) => state.product);
  const { sales, loading: salesLoading } = useSelector(
    (state: RootState) => state.sales
  );
  const { history: stockHistory, loading: stockLoading } = useSelector(
    (state: RootState) => state.stockHistory
  );

  useEffect(() => {
    if (!user || !token) return;

    const fetchAllData = async () => {
      try {
        await dispatch(fetchCurrentUser({ token }));
        if (!allUsers || allUsers.length === 0) await dispatch(fetchAllUsers());
        if (!products || products.length === 0)
          await dispatch(fetchAllProducts());
        if (!sales || sales.length === 0)
          await dispatch(fetchAllSalesThunk({ token }));
        if (!stockHistory || stockHistory.length === 0)
          await dispatch(fetchAllStockHistory({ token }));
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, dispatch]);

  const totalProducts = products?.length || 0;
  const totalUsers = allUsers?.length || 0;
  const totalSales = sales?.reduce((acc, s) => acc + s.totalPrice, 0) || 0;
  const lowStockProducts = products?.filter((p) => p.quantity <= 5).length || 0;

  const salesByDate =
    sales?.slice(-7).map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString(),
      total: s.totalPrice,
    })) || [];

  const latestSales = sales?.slice(-5) || [];
  const recentStockHistory = stockHistory?.slice(-15) || [];

  return (
    <AuthGuard>
      <main className="min-h-screen p-4 bg-[var(--color-background)]">
        <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
          {/* Header */}
          <header className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-foreground)]">
              Dashboard
            </h1>
            <p className="text-[var(--color-muted)] text-xs sm:text-sm md:text-base mt-1">
              Welcome back, {user?.username ?? "User"} — here’s the pulse of
              your inventory.
            </p>
          </header>

          {/* Metrics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[
              {
                label: "Total Products",
                value: totalProducts,
                icon: FaBoxOpen,
                color: "bg-[var(--color-accent)]",
              },
              {
                label: "Total Users",
                value: totalUsers,
                icon: FaUsers,
                color: "bg-[var(--color-accent-hover)]",
              },
              {
                label: "Total Sales",
                value: `₦${totalSales.toLocaleString()}`,
                icon: FaMoneyBill,
                color: "bg-[var(--color-primary)]",
              },
              {
                label: "Low Stock",
                value: lowStockProducts,
                icon: FaClipboardList,
                color: "bg-red-500",
              },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <Card
                  key={metric.label}
                  className="flex items-center p-3 sm:p-4 gap-2 sm:gap-3 hover:shadow-lg transition-all"
                >
                  <div
                    className={`p-2 sm:p-3 rounded-full text-white ${metric.color} flex items-center justify-center text-lg sm:text-xl`}
                  >
                    <Icon />
                  </div>
                  <div>
                    <p className="text-[var(--color-muted)] text-xs">
                      {metric.label}
                    </p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-foreground)]">
                      {metric.value}
                    </p>
                  </div>
                </Card>
              );
            })}
          </section>

          {/* Sales Chart */}
          <section className="mb-6 sm:mb-8">
            <Card className="p-3 sm:p-4 md:p-6">
              <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 text-[var(--color-foreground)]">
                Sales Last 7 Days
              </h2>
              {salesLoading ? (
                <p className="text-[var(--color-muted)] text-xs sm:text-sm">
                  Loading sales...
                </p>
              ) : salesByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={salesByDate}>
                    <XAxis dataKey="date" stroke="#8884d8" />
                    <YAxis stroke="#8884d8" />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="#3A5F7D"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-[var(--color-muted)] text-xs sm:text-sm">
                  No sales data available.
                </p>
              )}
            </Card>
          </section>

          {/* Quick Actions */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 text-[var(--color-foreground)]">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {[
                { label: "Add Product", icon: FaBoxOpen, path: "/products" },
                { label: "Add User", icon: FaUsers, path: "/signup" },
                { label: "View Sales", icon: FaMoneyBill, path: "/sales" },
                {
                  label: "View Stock",
                  icon: FaClipboardList,
                  path: "/stock-history",
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.path}
                    className="flex flex-col items-center justify-center gap-1 p-3 sm:p-4 rounded-xl bg-[var(--color-card)] hover:shadow-md transition-all text-xs sm:text-sm md:text-base"
                  >
                    <Icon className="text-[var(--color-accent)] text-lg sm:text-xl md:text-2xl" />
                    <span className="font-medium">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Low Stock & Recent Sales */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Card className="p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-[var(--color-foreground)]">
                Low Stock Products
              </h2>
              <ul className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
                {products
                  ?.filter((p) => p.quantity <= 5)
                  .map((p) => (
                    <li
                      key={p._id}
                      className="flex justify-between bg-[var(--color-card)] p-1 sm:p-2 rounded hover:shadow-sm transition-all"
                    >
                      <span>{p.name}</span>
                      <span className="text-red-500 font-semibold">
                        {p.quantity} left
                      </span>
                    </li>
                  ))}
                {lowStockProducts === 0 && (
                  <li className="text-[var(--color-muted)]">
                    No low stock products
                  </li>
                )}
              </ul>
            </Card>

            <Card className="p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-[var(--color-foreground)]">
                Recent Sales
              </h2>
              <ul className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
                {latestSales.length > 0
                  ? latestSales.map((s) => (
                      <li
                        key={s._id}
                        className="flex justify-between bg-[var(--color-card)] p-1 sm:p-2 rounded hover:shadow-sm transition-all"
                      >
                        <span>Sale #{s._id.slice(-4)}</span>
                        <span className="font-semibold text-[var(--color-primary)]">
                          ₦{s.totalPrice.toLocaleString()}
                        </span>
                      </li>
                    ))
                  : !salesLoading && (
                      <li className="text-[var(--color-muted)]">
                        No sales yet
                      </li>
                    )}
              </ul>
            </Card>
          </section>

          {/* Stock History */}
          <section className="mb-8 sm:mb-10">
            <Card className="p-3 sm:p-4">
              <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-[var(--color-foreground)]">
                Recent Stock History
              </h2>
              <ul className="flex flex-col gap-1 sm:gap-2 text-xs sm:text-sm">
                {stockLoading ? (
                  <li className="text-[var(--color-muted)]">
                    Loading stock history...
                  </li>
                ) : recentStockHistory.length > 0 ? (
                  recentStockHistory.map((s) => (
                    <li
                      key={s.id}
                      className="flex justify-between bg-[var(--color-card)] p-1 sm:p-2 rounded hover:shadow-sm transition-all"
                    >
                      <span>{s.product.name}</span>
                      <span className="text-[var(--color-primary)]">
                        {s.previousQuantity} → {s.newQuantity} ({s.action})
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-[var(--color-muted)]">
                    No stock history yet
                  </li>
                )}
              </ul>
            </Card>
          </section>
        </div>
      </main>
    </AuthGuard>
  );
}
