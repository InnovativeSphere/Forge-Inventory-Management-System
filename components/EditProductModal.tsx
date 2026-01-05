"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store/store";
import { updateProduct, deleteProduct, Product } from "../redux/slices/productSlice";
import { fetchAllCategories } from "../redux/slices/categorySlice";
import { fetchAllSuppliers } from "../redux/slices/supplierSlice";
import { Button } from "../components/Button";
import { Spinner } from "../components/Spinner";
import AuthGuard from "../components/AuthGuard";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function EditProductModal({ product, onClose }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const categories = useSelector((state: RootState) => state.category.categories);
  const suppliers = useSelector((state: RootState) => state.supplier.suppliers);

  const previousQuantityRef = useRef(product.quantity);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: product.name,
    sku: product.sku,
    category: product.category ?? "",
    supplier: product.supplier ?? "",
    quantity: product.quantity,
    minimumStock: product.minimumStock,
    costPrice: product.costPrice,
    sellingPrice: product.sellingPrice,
    description: product.description ?? "",
    barcode: product.barcode ?? "",
    images: product.images?.join(", ") ?? "",
    isActive: product.isActive ?? true,
  });

  useEffect(() => {
    dispatch(fetchAllCategories({}));
    dispatch(fetchAllSuppliers());
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number" ||
        ["quantity", "minimumStock", "costPrice", "sellingPrice"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleToggleActive = () => {
    setFormData((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const handleUpdate = async () => {
    if (loading) return;

    setLoading(true);
    setMessage(null);

    const payload = {
      ...formData,
      category: formData.category || null,
      supplier: formData.supplier || null,
      images: formData.images
        ? formData.images.split(",").map((i) => i.trim())
        : [],
    };

    const result = await dispatch(updateProduct({ id: product.id, payload }));

    if (updateProduct.fulfilled.match(result)) {
      const updatedProduct = result.payload.product;
      previousQuantityRef.current = updatedProduct.quantity;

      setMessage("Product updated successfully.");
      setTimeout(onClose, 1200);
    } else {
      setMessage((result.payload as string) || "Update failed.");
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this product? This action cannot be undone.")) return;

    setLoading(true);
    const result = await dispatch(deleteProduct({ id: product.id }));
    setLoading(false);

    if (deleteProduct.fulfilled.match(result)) {
      setMessage("Product deleted.");
      setTimeout(onClose, 1000);
    } else {
      setMessage((result.payload as string) || "Delete failed.");
    }
  };

  return (
    <AuthGuard>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-[var(--color-surface)] rounded-lg shadow-2xl border border-[var(--color-border)] flex flex-col max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-5 py-3 border-b border-[var(--color-border)] flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)]">
                Edit Product
              </h2>
              <p className="text-[var(--color-muted)] text-xs sm:text-sm">
                Update product details in inventory
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
          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 grid gap-3 text-xs sm:text-sm"
               style={{ gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            {message && (
              <div className="text-sm sm:text-base col-span-full text-[var(--color-accent)] border border-[var(--color-accent)]/30 p-2 rounded">
                {message}
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col">
              <span className="text-[var(--color-muted)] text-xs mb-1">Product Name</span>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="input"
              />
            </div>

            {/* SKU */}
            <div className="flex flex-col">
              <span className="text-[var(--color-muted)] text-xs mb-1">SKU</span>
              <input
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                placeholder="SKU (auto or type manually)"
                className="input"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <span className="text-[var(--color-muted)] text-xs mb-1">Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div className="flex flex-col">
              <span className="text-[var(--color-muted)] text-xs mb-1">Supplier</span>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="input"
              >
                <option value="">Select Supplier</option>
                {suppliers.map((sup) => (
                  <option key={sup.id} value={sup.id}>
                    {sup.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity & Prices */}
            {[
              { name: "quantity", label: "Quantity", placeholder: "Units in stock" },
              { name: "minimumStock", label: "Min Stock", placeholder: "Min Stock Alert" },
              { name: "costPrice", label: "Cost Price", placeholder: "Cost ₦" },
              { name: "sellingPrice", label: "Selling Price", placeholder: "Sell ₦" },
            ].map(({ name, label, placeholder }) => (
              <div key={name} className="flex flex-col">
                <span className="text-[var(--color-muted)] text-xs mb-1">{label}</span>
                <input
                  type="number"
                  name={name}
                  value={(formData as any)[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="input"
                />
              </div>
            ))}

            {/* Description */}
            <div className="flex flex-col col-span-full">
              <span className="text-[var(--color-muted)] text-xs mb-1">Description / Notes</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Optional notes"
                className="input min-h-[70px]"
              />
            </div>

            {/* Barcode */}
            <div className="flex flex-col">
              <span className="text-[var(--color-muted)] text-xs mb-1">Barcode</span>
              <input
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="Barcode (auto or type manually)"
                className="input"
              />
            </div>

            {/* Images */}
            <div className="flex flex-col col-span-full">
              <span className="text-[var(--color-muted)] text-xs mb-1">Images</span>
              <input
                name="images"
                value={formData.images}
                onChange={handleChange}
                placeholder="Image URLs (comma separated)"
                className="input"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-[var(--color-border)] flex items-center justify-between">
            <Button size="sm" onClick={handleToggleActive} variant={formData.isActive ? "primary" : "secondary"}>
              {formData.isActive ? "Active" : "Inactive"}
            </Button>

            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpdate} disabled={loading}>
                {loading ? <Spinner /> : "Save Changes"}
              </Button>
              <Button size="sm" className="bg-red-400 hover:bg-red-500" onClick={handleDelete} disabled={loading}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
