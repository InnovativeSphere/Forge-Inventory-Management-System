"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store/store";
import { fetchAllProducts } from "@/redux/slices/productSlice";
import CreateProductModal from "../components/CreateProductModal";
import EditProductModal from "../components/EditProductModal";
import ViewProductModal from "../components/ViewProductModal";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { FaSearch, FaEye, FaEdit } from "react-icons/fa";
import AuthGuard from "../components/AuthGuard";
import "../app/global.css";

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.product
  );
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );
  const suppliers = useSelector((state: RootState) => state.supplier.suppliers);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalProduct, setEditModalProduct] = useState<any>(null);
  const [viewModalProduct, setViewModalProduct] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "active" | "low-stock">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchAllProducts());
  }, [dispatch]);

  const filteredProducts = products.filter((p) => {
    if (filter === "active" && !p.isActive) return false;
    if (filter === "low-stock" && p.quantity > p.minimumStock) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  const getCategoryName = (id?: string | null) =>
    categories.find((cat) => cat._id === id)?.name || "N/A";

  const getSupplierName = (id?: string | null) =>
    suppliers.find((sup) => sup.id === id)?.name || "N/A";

  return (
    <main className=" p-4  min-h-screen p-4 sm:p-6 bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
            <p className="text-xs sm:text-sm text-[var(--color-muted)] mt-1">
              Manage your inventory and stock levels
            </p>
          </div>
          <Button
            onClick={() => setAddModalOpen(true)}
            variant="primary"
            className="text-xs sm:text-sm"
          >
            Add Product
          </Button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
                w-full pl-10 pr-4 py-2
                bg-[var(--color-card)]
                text-[var(--color-foreground)]
                rounded-md
                border border-[var(--color-border)]
                focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
                text-xs sm:text-sm transition
              "
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["all", "active", "low-stock"] as const).map((f) => {
              const isActive = filter === f;
              const label =
                f === "all"
                  ? "All Products"
                  : f === "active"
                  ? "Active"
                  : "Low Stock";
              return (
                <Button
                  key={f}
                  size="sm"
                  variant={isActive ? "primary" : "secondary"}
                  onClick={() => setFilter(f)}
                  className="text-xs sm:text-sm"
                >
                  {label}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Products List */}
        {loading ? (
          <div className="flex justify-center py-6 sm:py-10">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-red-400 mt-6">{error}</p>
        ) : filteredProducts.length === 0 ? (
          <p className="text-[var(--color-muted)] mt-6 text-xs sm:text-sm">
            No products found.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 mt-4">
            {filteredProducts.map((product) => {
              const isLowStock = product.quantity <= product.minimumStock;
              return (
                <Card key={product.id} interactive>
                  <div className="flex flex-col justify-between h-full">
                    <div className="space-y-1">
                      <h2 className="text-sm sm:text-base font-semibold">
                        {product.name}
                      </h2>
                      <p className="text-xs text-[var(--color-muted)]">
                        SKU: {product.sku}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        Category: {getCategoryName(product.category)}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        Supplier: {getSupplierName(product.supplier)}
                      </p>
                      <p className="text-sm sm:text-base font-medium mt-1">
                        ₦{product.sellingPrice.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                          isLowStock
                            ? "bg-red-500/20 text-red-400"
                            : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {isLowStock ? "Low Stock" : "In Stock"}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setViewModalProduct(product)}
                          className="text-xs sm:text-sm"
                        >
                          <FaEye className="inline mr-1 text-xs sm:text-sm" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => setEditModalProduct(product)}
                          className="text-xs sm:text-sm"
                        >
                          <FaEdit className="inline mr-1 text-xs sm:text-sm" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Modals */}
        {addModalOpen && (
          <CreateProductModal onClose={() => setAddModalOpen(false)} />
        )}
        {editModalProduct && (
          <EditProductModal
            product={editModalProduct}
            onClose={() => setEditModalProduct(null)}
          />
        )}
        {viewModalProduct && (
          <ViewProductModal
            product={viewModalProduct}
            onClose={() => setViewModalProduct(null)}
          />
        )}
      </div>
    </main>
  );
}
