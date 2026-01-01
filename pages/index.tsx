"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store/store";
import { fetchAllProducts } from "../redux/slices/productSlice";
import { fetchAllUsers } from "../redux/slices/userSlice";
import { fetchAllStockHistory } from "../redux/slices/stockHistorySlice";

import Sidebar from "../components/Sidebar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";

import "../app/global.css";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const { allUsers, loading: usersLoading } = useSelector(
    (state: RootState) => state.user
  );
  const { products, loading: productsLoading } = useSelector(
    (state: RootState) => state.product
  );
  const { history: stockHistory, loading: historyLoading } = useSelector(
    (state: RootState) => state.stockHistory
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data
  useEffect(() => {
    dispatch(fetchAllProducts());
    dispatch(fetchAllUsers());
    dispatch(fetchAllStockHistory());
  }, [dispatch]);

  const lowStock = products?.filter((p) => p.quantity <= 5).length || 0;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar className="fixed top-0 left-0 h-screen" />

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center py-32 bg-[var(--color-background)] w-full">
          <h1 className="text-5xl font-bold mb-6 text-[var(--color-foreground)]">
            Welcome to Forge Inventory Management System
          </h1>
          <p className="text-xl text-[var(--color-muted)] max-w-3xl mb-8">
             Manage your inventory with speed,
            precision, and clarity.
          </p>
          <div className="flex gap-4">
            <Button
              variant="primary"
              className="px-6 py-3"
              onClick={() => setIsModalOpen(true)}
            >
              Open Dashboard Preview
            </Button>
            <Button variant="secondary" className="px-6 py-3">
              Learn More
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-[var(--color-background)] flex flex-col items-center w-full">
          <h2 className="text-4xl font-bold mb-12">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl px-6">
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
                  "Gain insights through dashboards, KPIs, and detailed reports.",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              >
                <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--color-muted)] text-sm">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 bg-[var(--color-primary)] text-white flex flex-col items-center text-center w-full">
          <h2 className="text-4xl font-bold mb-6">
            Ready to forge your workflow?
          </h2>
          <p className="mb-8 max-w-xl">
            Experience a new level of control over your inventory management.
          </p>
          <Button className="px-8 py-4 font-bold rounded-lg" variant="primary">
            Start Your Free Trial
          </Button>
        </section>

        {/* Footer */}
        <footer className="py-12 bg-[var(--color-background)] text-[var(--color-muted)] text-center w-full">
          © 2025 Forge IMS. All rights reserved.
        </footer>

        {/* Dashboard Side Modal */}
        {isModalOpen && (
          <>
            <div
              className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-40"
              onClick={() => setIsModalOpen(false)}
            />
            <aside className="fixed top-0 right-0 h-full w-80 bg-[var(--color-card)] rounded-l-2xl shadow-2xl p-4 z-50 overflow-y-auto transition-transform duration-500">
              <h4 className="text-lg font-bold mb-4">Dashboard Preview</h4>

              {/* Metrics */}
              <div className="flex flex-col gap-2 mb-4">
                <Card className="flex justify-between p-2 text-sm">
                  <span className="text-[var(--color-muted)]">Products</span>
                  <span className="font-semibold">
                    {productsLoading ? <Spinner size="sm" /> : products?.length || 0}
                  </span>
                </Card>
                <Card className="flex justify-between p-2 text-sm">
                  <span className="text-[var(--color-muted)]">Suppliers</span>
                  <span className="font-semibold">
                    {usersLoading ? <Spinner size="sm" /> : allUsers?.length || 0}
                  </span>
                </Card>
                <Card className="flex justify-between p-2 text-sm">
                  <span className="text-[var(--color-muted)]">Low Stock</span>
                  <span className="font-semibold text-red-500">
                    {productsLoading ? <Spinner size="sm" /> : lowStock}
                  </span>
                </Card>
              </div>

              {/* Recent Stock Updates */}
              <section className="mb-4">
                <h5 className="font-semibold mb-2 text-[var(--color-foreground)] text-sm">
                  Recent Stock Updates
                </h5>
                {historyLoading ? (
                  <Spinner size="sm" />
                ) : stockHistory.length > 0 ? (
                  stockHistory
                    .slice(-5)
                    .reverse()
                    .map((h) => (
                      <Card
                        key={h.id}
                        className="flex justify-between p-2 text-sm mb-1"
                      >
                        <span>{h.product.name}</span>
                        <span className="text-[var(--color-primary)]">
                          {h.previousQuantity} → {h.newQuantity} ({h.action})
                        </span>
                      </Card>
                    ))
                ) : (
                  <p className="text-[var(--color-muted)] text-xs">
                    No stock updates
                  </p>
                )}
              </section>

              {/* Quick Actions */}
              <section className="mt-4">
                <h5 className="font-semibold mb-2 text-[var(--color-foreground)] text-sm">
                  Actions
                </h5>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Add Product", href: "/products" },
                    { label: "Add User", href: "/signup" },
                    { label: "View Sales", href: "/sales" },
                    { label: "View Stock", href: "/stock-history" },
                  ].map((action) => (
                    <a key={action.label} href={action.href}>
                      <Button variant="primary" className="w-full text-sm">
                        {action.label}
                      </Button>
                    </a>
                  ))}
                </div>
              </section>
            </aside>
          </>
        )}
      </main>
    </div>
  );
}
