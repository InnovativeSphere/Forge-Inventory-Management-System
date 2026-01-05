"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store/store";

import { fetchAllProducts } from "../redux/slices/productSlice";
import { fetchAllUsers } from "../redux/slices/userSlice";
import { fetchAllStockHistory } from "../redux/slices/stockHistorySlice";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import DashboardPreview from "../components/PreviewDashboard";

import "../app/global.css";
import Footer from "@/components/Footer";
import { Hero } from "@/components/Hero";

export default function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [mounted, setMounted] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { products } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    setMounted(true);
    dispatch(fetchAllProducts());
    dispatch(fetchAllUsers());
    dispatch(fetchAllStockHistory());
  }, [dispatch]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] px-4 sm:px-6 lg:px-8 py-10">
      <div className="mx-auto max-w-6xl space-y-14">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-foreground)]">
            Forge Inventory Management
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-[var(--color-muted)] max-w-2xl mx-auto">
            Fast, predictable inventory control without the chaos.
          </p>

          <div className="flex justify-center pt-4">
            <Button variant="primary" onClick={() => setShowPreview(true)}>
              Open Dashboard Preview
            </Button>
          </div>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Products & Stock",
              description:
                "Track inventory, update quantities, and catch low-stock issues early.",
            },
            {
              title: "Suppliers & Orders",
              description:
                "Organize suppliers and follow orders without spreadsheet gymnastics.",
            },
            {
              title: "Analytics & Reports",
              description:
                "Clear dashboards and reports built for quick decisions.",
            },
          ].map((feature) => (
            <Card
              key={feature.title}
              className="p-5 sm:p-6 rounded-xl transition-all duration-300 hover:shadow-lg"
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-2 text-[var(--color-foreground)]">
                {feature.title}
              </h3>
              <p className="text-sm sm:text-base text-[var(--color-muted)]">
                {feature.description}
              </p>
            </Card>
          ))}
        </section>
        <Hero/>
        <Footer />
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <DashboardPreview onClose={() => setShowPreview(false)} />
      )}
    </div>
  );
}
