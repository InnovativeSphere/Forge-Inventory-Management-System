"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/redux/store/store";
import { fetchAllProducts } from "@/redux/slices/productSlice";
import CreateProductModal from "../components/CreateProductModal";
import EditProductModal from "../components/EditProductModal";
import ViewProductModal from "../components/ViewProductModal";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import { FaSearch, FaEye, FaEdit } from "react-icons/fa";
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
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-foreground)]">
            Products
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            Manage your inventory and stock levels
          </p>
        </div>
        <Button onClick={() => setAddModalOpen(true)} variant="primary">
          Add Product
        </Button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-64">
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
              transition
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
              >
                {label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Products List */}
      {loading ? (
        <div className="flex justify-center mt-12">
          <Spinner />
        </div>
      ) : error ? (
        <p className="text-red-400 mt-6">{error}</p>
      ) : filteredProducts.length === 0 ? (
        <p className="text-[var(--color-muted)] mt-6">No products found.</p>
      ) : (
        <>
          {/* Grid for small screens */}
          <div className="grid grid-cols-1 md:hidden gap-6 mt-4">
            {filteredProducts.map((product) => {
              const isLowStock = product.quantity <= product.minimumStock;
              return (
                <div
                  key={product.id}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-4 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-[var(--color-foreground)]">
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
                    <p className="text-sm font-medium mt-1">
                      ₦{product.sellingPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
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
                      >
                        <FaEye className="inline mr-1 text-xs" /> View
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setEditModalProduct(product)}
                      >
                        <FaEdit className="inline mr-1 text-xs" /> Edit
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table for md+ screens */}
          <div className="hidden md:block mt-4">
            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]">
              <table className="w-full text-sm">
                <thead className="bg-[var(--color-primary)] text-[var(--color-card)]">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">SKU</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Supplier</th>
                    <th className="px-4 py-3 text-right">Price</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const isLowStock = product.quantity <= product.minimumStock;
                    return (
                      <tr
                        key={product.id}
                        className="border-t border-[var(--color-border)] hover:bg-white/5 transition"
                      >
                        <td className="px-4 py-3 text-[var(--color-foreground)] font-medium">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-muted)]">
                          {product.sku}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-muted)]">
                          {getCategoryName(product.category)}
                        </td>
                        <td className="px-4 py-3 text-[var(--color-muted)]">
                          {getSupplierName(product.supplier)}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-foreground)]">
                          ₦{product.sellingPrice.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-[var(--color-foreground)]">
                          {product.quantity}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              isLowStock
                                ? "bg-red-500/20 text-red-400"
                                : "bg-green-500/20 text-green-400"
                            }`}
                          >
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center flex justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setViewModalProduct(product)}
                          >
                            <FaEye className="inline mr-1 text-xs" /> View
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setEditModalProduct(product)}
                          >
                            <FaEdit className="inline mr-1 text-xs" /> Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
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
  );
}
