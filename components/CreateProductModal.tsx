"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import { createProduct } from "../redux/slices/productSlice";
import { fetchAllCategories } from "../redux/slices/categorySlice";
import { fetchAllSuppliers } from "../redux/slices/supplierSlice";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import AuthGuard from "../components/AuthGuard";

interface CreateProductModalProps {
  onClose: () => void;
}

export default function CreateProductModal({
  onClose,
}: CreateProductModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector(
    (state: RootState) => state.category.categories
  );
  const suppliers = useSelector((state: RootState) => state.supplier.suppliers);

  useEffect(() => {
    dispatch(fetchAllCategories({}));
    dispatch(fetchAllSuppliers());
  }, [dispatch]);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    supplier: "",
    quantity: 0,
    minimumStock: 0,
    costPrice: 0,
    sellingPrice: 0,
    description: "",
    barcode: "",
    images: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSKU = () => {
    if (!formData.name) return;
    const slug = formData.name
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "-")
      .slice(0, 6);
    const randomNum = Math.floor(Math.random() * 900 + 100);
    setFormData((prev) => ({ ...prev, sku: `${slug}-${randomNum}` }));
  };

  const generateBarcode = () => {
    const randomCode = Math.floor(Math.random() * 900000000000 + 100000000000);
    setFormData((prev) => ({ ...prev, barcode: randomCode.toString() }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (
      ["quantity", "minimumStock", "costPrice", "sellingPrice"].includes(name)
    ) {
      const num = Number(value);
      setFormData((prev) => ({ ...prev, [name]: isNaN(num) ? 0 : num }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      ...formData,
      category: formData.category || null,
      supplier: formData.supplier || null,
      images: formData.images
        ? formData.images.split(",").map((img) => img.trim())
        : [],
      description: formData.description || "",
      barcode: formData.barcode || "",
    };

    try {
      const result = await dispatch(createProduct({ payload }));
      if (createProduct.fulfilled.match(result)) {
        onClose();
      } else {
        setError((result.payload as string) || "Failed to create product");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal */}
        <div className="relative w-full max-w-xl sm:max-w-2xl bg-[var(--color-surface)] rounded-lg shadow-2xl border border-[var(--color-border)] flex flex-col max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)]">
                New Product
              </h2>
              <p className="text-[var(--color-muted)] text-xs sm:text-sm">
                Add a product to your inventory
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors text-lg"
            >
              ×
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 grid gap-4 text-xs sm:text-sm"
            style={{
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            }}
          >
            {error && (
              <div className="text-red-500 text-xs border border-red-500/30 rounded p-2 col-span-full">
                {error}
              </div>
            )}

            {/* Name */}
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Product name"
              className="input col-span-full"
            />

            {/* SKU & Barcode */}
            <div className="grid grid-cols-2 gap-2 col-span-full">
              <div className="flex gap-1">
                <input
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="SKU"
                  className="input flex-1"
                />
                <Button size="sm" variant="secondary" onClick={generateSKU}>
                  Auto
                </Button>
              </div>

              <div className="flex gap-1">
                <input
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="Barcode"
                  className="input flex-1"
                />
                <Button size="sm" variant="secondary" onClick={generateBarcode}>
                  Auto
                </Button>
              </div>
            </div>

            {/* Category & Supplier */}
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input"
            >
              <option value="">Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              className="input"
            >
              <option value="">Supplier</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Quantity & Prices with descriptor text */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 col-span-full">
              <div className="flex flex-col">
                <span className="text-[var(--color-muted)] text-xs mb-1">
                  Quantity
                </span>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="0"
                  className="input"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[var(--color-muted)] text-xs mb-1">
                  Min Stock Alert
                </span>
                <input
                  type="number"
                  name="minimumStock"
                  value={formData.minimumStock}
                  onChange={handleChange}
                  placeholder="0"
                  className="input"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[var(--color-muted)] text-xs mb-1">
                  Cost Price (₦)
                </span>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  placeholder="0"
                  className="input"
                />
              </div>

              <div className="flex flex-col">
                <span className="text-[var(--color-muted)] text-xs mb-1">
                  Selling Price (₦)
                </span>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  placeholder="0"
                  className="input"
                />
              </div>
            </div>

            {/* Description */}
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional notes / description"
              className="input col-span-full min-h-[70px]"
            />

            {/* Images */}
            <input
              name="images"
              value={formData.images}
              onChange={handleChange}
              placeholder="Image URLs (comma separated)"
              className="input col-span-full"
            />
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
                }
              />
              Active
            </label>

            <Button size="sm" onClick={handleSubmit} disabled={loading}>
              {loading ? <Spinner /> : "Create Product"}
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
