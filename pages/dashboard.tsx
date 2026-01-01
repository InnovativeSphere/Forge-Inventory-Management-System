"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store/store";
import { fetchCurrentUser, fetchAllUsers } from "../redux/slices/userSlice";
import { fetchAllProducts } from "../redux/slices/productSlice";
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

  // Fetch all data once when token is ready
  useEffect(() => {
    if (!token) return;

    if (!user) dispatch(fetchCurrentUser({ token }));
    if (!allUsers || allUsers.length === 0) dispatch(fetchAllUsers());
    if (!products || products.length === 0) dispatch(fetchAllProducts());
    if (!sales || sales.length === 0) dispatch(fetchAllSalesThunk({ token })); // TS-safe
    if (!stockHistory || stockHistory.length === 0)
      dispatch(fetchAllStockHistory({ token }));
  }, [token, user, allUsers, products, sales, stockHistory, dispatch]);

  // Metrics
  const totalProducts = products?.length || 0;
  const totalUsers = allUsers?.length || 0;
  const totalSales = sales?.reduce((acc, s) => acc + s.totalPrice, 0) || 0;
  const lowStockProducts = products?.filter((p) => p.quantity <= 5).length || 0;

  // Chart data (last 7 sales)
  const salesByDate =
    sales?.slice(-7).map((s) => ({
      date: new Date(s.createdAt).toLocaleDateString(),
      total: s.totalPrice,
    })) || [];

  // Latest 5 sales
  const latestSales = sales?.slice(-5) || [];

  // Recent stock history (last 5)
  const recentStockHistory = stockHistory?.slice(-15) || [];

  return (
    <main className="min-h-screen p-6 bg-[var(--color-background)]">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-foreground)]">
          Dashboard
        </h1>
        <p className="text-[var(--color-muted)] mt-1">
          Welcome back, {user?.username ?? "User"} — here’s the pulse of your
          inventory.
        </p>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
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
              className="flex items-center p-6 gap-4 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] transition-all duration-200"
            >
              <div
                className={`p-4 rounded-full text-white ${metric.color} flex items-center justify-center text-2xl`}
              >
                <Icon />
              </div>
              <div>
                <p className="text-[var(--color-muted)] text-sm">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-[var(--color-foreground)]">
                  {metric.value}
                </p>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Sales Chart */}
      <section className="mb-10">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">
            Sales Last 7 Days
          </h2>
          {salesLoading ? (
            <p className="text-[var(--color-muted)] text-sm">
              Loading sales...
            </p>
          ) : salesByDate.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={salesByDate}>
                <XAxis dataKey="date" stroke="#8884d8" />
                <YAxis stroke="#8884d8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3A5F7D"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-[var(--color-muted)] text-sm">
              No sales data available.
            </p>
          )}
        </Card>
      </section>

      {/* Low Stock & Recent Sales */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">
            Low Stock Products
          </h2>
          <ul className="flex flex-col gap-3">
            {products
              ?.filter((p) => p.quantity <= 5)
              .map((p) => (
                <li
                  key={p._id}
                  className="flex justify-between bg-[var(--color-card)] p-3 rounded-lg hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all"
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

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">
            Recent Sales
          </h2>
          <ul className="flex flex-col gap-3">
            {latestSales.length > 0
              ? latestSales.map((s) => (
                  <li
                    key={s._id}
                    className="flex justify-between bg-[var(--color-card)] p-3 rounded-lg hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all"
                  >
                    <span>Sale #{s._id.slice(-4)}</span>
                    <span className="font-semibold text-[var(--color-primary)]">
                      ₦{s.totalPrice.toLocaleString()}
                    </span>
                  </li>
                ))
              : !salesLoading && (
                  <li className="text-[var(--color-muted)]">No sales yet</li>
                )}
          </ul>
        </Card>
      </section>

      {/* Stock History */}
      <section className="mt-10">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">
            Recent Stock History
          </h2>
          <ul className="flex flex-col gap-3">
            {stockLoading ? (
              <li className="text-[var(--color-muted)]">
                Loading stock history...
              </li>
            ) : recentStockHistory.length > 0 ? (
              recentStockHistory.map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between bg-[var(--color-card)] p-3 rounded-lg hover:shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all"
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

      {/* Quick Actions */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-[var(--color-foreground)]">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl bg-[var(--color-card)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all cursor-pointer"
              >
                <Icon className="text-[var(--color-accent)] text-2xl" />
                <span className="text-[var(--color-foreground)] font-medium">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
